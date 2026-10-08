package taskmanager.demo.ai.dto;
import java.util.ArrayList;
import java.util.List;

public class AiBreakdownResponse {

    private List<AiBreakdownItem> subtasks = new ArrayList<>();

    public AiBreakdownResponse() {
    }

    public AiBreakdownResponse(List<AiBreakdownItem> subtasks) {
        this.subtasks = subtasks;
    }

    public List<AiBreakdownItem> getSubtasks() {
        return subtasks;
    }

    public void setSubtasks(List<AiBreakdownItem> subtasks) {
        this.subtasks = subtasks;
    }
}
