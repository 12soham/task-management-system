package taskmanager.demo.ai.dto;

import java.util.ArrayList;
import java.util.List;

public class AiBriefingResponse {

    private String summary;
    private List<String> priorities = new ArrayList<>();
    private List<String> risks = new ArrayList<>();
    private String productivityTip;

    public AiBriefingResponse() {
    }

    public AiBriefingResponse(String summary, List<String> priorities, List<String> risks, String productivityTip) {
        this.summary = summary;
        this.priorities = priorities;
        this.risks = risks;
        this.productivityTip = productivityTip;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getPriorities() {
        return priorities;
    }

    public void setPriorities(List<String> priorities) {
        this.priorities = priorities;
    }

    public List<String> getRisks() {
        return risks;
    }

    public void setRisks(List<String> risks) {
        this.risks = risks;
    }

    public String getProductivityTip() {
        return productivityTip;
    }

    public void setProductivityTip(String productivityTip) {
        this.productivityTip = productivityTip;
    }
}
