package taskmanager.demo.task;


import taskmanager.demo.security.CustomUserDetails;
import taskmanager.demo.task.dto.TaskRequest;
import taskmanager.demo.task.dto.TaskResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(
            @RequestParam(required = false) TaskStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<TaskResponse> tasks =
                taskService.getAllTasks(userDetails.getUser(), status);

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        TaskResponse task =
                taskService.getTaskById(id, userDetails.getUser());

        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        TaskResponse createdTask =
                taskService.createTask(request, userDetails.getUser());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        TaskResponse updatedTask =
                taskService.updateTask(id, request, userDetails.getUser());

        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        taskService.deleteTask(id, userDetails.getUser());

        return ResponseEntity.ok(
                Map.of("message", "Task deleted successfully")
        );
    }
}
