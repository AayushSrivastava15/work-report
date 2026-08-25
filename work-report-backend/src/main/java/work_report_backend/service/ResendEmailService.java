package work_report_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import work_report_backend.config.ResendProperties;
import work_report_backend.entity.NotificationLog;
import work_report_backend.repository.NotificationLogRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResendEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final ResendProperties resendProperties;
    private final NotificationLogRepository notificationLogRepository;
    private final RestClient restClient;

    @org.springframework.beans.factory.annotation.Autowired
    public ResendEmailService(
            ResendProperties resendProperties,
            NotificationLogRepository notificationLogRepository
    ) {
        this(resendProperties, notificationLogRepository, RestClient.builder().build());
    }

    public ResendEmailService(
            ResendProperties resendProperties,
            NotificationLogRepository notificationLogRepository,
            RestClient restClient
    ) {
        this.resendProperties = resendProperties;
        this.notificationLogRepository = notificationLogRepository;
        this.restClient = restClient != null ? restClient : RestClient.builder().build();
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendEmail(String to, String subject, String htmlContent, String notificationType, String entityType, Long entityId) {
        if (to == null || to.isBlank()) {
            log.warn("Skipping email delivery: Recipient address is empty for type {}", notificationType);
            return;
        }

        String recipient = to.trim().toLowerCase();
        log.info("Dispatching email notification [Type: {}] to {}", notificationType, recipient);

        String apiKey = resendProperties.getApiKey();
        boolean isMockMode = !resendProperties.isEnabled() || apiKey == null || apiKey.isBlank() || apiKey.startsWith("mock_");

        if (isMockMode) {
            log.info("[MOCK EMAIL DELIVERY] To: {} | Subject: {} | Type: {}", recipient, subject, notificationType);
            saveLog(recipient, notificationType, subject, "MOCKED", "mock-msg-" + System.currentTimeMillis(), null, entityType, entityId);
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("from", resendProperties.getFormattedFrom());
            payload.put("to", List.of(recipient));
            payload.put("subject", subject);
            payload.put("html", htmlContent);

            if (resendProperties.getReplyTo() != null && !resendProperties.getReplyTo().isBlank()) {
                payload.put("reply_to", resendProperties.getReplyTo().trim());
            }

            Map<String, Object> response = restClient.post()
                    .uri(RESEND_API_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            String messageId = null;
            if (response != null && response.containsKey("id")) {
                Object idObj = response.get("id");
                messageId = idObj != null ? idObj.toString() : null;
            }

            if (messageId == null) {
                messageId = "resend-" + System.currentTimeMillis();
            }

            log.info("Email sent successfully via Resend to {} (Provider ID: {})", recipient, messageId);
            saveLog(recipient, notificationType, subject, "SENT", messageId, null, entityType, entityId);

        } catch (Exception e) {
            log.error("Failed to deliver email via Resend to {}: {}", recipient, e.getMessage());
            String errorDetails = e.getMessage() != null && e.getMessage().length() > 1900
                    ? e.getMessage().substring(0, 1900)
                    : e.getMessage();
            saveLog(recipient, notificationType, subject, "FAILED", null, errorDetails, entityType, entityId);
        }
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
