package taskmanager.demo.ai;

import taskmanager.demo.ai.dto.*;
import taskmanager.demo.task.Task;
import taskmanager.demo.task.TaskStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.*;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${app.gemini.api-key:${GEMINI_API_KEY:}}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-3.8-flash}")
    private String model;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiService() {
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    /**
     * Send prompt to Gemini API and extract text response.
     */
    public String callGemini(String prompt) {
        if (!isConfigured()) {
            return null;
        }

        try {
            // First try modern Interactions API: POST https://generativelanguage.googleapis.com/v1beta/interactions
            String interactionsUrl = "https://generativelanguage.googleapis.com/v1beta/interactions";
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "input", prompt
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(interactionsUrl))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey.trim())
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.has("output_text") && !root.get("output_text").isNull()) {
                    return root.get("output_text").asText();
                }
                // Check steps array in Interactions response
                if (root.has("steps") && root.get("steps").isArray()) {
                    for (JsonNode step : root.get("steps")) {
                        if ("model_output".equals(step.path("type").asText()) && step.has("content")) {
                            for (JsonNode content : step.get("content")) {
                                if (content.has("text")) {
                                    return content.get("text").asText();
                                }
                            }
                        }
                    }
                }
            } else {
                log.warn("Interactions API returned status {}: {}. Attempting generateContent fallback...", response.statusCode(), response.body());
            }

            // Fallback to generateContent endpoint if Interactions API returned non-200
            String fallbackUrl = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    model, apiKey.trim());

            Map<String, Object> fallbackBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            HttpRequest fallbackRequest = HttpRequest.newBuilder()
                    .uri(URI.create(fallbackUrl))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(fallbackBody)))
                    .build();

            HttpResponse<String> fallbackResponse = httpClient.send(fallbackRequest, HttpResponse.BodyHandlers.ofString());
            if (fallbackResponse.statusCode() >= 200 && fallbackResponse.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(fallbackResponse.body());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        return parts.get(0).path("text").asText();
                    }
                }
            } else {
                log.error("Gemini API error (Status {}): {}", fallbackResponse.statusCode(), fallbackResponse.body());
            }

        } catch (Exception e) {
            log.error("Failed to communicate with Google Gemini API: {}", e.getMessage());
        }

        return null;
    }

    /**
     * Enhance task title and description into professional structure.
     */
    public AiEnhanceResponse enhanceTask(AiEnhanceRequest request) {
        String prompt = String.format("""
                You are a senior agile project manager. Enhance the following task into a clear, professional, actionable work item.
                Task Title: "%s"
                Original Notes/Description: "%s"

                Respond ONLY in strict valid JSON format with no markdown fences, matching this schema:
                {
                  "enhancedTitle": "Clear, concise action-oriented title",
                  "enhancedDescription": "Detailed markdown description with Objectives, Key Deliverables/Acceptance Criteria, and Notes",
                  "suggestedDueDateDays": 3,
                  "suggestedStatus": "TODO"
                }
                """, request.getTitle(), request.getDescription() != null ? request.getDescription() : "");

        String rawResult = callGemini(prompt);
        if (rawResult != null) {
            try {
                String cleanJson = extractJson(rawResult);
                JsonNode node = objectMapper.readTree(cleanJson);
                return new AiEnhanceResponse(
                        node.path("enhancedTitle").asText(request.getTitle()),
                        node.path("enhancedDescription").asText(request.getDescription()),
                        node.path("suggestedDueDateDays").asInt(3),
                        node.path("suggestedStatus").asText("TODO")
                );
            } catch (Exception e) {
                log.warn("Failed to parse Gemini enhancement JSON: {}", e.getMessage());
            }
        }

        // Smart fallback if API key is not configured or parsing fails
        String fallbackDesc = String.format(
                "### 🎯 Objectives\n- Successfully execute: %s\n\n### ✅ Acceptance Criteria\n- [ ] Requirements reviewed and scoped\n- [ ] Implementation complete and verified\n- [ ] Quality review performed\n\n### 📝 Notes\n%s",
                request.getTitle(),
                request.getDescription() != null && !request.getDescription().isBlank() ? request.getDescription() : "Standard task guidelines apply."
        );
        return new AiEnhanceResponse(
                request.getTitle().trim(),
                fallbackDesc,
                3,
                "TODO"
        );
    }

    /**
     * Break down a complex task into actionable subtasks.
     */
    public AiBreakdownResponse breakdownTask(AiBreakdownRequest request) {
        String prompt = String.format("""
                You are an agile software architect. Break down the following task into 3 to 5 clear, sequential, actionable subtasks.
                Task Title: "%s"
                Description: "%s"

                Respond ONLY in strict valid JSON format with no markdown fences, matching this schema:
                {
                  "subtasks": [
                    {
                      "title": "Subtask title",
                      "description": "Brief 1-2 sentence description",
                      "status": "TODO",
                      "daysFromNow": 1
                    }
                  ]
                }
                """, request.getTitle(), request.getDescription() != null ? request.getDescription() : "");

        String rawResult = callGemini(prompt);
        if (rawResult != null) {
            try {
                String cleanJson = extractJson(rawResult);
                JsonNode node = objectMapper.readTree(cleanJson);
                JsonNode listNode = node.path("subtasks");
                if (listNode.isArray()) {
                    List<AiBreakdownItem> items = new ArrayList<>();
                    for (JsonNode item : listNode) {
                        items.add(new AiBreakdownItem(
                                item.path("title").asText(),
                                item.path("description").asText(),
                                item.path("status").asText("TODO"),
                                item.path("daysFromNow").asInt(2)
                        ));
                    }
                    if (!items.isEmpty()) {
                        return new AiBreakdownResponse(items);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse Gemini breakdown JSON: {}", e.getMessage());
            }
        }

        // Smart fallback subtasks
        List<AiBreakdownItem> fallbackItems = List.of(
                new AiBreakdownItem("Research & Plan " + request.getTitle(), "Define requirements, check dependencies, and draft approach.", "TODO", 1),
                new AiBreakdownItem("Implement Core Functionality", "Develop the main implementation for " + request.getTitle() + ".", "TODO", 3),
                new AiBreakdownItem("Test & Validate", "Perform verification, error handling tests, and edge case validation.", "TODO", 4),
                new AiBreakdownItem("Finalize & Review", "Review output, documentation, and mark as completed.", "TODO", 5)
        );
        return new AiBreakdownResponse(fallbackItems);
    }

    /**
     * Generate daily standup briefing from user's current tasks.
     */
    public AiBriefingResponse generateBriefing(List<Task> tasks, String userName) {
        long total = tasks.size();
        long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long todo = tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();

        LocalDate today = LocalDate.now();
        List<Task> overdue = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED && t.getDueDate() != null && t.getDueDate().isBefore(today))
                .toList();

        StringBuilder taskSummary = new StringBuilder();
        for (Task t : tasks) {
            taskSummary.append(String.format("- [%s] %s (Due: %s)\n",
                    t.getStatus(), t.getTitle(), t.getDueDate() != null ? t.getDueDate().toString() : "No date"));
        }

        String prompt = String.format("""
                You are an executive AI productivity coach. Provide a motivating, focused daily standup briefing for %s.
                Total tasks: %d | Completed: %d | In Progress: %d | Todo: %d | Overdue: %d
                Current Tasks List:
                %s

                Respond ONLY in strict valid JSON format with no markdown fences, matching this schema:
                {
                  "summary": "2-3 sentences overview of today's workload and progress sentiment",
                  "priorities": ["Top priority 1", "Top priority 2", "Top priority 3"],
                  "risks": ["Risk or overdue warning if any, or empty if none"],
                  "productivityTip": "A sharp, actionable productivity or focus tip"
                }
                """, userName, total, completed, inProgress, todo, overdue.size(), taskSummary.toString());

        String rawResult = callGemini(prompt);
        if (rawResult != null) {
            try {
                String cleanJson = extractJson(rawResult);
                JsonNode node = objectMapper.readTree(cleanJson);
                List<String> priorities = new ArrayList<>();
                node.path("priorities").forEach(p -> priorities.add(p.asText()));

                List<String> risks = new ArrayList<>();
                node.path("risks").forEach(r -> risks.add(r.asText()));

                return new AiBriefingResponse(
                        node.path("summary").asText(),
                        priorities,
                        risks,
                        node.path("productivityTip").asText()
                );
            } catch (Exception e) {
                log.warn("Failed to parse Gemini briefing JSON: {}", e.getMessage());
            }
        }

        // Smart fallback briefing
        String summary = String.format("Good day %s! You have %d active task(s) on your plate (%d In Progress, %d Todo).",
                userName, (inProgress + todo), inProgress, todo);
        List<String> priorities = new ArrayList<>();
        if (inProgress > 0) {
            priorities.add("Focus on driving your " + inProgress + " active in-progress task(s) to completion.");
        }
        if (todo > 0) {
            priorities.add("Pick up the highest-value task from your backlog.");
        }
        if (priorities.isEmpty()) {
            priorities.add("Your task list is clear! Plan new upcoming goals.");
        }

        List<String> risks = new ArrayList<>();
        if (!overdue.isEmpty()) {
            risks.add(String.format("Attention: %d task(s) have passed their due date.", overdue.size()));
        }

        String tip = "Use the 2-minute rule: if a task takes less than 2 minutes, tackle it immediately; otherwise, time-box it into 25-minute Pomodoro sessions.";

        return new AiBriefingResponse(summary, priorities, risks, tip);
    }

    /**
     * Interactive AI Chat Assistant for task and productivity queries.
     */
    public AiChatResponse chat(String userMessage, List<Task> userTasks, String userName) {
        StringBuilder taskContext = new StringBuilder();
        for (Task t : userTasks) {
            taskContext.append(String.format("- [%s] %s (Due: %s)\n",
                    t.getStatus(), t.getTitle(), t.getDueDate() != null ? t.getDueDate().toString() : "None"));
        }

        String prompt = String.format("""
                You are Gemini, an intelligent, helpful, and concise Task Management Assistant for Trello Lite.
                The user's name is: %s
                Their current board tasks:
                %s

                User question: "%s"

                Provide a direct, practical, helpful response. Keep it friendly, clear, and action-oriented.
                """, userName, taskContext.toString(), userMessage);

        String rawResult = callGemini(prompt);
        if (rawResult != null && !rawResult.isBlank()) {
            return new AiChatResponse(rawResult.trim());
        }

        // Smart fallback assistant response
        return new AiChatResponse(String.format(
                "Hello %s! I analyzed your board. You currently have %d task(s) tracked. To supercharge Gemini responses with live model intelligence, configure your GEMINI_API_KEY in the environment or application.properties! In the meantime, I can help you organize tasks, break down complex projects, and plan your sprint.",
                userName, userTasks.size()
        ));
    }

    private String extractJson(String text) {
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
