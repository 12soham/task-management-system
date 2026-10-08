package taskmanager.demo.task;



import taskmanager.demo.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserOrderByCreatedAtDesc(User user);

    List<Task> findByUserAndStatusOrderByCreatedAtDesc(
            User user,
            TaskStatus status
    );

    Optional<Task> findByIdAndUser(Long id, User user);

    long countByUser(User user);

    long countByUserAndStatus(User user, TaskStatus status);
}
