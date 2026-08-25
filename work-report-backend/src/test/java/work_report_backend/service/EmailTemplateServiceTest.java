package work_report_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmailTemplateServiceTest {

    private EmailTemplateService emailTemplateService;

    @BeforeEach
    void setUp() {
        emailTemplateService = new EmailTemplateService();
    }

    @Test
    @DisplayName("Password Reset email contains user name, reset URL, and expiration")
    void testBuildPasswordResetEmail() {
        String html = emailTemplateService.buildPasswordResetEmail("Alice", "https://app.workreport.com/reset-password?token=abc123xyz", 30);
        assertNotNull(html);
        assertTrue(html.contains("Alice"));
        assertTrue(html.contains("https://app.workreport.com/reset-password?token=abc123xyz"));
        assertTrue(html.contains("30 minutes"));
        assertTrue(html.contains("WORK REPORT"));
    }

    @Test
    @DisplayName("Welcome email contains organization name and dashboard link")
    void testBuildWelcomeEmail() {
        String html = emailTemplateService.buildWelcomeEmail("Bob", "Acme Corp", "https://app.workreport.com/login");
        assertNotNull(html);
        assertTrue(html.contains("Bob"));
        assertTrue(html.contains("Acme Corp"));
        assertTrue(html.contains("https://app.workreport.com/login"));
    }

    @Test
    @DisplayName("Team invitation email contains inviter, team, organization, role, and invite link")
    void testBuildTeamInvitationEmail() {
        String html = emailTemplateService.buildTeamInvitationEmail("Carol Admin", "Frontend Team", "Acme Corp", "MEMBER", "https://app.workreport.com/accept-invite?token=tok789", "Welcome to our team!");
        assertNotNull(html);
        assertTrue(html.contains("Carol Admin"));
        assertTrue(html.contains("Frontend Team"));
        assertTrue(html.contains("Acme Corp"));
        assertTrue(html.contains("MEMBER"));
        assertTrue(html.contains("https://app.workreport.com/accept-invite?token=tok789"));
        assertTrue(html.contains("Welcome to our team!"));
    }

    @Test
    @DisplayName("Work approved email contains employee, reviewer, and project details")
    void testBuildWorkApprovedEmail() {
        String html = emailTemplateService.buildWorkApprovedEmail("Dan", "Eve Manager", "Mobile App", "Refactored auth screen", "Excellent work!", "https://app.workreport.com/work-entries");
        assertNotNull(html);
        assertTrue(html.contains("Dan"));
        assertTrue(html.contains("Eve Manager"));
        assertTrue(html.contains("Mobile App"));
        assertTrue(html.contains("Refactored auth screen"));
    }

    @Test
    @DisplayName("Work rejected email contains reason and edit link")
    void testBuildWorkRejectedEmail() {
        String html = emailTemplateService.buildWorkRejectedEmail("Dan", "Eve Manager", "Mobile App", "Refactored auth screen", "Please add ticket reference", "https://app.workreport.com/work-entries");
        assertNotNull(html);
        assertTrue(html.contains("Dan"));
        assertTrue(html.contains("Please add ticket reference"));
    }

    @Test
    @DisplayName("Report ready email contains report title and download link")
    void testBuildReportReadyEmail() {
        String html = emailTemplateService.buildReportReadyEmail("Frank", "PDF", "2026-08-01 to 2026-08-25", "https://app.workreport.com/reports");
        assertNotNull(html);
        assertTrue(html.contains("Frank"));
        assertTrue(html.contains("2026-08-01 to 2026-08-25"));
    }

    @Test
    @DisplayName("Account notification email contains custom title and message")
    void testBuildAccountNotificationEmail() {
        String html = emailTemplateService.buildAccountNotificationEmail("Grace", "Password Changed Successfully", "Your password was updated.", "support@workreport.com");
        assertNotNull(html);
        assertTrue(html.contains("Grace"));
        assertTrue(html.contains("Password Changed Successfully"));
    }
}
