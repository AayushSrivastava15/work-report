package work_report_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;
import work_report_backend.config.ResendProperties;
import work_report_backend.entity.NotificationLog;
import work_report_backend.repository.NotificationLogRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResendEmailServiceTest {

    @Mock
    private NotificationLogRepository notificationLogRepository;

    @Mock
    private RestClient restClient;

    private ResendProperties properties;
    private ResendEmailService emailService;

    @BeforeEach
    void setUp() {
        properties = new ResendProperties();
        properties.setApiKey("mock_test_key");
        properties.setEnabled(true);
        properties.setFromEmail("onboarding@resend.dev");
        properties.setFromName("Work Report");

        emailService = new ResendEmailService(properties, notificationLogRepository, restClient);
    }

    @Test
    void testMockModeDeliveryLogsSuccessfully() {
        emailService.sendEmail("user@example.com", "Test Subject", "<p>Hello</p>", "WELCOME", "USER", 1L);

        ArgumentCaptor<NotificationLog> captor = ArgumentCaptor.forClass(NotificationLog.class);
        verify(notificationLogRepository).save(captor.capture());

        NotificationLog log = captor.getValue();
        assertEquals("user@example.com", log.getRecipientEmail());
        assertEquals("Test Subject", log.getSubject());
        assertEquals("MOCKED", log.getStatus());
        assertEquals("WELCOME", log.getNotificationType());
        assertEquals("USER", log.getRelatedEntityType());
        assertEquals(1L, log.getRelatedEntityId());
    }

    @Test
    void testSkipEmptyRecipient() {
        emailService.sendEmail("", "Test Subject", "<p>Hello</p>", "WELCOME", "USER", 1L);
        verify(notificationLogRepository, never()).save(any());
    }
}
