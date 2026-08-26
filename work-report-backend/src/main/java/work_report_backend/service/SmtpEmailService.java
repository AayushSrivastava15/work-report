package work_report_backend.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import work_report_backend.config.AppMailProperties;
import work_report_backend.entity.NotificationLog;
import work_report_backend.repository.NotificationLogRepository;

@Service
public class SmtpEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(SmtpEmailService.class);

    private final JavaMailSender mailSender;
    private final AppMailProperties mailProperties;
    private final NotificationLogRepository notificationLogRepository;

    public SmtpEmailService(
            JavaMailSender mailSender,
            AppMailProperties mailProperties,
            NotificationLogRepository notificationLogRepository
    ) {
        this.mailSender = mailSender;
        this.mailProperties = mailProperties;
        this.notificationLogRepository = notificationLogRepository;
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendEmail(String to, String subject, String htmlContent, String notificationType, String entityType, Long entityId) {
        if (to == null || to.isBlank()) {
            log.warn("Skipping email delivery: Recipient address is empty for notification type {}", notificationType);
            return;
        }

        String recipient = to.trim().toLowerCase();
        log.info("Dispatching email notification [Type: {}] to {}", notificationType, recipient);

        if (!mailProperties.isEnabled()) {
            String linkInfo = extractFirstLink(htmlContent);
            log.info("[MOCK EMAIL DELIVERY] To: {} | Subject: {} | Type: {}{}",
                    recipient, subject, notificationType, (linkInfo != null ? " | Action URL: " + linkInfo : ""));
            saveLog(recipient, notificationType, subject, "MOCKED", "mock-msg-" + System.currentTimeMillis(), null, entityType, entityId);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            if (mailProperties.getFromName() != null && !mailProperties.getFromName().isBlank()) {
                helper.setFrom(mailProperties.getFrom(), mailProperties.getFromName());
            } else {
                helper.setFrom(mailProperties.getFrom());
            }

            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            if (mailProperties.getReplyTo() != null && !mailProperties.getReplyTo().isBlank()) {
                helper.setReplyTo(mailProperties.getReplyTo().trim());
            }

            mailSender.send(message);

            String messageId = "smtp-" + System.currentTimeMillis();
            log.info("Email sent successfully via SMTP/Mailpit to {} (Type: {})", recipient, notificationType);
            saveLog(recipient, notificationType, subject, "SENT", messageId, null, entityType, entityId);

        } catch (Exception e) {
            String linkInfo = extractFirstLink(htmlContent);
            log.error("Failed to deliver email via SMTP to {} (is Mailpit running on port 1025?): {}{}",
                    recipient, e.getMessage(), (linkInfo != null ? " | Fallback Action URL: " + linkInfo : ""));

            String errorDetails = e.getMessage() != null && e.getMessage().length() > 1900
                    ? e.getMessage().substring(0, 1900)
                    : (e.getMessage() != null ? e.getMessage() : "Unknown SMTP error");

            saveLog(recipient, notificationType, subject, "FAILED", null, errorDetails, entityType, entityId);
        }
    }

    private String extractFirstLink(String html) {
        if (html == null) return null;
        int hrefIdx = html.indexOf("href=\"");
        if (hrefIdx != -1) {
            int start = hrefIdx + 6;
            int end = html.indexOf("\"", start);
            if (end != -1) {
                return html.substring(start, end);
            }
        }
        return null;
    }

    private void saveLog(String recipient, String notificationType, String subject, String status,
                         String providerMessageId, String errorMessage, String entityType, Long entityId) {
        try {
            NotificationLog logEntry = new NotificationLog(
                    recipient,
                    notificationType,
                    subject,
                    status,
                    providerMessageId,
                    errorMessage,
                    entityType,
                    entityId
            );
            notificationLogRepository.save(logEntry);
        } catch (Exception ex) {
            log.error("Failed to persist notification audit log: {}", ex.getMessage());
        }
    }
}
