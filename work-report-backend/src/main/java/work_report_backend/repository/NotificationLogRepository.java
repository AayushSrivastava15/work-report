package work_report_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import work_report_backend.entity.NotificationLog;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    List<NotificationLog> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);

    List<NotificationLog> findByNotificationTypeOrderByCreatedAtDesc(String notificationType);

    List<NotificationLog> findByStatusOrderByCreatedAtDesc(String status);

    List<NotificationLog> findByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(String relatedEntityType, Long relatedEntityId);
}
