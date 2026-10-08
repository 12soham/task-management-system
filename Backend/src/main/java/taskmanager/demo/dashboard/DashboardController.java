package taskmanager.demo.dashboard;

import taskmanager.demo.dashboard.dto.DashboardResponse;
import taskmanager.demo.security.CustomUserDetails;
import taskmanager.demo.task.TaskRepository;
import taskmanager.demo.task.TaskStatus;
import taskmanager.demo.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final TaskRepository taskRepository;

    public DashboardController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboardStats(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        long totalTasks = taskRepository.countByUser(user);
        long completedTasks = taskRepository.countByUserAndStatus(user, TaskStatus.COMPLETED);
        long inProgressTasks = taskRepository.countByUserAndStatus(user, TaskStatus.IN_PROGRESS);
        long todoTasks = taskRepository.countByUserAndStatus(user, TaskStatus.TODO);

        DashboardResponse response = new DashboardResponse(totalTasks, completedTasks, todoTasks, inProgressTasks);
        return ResponseEntity.ok(response);
    }
}