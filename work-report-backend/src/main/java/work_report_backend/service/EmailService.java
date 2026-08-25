package work_report_backend.service;

public interface EmailService {

    void sendEmail(String to, String subject, String htmlContent, String notificationType, String entityType, Long entityId);

    default void sendEmail(String to, String subject, String htmlContent) {
        sendEmail(to, subject, htmlContent, "GENERAL", null, null);
    }
}
