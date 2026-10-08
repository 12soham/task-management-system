package taskmanager.demo.ai.dto;

public class AiBreakdownItem {

    private String title;
    private String description;
    private String status;
    private Integer daysFromNow;

    public AiBreakdownItem() {
    }

    public AiBreakdownItem(String title, String description, String status, Integer daysFromNow) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.daysFromNow = daysFromNow;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getDaysFromNow() {
        return daysFromNow;
    }

    public void setDaysFromNow(Integer daysFromNow) {
        this.daysFromNow = daysFromNow;
    }
}
