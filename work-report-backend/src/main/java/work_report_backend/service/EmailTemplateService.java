package work_report_backend.service;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    private String wrapInEnterpriseLayout(String title, String badgeText, String badgeColor, String contentHtml) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>" + escapeHtml(title) + "</title>\n" +
                "  <style>\n" +
                "    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased; }\n" +
                "    table { border-collapse: collapse; }\n" +
                "    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }\n" +
                "    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 36px; text-align: left; border-bottom: 1px solid #334155; }\n" +
                "    .logo { font-size: 22px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px; text-decoration: none; display: inline-block; }\n" +
                "    .logo-subtitle { color: #94a3b8; font-size: 12px; margin-top: 4px; }\n" +
                "    .body-content { padding: 36px; }\n" +
                "    .badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; }\n" +
                "    .h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; line-height: 1.3; }\n" +
                "    .p { font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 20px 0; }\n" +
                "    .details-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 24px 0; }\n" +
                "    .details-row { margin-bottom: 8px; font-size: 14px; line-height: 1.5; }\n" +
                "    .details-row:last-child { margin-bottom: 0; }\n" +
                "    .details-label { font-weight: 600; color: #64748b; width: 130px; display: inline-block; }\n" +
                "    .details-value { font-weight: 600; color: #1e293b; }\n" +
                "    .btn-container { text-align: center; margin: 28px 0; }\n" +
                "    .btn { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }\n" +
                "    .footer { background-color: #f8fafc; padding: 24px 36px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5; }\n" +
                "    .footer a { color: #64748b; text-decoration: underline; }\n" +
                "    .footer-divider { margin: 12px 0; border: none; border-top: 1px solid #e2e8f0; }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color: #0f172a;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\" style=\"padding: 20px 10px;\">\n" +
                "        <div class=\"container\">\n" +
                "          <!-- Header -->\n" +
                "          <div class=\"header\">\n" +
                "            <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\">\n" +
                "              <tr>\n" +
                "                <td>\n" +
                "                  <span class=\"logo\">WORK REPORT</span>\n" +
                "                  <div class=\"logo-subtitle\">Enterprise Team & Analytics Platform</div>\n" +
                "                </td>\n" +
                "              </tr>\n" +
                "            </table>\n" +
                "          </div>\n" +
                "          <!-- Body Content -->\n" +
                "          <div class=\"body-content\">\n" +
                "            <div class=\"badge\" style=\"background-color: " + badgeColor + "; color: #ffffff;\">" + escapeHtml(badgeText) + "</div>\n" +
                "            <h1 class=\"h1\">" + escapeHtml(title) + "</h1>\n" +
                contentHtml +
                "          </div>\n" +
                "          <!-- Footer -->\n" +
                "          <div class=\"footer\">\n" +
                "            <div>This is an automated transactional notification from <strong>Work Report</strong>.</div>\n" +
                "            <div style=\"margin-top: 6px;\">If you did not request this action, you can safely ignore this email or contact your workspace administrator.</div>\n" +
                "            <hr class=\"footer-divider\">\n" +
                "            <div>&copy; " + java.time.Year.now().getValue() + " Work Report Inc. All rights reserved.</div>\n" +
                "          </div>\n" +
                "        </div>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";
    }

    public String buildPasswordResetEmail(String userName, String resetUrl, int expiryMinutes) {
        String content = "<p class=\"p\">Hello <strong>" + escapeHtml(userName) + "</strong>,</p>\n" +
                "<p class=\"p\">We received a request to reset your password for your Work Report account. Click the secure link below to create a new password:</p>\n" +
                "<div class=\"btn-container\">\n" +
                "  <a href=\"" + escapeHtml(resetUrl) + "\" class=\"btn\" target=\"_blank\">Reset Your Password</a>\n" +
                "</div>\n" +
                "<div class=\"details-box\">\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Expires In:</span><span class=\"details-value\">" + expiryMinutes + " minutes</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Direct Link:</span><span class=\"details-value\" style=\"word-break: break-all; font-size: 12px; color: #2563eb;\">" + escapeHtml(resetUrl) + "</span></div>\n" +
                "</div>\n" +
                "<p class=\"p\" style=\"font-size: 13px; color: #64748b;\">For security purposes, this password reset link will expire in " + expiryMinutes + " minutes and can only be used once. If you did not make this request, no action is needed and your account remains secure.</p>";

        return wrapInEnterpriseLayout("Password Reset Request", "Security Notice", "#dc2626", content);
    }

    public String buildWelcomeEmail(String userName, String orgName, String loginUrl) {
        String content = "<p class=\"p\">Welcome aboard, <strong>" + escapeHtml(userName) + "</strong>!</p>\n" +
                "<p class=\"p\">Your account on Work Report has been set up successfully and is now active for <strong>" + escapeHtml(orgName) + "</strong>.</p>\n" +
                "<div class=\"details-box\">\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Organization:</span><span class=\"details-value\">" + escapeHtml(orgName) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Account Status:</span><span class=\"details-value\" style=\"color: #16a34a;\">Active</span></div>\n" +
                "</div>\n" +
                "<div class=\"btn-container\">\n" +
                "  <a href=\"" + escapeHtml(loginUrl) + "\" class=\"btn\" target=\"_blank\">Access Your Dashboard</a>\n" +
                "</div>\n" +
                "<p class=\"p\">Start logging your daily engineering tasks, reviewing team progress, and generating automated executive summaries.</p>";

        return wrapInEnterpriseLayout("Welcome to Work Report", "Onboarding", "#2563eb", content);
    }

    public String buildTeamInvitationEmail(String inviterName, String teamName, String orgName, String role, String inviteUrl, String personalNote) {
        String noteHtml = "";
        if (personalNote != null && !personalNote.isBlank()) {
            noteHtml = "<div style=\"background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 18px 0; border-radius: 4px; font-style: italic; color: #1e3a8a; font-size: 14px;\">\"" + escapeHtml(personalNote) + "\"</div>\n";
        }

        String content = "<p class=\"p\">Hello,</p>\n" +
                "<p class=\"p\"><strong>" + escapeHtml(inviterName) + "</strong> has invited you to join the <strong>" + escapeHtml(teamName) + "</strong> team in <strong>" + escapeHtml(orgName) + "</strong> on Work Report.</p>\n" +
                noteHtml +
                "<div class=\"details-box\">\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Team:</span><span class=\"details-value\">" + escapeHtml(teamName) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Organization:</span><span class=\"details-value\">" + escapeHtml(orgName) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Assigned Role:</span><span class=\"details-value\">" + escapeHtml(role) + "</span></div>\n" +
                "</div>\n" +
                "<div class=\"btn-container\">\n" +
                "  <a href=\"" + escapeHtml(inviteUrl) + "\" class=\"btn\" target=\"_blank\">Accept Team Invitation</a>\n" +
                "</div>\n" +
                "<p class=\"p\" style=\"font-size: 13px; color: #64748b;\">This invitation link will expire in 7 days. If you do not recognize this invitation, you can ignore this email.</p>";

        return wrapInEnterpriseLayout("You're Invited to Join a Team", "Team Invitation", "#7c3aed", content);
    }

    public String buildWorkSubmittedEmail(String managerName, String employeeName, String projectName, String workTitle, String reviewUrl) {
        String content = "<p class=\"p\">Hello <strong>" + escapeHtml(managerName) + "</strong>,</p>\n" +
                "<p class=\"p\"><strong>" + escapeHtml(employeeName) + "</strong> has submitted a new work entry for your review and approval.</p>\n" +
                "<div class=\"details-box\">\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Employee:</span><span class=\"details-value\">" + escapeHtml(employeeName) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Project:</span><span class=\"details-value\">" + escapeHtml(projectName) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Work Title:</span><span class=\"details-value\">" + escapeHtml(workTitle) + "</span></div>\n" +
                "</div>\n" +
                "<div class=\"btn-container\">\n" +
                "  <a href=\"" + escapeHtml(reviewUrl) + "\" class=\"btn\" target=\"_blank\">Review Work Entry</a>\n" +
                "</div>\n" +
                "<p class=\"p\" style=\"font-size: 13px; color: #64748b;\">Prompt reviews ensure team metrics and work velocity analytics remain accurate.</p>";

        return wrapInEnterpriseLayout("Work Entry Submitted for Review", "Review Pending", "#f59e0b", content);
    }

    public String buildWorkApprovedEmail(String employeeName, String reviewerName, String projectName, String workTitle, String feedback, String viewUrl) {
        String feedbackHtml = "";
        if (feedback != null && !feedback.isBlank()) {
            feedbackHtml = "<div class=\"details-row\"><span class=\"details-label\">Feedback:</span><span class=\"details-value\" style=\"font-weight: normal; color: #166534;\">" + escapeHtml(feedback) + "</span></div>\n";
        }

        String content = "<p class=\"p\">Hello <strong>" + escapeHtml(employeeName) + "</strong>,</p>\n" +
                "<p class=\"p\">Great news! Your work entry has been <strong style=\"color: #16a34a;\">approved</strong> by <strong>" + escapeHtml(reviewerName) + "</strong>.</p>\n" +
                "<div class=\"details-box\" style=\"border-color: #bbf7d0; background-color: #f0fdf4;\">\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Project:</span><span class=\"details-value\">" + escapeHtml(projectName) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Work Title:</span><span class=\"details-value\">" + escapeHtml(workTitle) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Status:</span><span class=\"details-value\" style=\"color: #16a34a;\">APPROVED</span></div>\n" +
                feedbackHtml +
                "</div>\n" +
                "<div class=\"btn-container\">\n" +
                "  <a href=\"" + escapeHtml(viewUrl) + "\" class=\"btn\" target=\"_blank\">View in Work Entries</a>\n" +
                "</div>";

        return wrapInEnterpriseLayout("Work Entry Approved", "Approved", "#16a34a", content);
    }

    public String buildWorkRejectedEmail(String employeeName, String reviewerName, String projectName, String workTitle, String reason, String editUrl) {
        String content = "<p class=\"p\">Hello <strong>" + escapeHtml(employeeName) + "</strong>,</p>\n" +
                "<p class=\"p\">Your work entry for <strong>" + escapeHtml(projectName) + "</strong> requires updates before it can be approved.</p>\n" +
                "<div class=\"details-box\" style=\"border-color: #fecaca; background-color: #fef2f2;\">\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Project:</span><span class=\"details-value\">" + escapeHtml(projectName) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Work Title:</span><span class=\"details-value\">" + escapeHtml(workTitle) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Reviewed By:</span><span class=\"details-value\">" + escapeHtml(reviewerName) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Reason/Notes:</span><span class=\"details-value\" style=\"color: #991b1b;\">" + escapeHtml(reason != null ? reason : "Please revise work details") + "</span></div>\n" +
                "</div>\n" +
                "<div class=\"btn-container\">\n" +
                "  <a href=\"" + escapeHtml(editUrl) + "\" class=\"btn\" target=\"_blank\">Edit & Resubmit Work</a>\n" +
                "</div>";

        return wrapInEnterpriseLayout("Action Required: Work Entry Needs Revision", "Revision Needed", "#dc2626", content);
    }

    public String buildReportReadyEmail(String userName, String reportFormat, String dateRange, String downloadUrl) {
        String content = "<p class=\"p\">Hello <strong>" + escapeHtml(userName) + "</strong>,</p>\n" +
                "<p class=\"p\">Your requested work analytics report has been generated successfully and is ready for download.</p>\n" +
                "<div class=\"details-box\">\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Format:</span><span class=\"details-value\">" + escapeHtml(reportFormat) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Date Range:</span><span class=\"details-value\">" + escapeHtml(dateRange) + "</span></div>\n" +
                "</div>\n" +
                "<div class=\"btn-container\">\n" +
                "  <a href=\"" + escapeHtml(downloadUrl) + "\" class=\"btn\" target=\"_blank\">View & Download Report</a>\n" +
                "</div>";

        return wrapInEnterpriseLayout("Your Work Report Is Ready", "Report Ready", "#0284c7", content);
    }

    public String buildAccountNotificationEmail(String userName, String actionTitle, String message, String supportEmail) {
        String content = "<p class=\"p\">Hello <strong>" + escapeHtml(userName) + "</strong>,</p>\n" +
                "<p class=\"p\">" + escapeHtml(message) + "</p>\n" +
                "<div class=\"details-box\">\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Notification:</span><span class=\"details-value\">" + escapeHtml(actionTitle) + "</span></div>\n" +
                "  <div class=\"details-row\"><span class=\"details-label\">Time:</span><span class=\"details-value\">" + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm:ss")) + "</span></div>\n" +
                "</div>\n" +
                "<p class=\"p\" style=\"font-size: 13px; color: #64748b;\">If you have any questions regarding your account status, please reach out to your administrator" +
                (supportEmail != null && !supportEmail.isBlank() ? " at <a href=\"mailto:" + escapeHtml(supportEmail) + "\">" + escapeHtml(supportEmail) + "</a>" : "") + ".</p>";

        return wrapInEnterpriseLayout(actionTitle, "Account Update", "#475569", content);
    }

    public String buildAccountStatusNotificationEmail(String userName, String actionTitle, String message, String supportEmail) {
        return buildAccountNotificationEmail(userName, actionTitle, message, supportEmail);
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
