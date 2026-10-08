package taskmanager.demo.ai;

import taskmanager.demo.ai.dto.*;
import taskmanager.demo.security.CustomUserDetails;
import taskmanager.demo.task.Task;
import taskmanager.demo.task.TaskRepository;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;
    private final TaskRepository taskRepository;

    public AiController(GeminiService geminiService, TaskRepository taskRepository) {
        this.geminiService = geminiService;
        this.taskRepository = taskRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAiStatus() {
        return ResponseEntity.ok(Map.of(
                "configured", geminiService.isConfigured(),
                "model", "gemini-3.8-flash"
        ));
    }

    @PostMapping("/enhance")
    public ResponseEntity<AiEnhanceResponse> enhanceTask(@Valid @RequestBody AiEnhanceRequest request) {
        AiEnhanceResponse response = geminiService.enhanceTask(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/breakdown")
    public ResponseEntity<AiBreakdownResponse> breakdownTask(@Valid @RequestBody AiBreakdownRequest request) {
        AiBreakdownResponse response = geminiService.breakdownTask(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/briefing")
    public ResponseEntity<AiBriefingResponse> getBriefing(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<Task> tasks = taskRepository.findByUserOrderByCreatedAtDesc(userDetails.getUser());
        AiBriefingResponse response = geminiService.generateBriefing(tasks, userDetails.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<Task> tasks = taskRepository.findByUserOrderByCreatedAtDesc(userDetails.getUser());
        AiChatResponse response = geminiService.chat(request.getMessage(), tasks, userDetails.getName());
        return ResponseEntity.ok(response);
    }
}