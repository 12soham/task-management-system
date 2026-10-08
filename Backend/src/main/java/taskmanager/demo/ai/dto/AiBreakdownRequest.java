package taskmanager.demo.ai.dto;

import jakarta.validation.constraints.NotBlank;

public class AiBreakdownRequest {

    @NotBlank(message = "Title is required for task breakdown")
    private String title;

    private String description;

    public AiBreakdownRequest() {
    }

    public AiBreakdownRequest(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
