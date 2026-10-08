package taskmanager.demo.dashboard.dto;



public class DashboardResponse {

    private long totalTasks;
    private long completedTasks;
    private long todoTasks;
    private long inProgressTasks;

    public DashboardResponse() {
    }

    public DashboardResponse(
            long totalTasks,
            long completedTasks,
            long todoTasks,
            long inProgressTasks
    ) {
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.todoTasks = todoTasks;
        this.inProgressTasks = inProgressTasks;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public long getTodoTasks() {
        return todoTasks;
    }

    public void setTodoTasks(long todoTasks) {
        this.todoTasks = todoTasks;
    }

    public long getInProgressTasks() {
        return inProgressTasks;
    }

    public void setInProgressTasks(long inProgressTasks) {
        this.inProgressTasks = inProgressTasks;
    }
}
