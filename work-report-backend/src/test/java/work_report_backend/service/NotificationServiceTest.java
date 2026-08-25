package work_report_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import work_report_backend.entity.Organization;
import work_report_backend.entity.Project;
import work_report_backend.entity.User;
import work_report_backend.entity.WorkEntry;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private EmailService emailService;

    @Mock
    private EmailTemplateService emailTemplateService;

    @InjectMocks
    private NotificationService notificationService;

    private User sampleUser;
    private Organization sampleOrg;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(notificationService, "appBaseUrl", "http://localhost:5173");

        sampleOrg = new Organization("Acme", "ACME-1", "COMPANY", 1L);
        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setName("Alex Smith");
        sampleUser.setEmail("alex@example.com");
        sampleUser.setOrganization(sampleOrg);
    }

    @Test
    void testSendPasswordResetNotification() {
        when(emailTemplateService.buildPasswordResetEmail(anyString(), anyString(), anyInt()))
                .thenReturn("<html>Password Reset</html>");

        notificationService.sendPasswordResetNotification("alex@example.com", "Alex Smith", "tok123", 10L);

        verify(emailService).sendEmail(
                eq("alex@example.com"),
                contains("Password Reset Request"),
                eq("<html>Password Reset</html>"),
                eq("PASSWORD_RESET"),
                eq("USER"),
                eq(10L)
        );
    }

    @Test
    void testSendWelcomeNotification() {
        when(emailTemplateService.buildWelcomeEmail(anyString(), anyString(), anyString()))
                .thenReturn("<html>Welcome</html>");

        notificationService.sendWelcomeNotification(sampleUser);

        verify(emailService).sendEmail(
                eq("alex@example.com"),
                contains("Welcome to Work Report"),
                eq("<html>Welcome</html>"),
                eq("WELCOME"),
                eq("USER"),
                eq(10L)
        );
    }

    @Test
    void testSendWorkSubmittedNotification() {
        User manager = new User();
        manager.setEmail("manager@example.com");
        manager.setName("Manager Mike");

        Project project = new Project();
        project.setName("Frontend Overhaul");

        WorkEntry entry = new WorkEntry();
        entry.setId(99L);
        entry.setUser(sampleUser);
        entry.setProject(project);
        entry.setTitle("Implemented Resend Notifications");

        when(emailTemplateService.buildWorkSubmittedEmail(anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn("<html>Submitted</html>");

        notificationService.sendWorkSubmittedNotification(entry, List.of(manager));

        verify(emailService).sendEmail(
                eq("manager@example.com"),
                contains("Work Entry Submitted for Review"),
                eq("<html>Submitted</html>"),
                eq("WORK_SUBMITTED"),
                eq("WORK_ENTRY"),
                eq(99L)
        );
    }

    @Test
    void testSendWorkApprovedNotification() {
        User reviewer = new User();
        reviewer.setName("Reviewer Sarah");

        Project project = new Project();
        project.setName("API Layer");

        WorkEntry entry = new WorkEntry();
        entry.setId(101L);
        entry.setUser(sampleUser);
        entry.setProject(project);
        entry.setTitle("Created DTOs");

        when(emailTemplateService.buildWorkApprovedEmail(anyString(), anyString(), anyString(), anyString(), any(), anyString()))
                .thenReturn("<html>Approved</html>");

        notificationService.sendWorkApprovedNotification(entry, reviewer);

        verify(emailService).sendEmail(
                eq("alex@example.com"),
                contains("Work Entry Approved"),
                eq("<html>Approved</html>"),
                eq("WORK_APPROVED"),
                eq("WORK_ENTRY"),
                eq(101L)
        );
    }
}
