package work_report_backend.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import work_report_backend.config.AppMailProperties;
import work_report_backend.entity.NotificationLog;
import work_report_backend.repository.NotificationLogRepository;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SmtpEmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private NotificationLogRepository notificationLogRepository;

    private AppMailProperties properties;
    private SmtpEmailService emailService;

    @BeforeEach
    void setUp() {
        properties = new AppMailProperties();
        properties.setEnabled(true);
        properties.setFrom("noreply@workreport.local");
        properties.setFromName("Work Report");

        emailService = new SmtpEmailService(mailSender, properties, notificationLogRepository);
    }

    @Test
    void testSendEmailSuccess() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendEmail("user@example.com", "Test Subject", "<p>Hello</p>", "WELCOME", "USER", 1L);

        verify(mailSender).send(mimeMessage);

        ArgumentCaptor<NotificationLog> captor = ArgumentCaptor.forClass(NotificationLog.class);
        verify(notificationLogRepository).save(captor.capture());

        NotificationLog log = captor.getValue();
        assertEquals("user@example.com", log.getRecipientEmail());
        assertEquals("Test Subject", log.getSubject());
        assertEquals("SENT", log.getStatus());
        assertEquals("WELCOME", log.getNotificationType());
        assertEquals("USER", log.getRelatedEntityType());
        assertEquals(1L, log.getRelatedEntityId());
    }

    @Test
    void testDisabledMailModeDeliveryLogsMocked() {
        properties.setEnabled(false);

        emailService.sendEmail("user@example.com", "Test Subject", "<p>Hello</p>", "WELCOME", "USER", 1L);

        verify(mailSender, never()).send(any(MimeMessage.class));

        ArgumentCaptor<NotificationLog> captor = ArgumentCaptor.forClass(NotificationLog.class);
        verify(notificationLogRepository).save(captor.capture());

        NotificationLog log = captor.getValue();
        assertEquals("user@example.com", log.getRecipientEmail());
        assertEquals("Test Subject", log.getSubject());
        assertEquals("MOCKED", log.getStatus());
    }

    @Test
    void testSkipEmptyRecipient() {
        emailService.sendEmail("", "Test Subject", "<p>Hello</p>", "WELCOME", "USER", 1L);
        verify(notificationLogRepository, never()).save(any());
        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
