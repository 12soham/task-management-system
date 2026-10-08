package taskmanager.demo.task;


import taskmanager.demo.exception.ResourceNotFoundException;
import taskmanager.demo.task.dto.TaskRequest;
import taskmanager.demo.task.dto.TaskResponse;
import taskmanager.demo.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks(User user, TaskStatus status) {

        List<Task> tasks;

        if (status != null) {
            tasks = taskRepository.findByUserAndStatusOrderByCreatedAtDesc(user, status);
        } else {
            tasks = taskRepository.findByUserOrderByCreatedAtDesc(user);
        }

        return tasks.stream()
                .map(TaskResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id, User user) {

        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Task not found with id: " + id
                        )
                );

        return TaskResponse.fromEntity(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request, User user) {

        TaskStatus status =
                request.getStatus() != null
                        ? request.getStatus()
                        : TaskStatus.TODO;

        Task task = new Task(
                request.getTitle().trim(),
                request.getDescription(),
                status,
                request.getDueDate(),
                user
        );

        Task savedTask = taskRepository.save(task);

        return TaskResponse.fromEntity(savedTask);
    }

    @Transactional
    public TaskResponse updateTask(
            Long id,
            TaskRequest request,
            User user
    ) {

        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Task not found with id: " + id
                        )
                );

        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        task.setDueDate(request.getDueDate());

        Task updatedTask = taskRepository.save(task);

        return TaskResponse.fromEntity(updatedTask);
    }

    @Transactional
    public void deleteTask(Long id, User user) {

        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Task not found with id: " + id
                        )
                );

        taskRepository.delete(task);
    }
}
