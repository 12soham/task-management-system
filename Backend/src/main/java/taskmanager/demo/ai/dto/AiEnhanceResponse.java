package taskmanager.demo.ai.dto;

public class AiEnhanceResponse {

    private String enhancedTitle;
    private String enhancedDescription;
    private Integer suggestedDueDateDays;
    private String suggestedStatus;

    public AiEnhanceResponse() {
    }

    public AiEnhanceResponse(String enhancedTitle, String enhancedDescription, Integer suggestedDueDateDays, String suggestedStatus) {
        this.enhancedTitle = enhancedTitle;
        this.enhancedDescription = enhancedDescription;
        this.suggestedDueDateDays = suggestedDueDateDays;
        this.suggestedStatus = suggestedStatus;
    }

    public String getEnhancedTitle() {
        return enhancedTitle;
    }

    public void setEnhancedTitle(String enhancedTitle) {
        this.enhancedTitle = enhancedTitle;
    }

    public String getEnhancedDescription() {
        return enhancedDescription;
    }

    public void setEnhancedDescription(String enhancedDescription) {
        this.enhancedDescription = enhancedDescription;
    }

    public Integer getSuggestedDueDateDays() {
        return suggestedDueDateDays;
    }

    public void setSuggestedDueDateDays(Integer suggestedDueDateDays) {
        this.suggestedDueDateDays = suggestedDueDateDays;
    }

    public String getSuggestedStatus() {
        return suggestedStatus;
    }

    public void setSuggestedStatus(String suggestedStatus) {
        this.suggestedStatus = suggestedStatus;
    }
}
