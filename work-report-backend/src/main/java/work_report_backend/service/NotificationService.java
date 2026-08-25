package work_report_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import work_report_backend.entity.User;
import work_report_backend.entity.WorkEntry;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    @Value("${app.base-url:http://localhost:5173}")
    private String appBaseUrl;

    public NotificationService(EmailService emailService, EmailTemplateService emailTemplateService) {
        this.emailService = emailService;
        this.emailTemplateService = emailTemplateService;
    }

    // ── 1. Password Reset ────────────────────────────────────────────────────────
    public void sendPasswordResetNotification(String recipientEmail, String userName, String resetToken, Long userId) {
        try {
            String baseUrl = normalizeBaseUrl(appBaseUrl);
            String resetUrl = baseUrl + "/reset-password?token=" + resetToken;
            String subject = "Password Reset Request - Work Report";
            String html = emailTemplateService.buildPasswordResetEmail(userName, resetUrl, 30);

            emailService.sendEmail(recipientEmail, subject, html, "PASSWORD_RESET", "USER", userId);
        } catch (Exception e) {
            log.error("Failed to dispatch password reset notification to {}: {}", recipientEmail, e.getMessage());
        }
    }

    // ── 2. Welcome Notification ──────────────────────────────────────────────────
    public void sendWelcomeNotification(User user) {
        if (user == null || user.getEmail() == null) return;
        String orgName = user.getOrganization() != null ? user.getOrganization().getName() : "Your Workspace";
        sendWelcomeNotification(user.getEmail(), user.getName(), orgName, user.getId());
    }

    public void sendWelcomeNotification(String recipientEmail, String userName, String orgName, Long userId) {
        try {
            String baseUrl = normalizeBaseUrl(appBaseUrl);
            String loginUrl = baseUrl + "/login";
            String subject = "Welcome to Work Report - Your Account is Active";
            String html = emailTemplateService.buildWelcomeEmail(userName, orgName != null ? orgName : "Your Workspace", loginUrl);

            emailService.sendEmail(recipientEmail, subject, html, "WELCOME", "USER", userId);
        } catch (Exception e) {
            log.error("Failed to dispatch welcome notification to {}: {}", recipientEmail, e.getMessage());
        }
    }

    // ── 3. Team Invitation ───────────────────────────────────────────────────────
    public void sendTeamInvitationNotification(String recipientEmail, String inviterName, String teamName,
                                               String orgName, String role, String inviteToken, String personalNote,
                                               Long invitationId) {
        try {
            String baseUrl = normalizeBaseUrl(appBaseUrl);
            String inviteUrl = baseUrl + "/accept-invite?token=" + inviteToken;
            String subject = "You've been invited to join team " + teamName + " on Work Report";
            String html = emailTemplateService.buildTeamInvitationEmail(
                    inviterName,
                    teamName,
                    orgName != null ? orgName : "Work Report Workspace",
                    role != null ? role : "MEMBER",
                    inviteUrl,
                    personalNote
            );

            emailService.sendEmail(recipientEmail, subject, html, "TEAM_INVITATION", "TEAM_INVITATION", invitationId);
        } catch (Exception e) {
            log.error("Failed to dispatch team invitation notification to {}: {}", recipientEmail, e.getMessage());
        }
    }

    // ── 4. Work Submitted ────────────────────────────────────────────────────────
    public void sendWorkSubmittedNotification(WorkEntry entry, List<User> reviewers) {
        if (entry == null || reviewers == null || reviewers.isEmpty()) return;
        String empName = entry.getUser() != null ? entry.getUser().getName() : "Team Member";
        String projName = entry.getProject() != null ? entry.getProject().getName() : "General";
        String workTitle = entry.getTitle();

        for (User reviewer : reviewers) {
            if (reviewer != null && reviewer.getEmail() != null) {
                sendWorkSubmittedNotification(reviewer.getEmail(), reviewer.getName(), empName, projName, workTitle, entry.getId());
            }
        }
    }

    public void sendWorkSubmittedNotification(String managerEmail, String managerName, String employeeName,
                                              String projectName, String workTitle, Long workEntryId) {
        try {
            String baseUrl = normalizeBaseUrl(appBaseUrl);
            String reviewUrl = baseUrl + "/work-entries";
            String subject = "Work Entry Submitted for Review: " + projectName;
            String html = emailTemplateService.buildWorkSubmittedEmail(
                    managerName != null ? managerName : "Team Manager",
                    employeeName,
                    projectName,
                    workTitle,
                    reviewUrl
            );

            emailService.sendEmail(managerEmail, subject, html, "WORK_SUBMITTED", "WORK_ENTRY", workEntryId);
        } catch (Exception e) {
            log.error("Failed to dispatch work submission notification to {}: {}", managerEmail, e.getMessage());
        }
    }

    // ── 5. Work Approved ─────────────────────────────────────────────────────────
    public void sendWorkApprovedNotification(WorkEntry entry, User reviewer) {
        if (entry == null || entry.getUser() == null || entry.getUser().getEmail() == null) return;
        String empEmail = entry.getUser().getEmail();
        String empName = entry.getUser().getName();
        String revName = reviewer != null ? reviewer.getName() : "Administrator";
        String projName = entry.getProject() != null ? entry.getProject().getName() : "General";
        String workTitle = entry.getTitle();

        sendWorkApprovedNotification(empEmail, empName, revName, projName, workTitle, null, entry.getId());
    }

    public void sendWorkApprovedNotification(String employeeEmail, String employeeName, String reviewerName,
                                             String projectName, String workTitle, String feedback, Long workEntryId) {
        try {
            String baseUrl = normalizeBaseUrl(appBaseUrl);
            String viewUrl = baseUrl + "/work-entries";
            String subject = "Work Entry Approved: " + projectName;
            String html = emailTemplateService.buildWorkApprovedEmail(
                    employeeName,
                    reviewerName != null ? reviewerName : "Manager",
                    projectName,
                    workTitle,
                    feedback,
                    viewUrl
            );

            emailService.sendEmail(employeeEmail, subject, html, "WORK_APPROVED", "WORK_ENTRY", workEntryId);
        } catch (Exception e) {
            log.error("Failed to dispatch work approval notification to {}: {}", employeeEmail, e.getMessage());
        }
    }

    // ── 6. Work Rejected / Revision Requested ───────────────────────────────────
    public void sendWorkRejectedNotification(WorkEntry entry, User reviewer, String reason) {
        if (entry == null || entry.getUser() == null || entry.getUser().getEmail() == null) return;
        String empEmail = entry.getUser().getEmail();
        String empName = entry.getUser().getName();
        String revName = reviewer != null ? reviewer.getName() : "Reviewer";
        String projName = entry.getProject() != null ? entry.getProject().getName() : "General";
        String workTitle = entry.getTitle();

        sendWorkRejectedNotification(empEmail, empName, revName, projName, workTitle, reason, entry.getId());
    }

    public void sendWorkRejectedNotification(String employeeEmail, String employeeName, String reviewerName,
                                             String projectName, String workTitle, String reason, Long workEntryId) {
        try {
            String baseUrl = normalizeBaseUrl(appBaseUrl);
            String editUrl = baseUrl + "/work-entries";
            String subject = "Revision Needed: Work Entry for " + projectName;
            String html = emailTemplateService.buildWorkRejectedEmail(
                    employeeName,
                    reviewerName != null ? reviewerName : "Reviewer",
                    projectName,
                    workTitle,
                    reason,
                    editUrl
            );

            emailService.sendEmail(employeeEmail, subject, html, "WORK_REJECTED", "WORK_ENTRY", workEntryId);
        } catch (Exception e) {
            log.error("Failed to dispatch work rejection notification to {}: {}", employeeEmail, e.getMessage());
        }
    }

    // ── 7. Report Ready ──────────────────────────────────────────────────────────
    public void sendReportReadyNotification(String recipientEmail, String userName, String reportFormat,
                                            String dateRange, Long reportId) {
        try {
            String baseUrl = normalizeBaseUrl(appBaseUrl);
            String downloadUrl = baseUrl + "/reports";
            String subject = "Your Work Report is Ready (" + reportFormat + ")";
            String html = emailTemplateService.buildReportReadyEmail(
                    userName,
                    reportFormat,
                    dateRange != null ? dateRange : "Recent Period",
                    downloadUrl
            );

            emailService.sendEmail(recipientEmail, subject, html, "REPORT_READY", "REPORT", reportId);
        } catch (Exception e) {
            log.error("Failed to dispatch report ready notification to {}: {}", recipientEmail, e.getMessage());
        }
    }

    // ── 8. Account & Security Status Notifications ──────────────────────────────
    public void sendUserApprovedNotification(User user, String approvedByEmail) {
        if (user == null || user.getEmail() == null) return;
        String msg = "Your account registration for " +
                (user.getOrganization() != null ? user.getOrganization().getName() : "the organization") +
                " has been approved by " + approvedByEmail + ". You now have full access to log work entries and view reports.";
        sendAccountStatusNotification(user.getEmail(), user.getName(), "Account Approved", msg, user.getId());
    }

    public void sendUserRejectedNotification(User user, String reason) {
        if (user == null || user.getEmail() == null) return;
        String msg = "Your account registration request could not be approved at this time. Reason: " +
                (reason != null && !reason.isBlank() ? reason : "Administrative decision") + ".";
        sendAccountStatusNotification(user.getEmail(), user.getName(), "Account Registration Update", msg, user.getId());
    }

    public void sendPasswordChangedNotification(User user) {
        if (user == null || user.getEmail() == null) return;
        String msg = "Your Work Report account password was recently updated. If you did not make this change, please reach out to your administrator immediately.";
        sendAccountStatusNotification(user.getEmail(), user.getName(), "Password Changed Successfully", msg, user.getId());
    }

    public void sendRoleChangedNotification(User user, String newRole, String actorEmail) {
        if (user == null || user.getEmail() == null) return;
        String msg = "Your permissions role on Work Report has been updated to " + newRole + " by " + actorEmail + ".";
        sendAccountStatusNotification(user.getEmail(), user.getName(), "Account Role Updated", msg, user.getId());
    }

    public void sendAccountStatusNotification(String recipientEmail, String userName, String actionTitle,
                                              String message, Long userId) {
        try {
            String subject = actionTitle + " - Work Report";
            String html = emailTemplateService.buildAccountNotificationEmail(
                    userName,
                    actionTitle,
                    message,
                    "support@workreport.dev"
            );

            emailService.sendEmail(recipientEmail, subject, html, "ACCOUNT_STATUS", "USER", userId);
        } catch (Throwable e) {
            log.error("Failed to dispatch account status notification to {}: {}", recipientEmail, e.getMessage());
        }
    }

    private String normalizeBaseUrl(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:5173";
        }
        String trimmed = url.trim();
        if (trimmed.endsWith("/")) {
            return trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
