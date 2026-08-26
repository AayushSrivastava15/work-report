package work_report_backend.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;

/**
 * Professional HTML Email Template Service.
 * All templates use table-based, inline-CSS layouts for maximum email client compatibility.
 * Design system: Dark slate header, white body, premium call-to-action buttons.
 */
@Service
public class EmailTemplateService {

    // ─────────────────────────────────────────────────────────────────────────
    //  SHARED LAYOUT WRAPPER
    // ─────────────────────────────────────────────────────────────────────────

    private String wrapInEnterpriseLayout(String previewText, String badgeText, String badgeColor, String contentHtml) {
        String year = String.valueOf(Year.now().getValue());

        return "<!DOCTYPE html>\n"
            + "<html lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\">\n"
            + "<head>\n"
            + "  <meta charset=\"UTF-8\" />\n"
            + "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n"
            + "  <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n"
            + "  <title>Work Report</title>\n"
            + "  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->\n"
            + "  <style type=\"text/css\">\n"
            + "    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');\n"
            + "    body, html { margin: 0; padding: 0; width: 100%; background-color: #f1f5f9; }\n"
            + "    body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }\n"
            + "    img { border: 0; display: block; }\n"
            + "    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }\n"
            + "    .preheader { display: none !important; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #f1f5f9; mso-hide: all; }\n"
            + "    @media only screen and (max-width: 620px) {\n"
            + "      .email-wrapper { width: 100% !important; }\n"
            + "      .email-container { width: 100% !important; max-width: 100% !important; }\n"
            + "      .body-pad { padding: 24px 20px !important; }\n"
            + "      .btn-block { width: 100% !important; text-align: center !important; }\n"
            + "    }\n"
            + "  </style>\n"
            + "</head>\n"
            + "<body style=\"margin:0;padding:0;background-color:#f1f5f9;font-family:'Inter',Helvetica,Arial,sans-serif;\">\n"
            + "  <!-- Preview text -->\n"
            + "  <span class=\"preheader\">" + escapeHtml(previewText) + "</span>\n"
            + "\n"
            + "  <!-- Email wrapper -->\n"
            + "  <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\" style=\"background-color:#f1f5f9;\">\n"
            + "    <tr>\n"
            + "      <td align=\"center\" style=\"padding:32px 10px;\">\n"
            + "\n"
            + "        <!-- Email container -->\n"
            + "        <table width=\"600\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\" class=\"email-container\"\n"
            + "               style=\"max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(15,23,42,0.12);\">\n"
            + "\n"
            // ── TOP BADGE ──
            + "          <!-- Badge bar -->\n"
            + "          <tr>\n"
            + "            <td style=\"background:" + badgeColor + ";padding:0;height:4px;font-size:0;line-height:0;\">&nbsp;</td>\n"
            + "          </tr>\n"
            + "\n"
            // ── HEADER ──
            + "          <!-- Header -->\n"
            + "          <tr>\n"
            + "            <td style=\"background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:36px 48px 32px;\">\n"
            + "              <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\">\n"
            + "                <tr>\n"
            + "                  <td valign=\"middle\">\n"
            // Logo mark icon (inline SVG as image/text fallback)
            + "                    <table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\">\n"
            + "                      <tr>\n"
            + "                        <td valign=\"middle\" style=\"width:42px;height:42px;background:linear-gradient(135deg,#3b82f6 0%,#6366f1 100%);border-radius:10px;text-align:center;\">\n"
            + "                          <span style=\"font-size:20px;color:#ffffff;font-weight:800;display:inline-block;line-height:42px;\">W</span>\n"
            + "                        </td>\n"
            + "                        <td valign=\"middle\" style=\"padding-left:14px;\">\n"
            + "                          <div style=\"font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;line-height:1;\">Work Report</div>\n"
            + "                          <div style=\"font-size:12px;color:#94a3b8;margin-top:3px;letter-spacing:0.3px;\">Enterprise Analytics Platform</div>\n"
            + "                        </td>\n"
            + "                      </tr>\n"
            + "                    </table>\n"
            + "                  </td>\n"
            + "                  <td valign=\"middle\" align=\"right\">\n"
            + "                    <span style=\"display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.14);border-radius:9999px;padding:5px 12px;font-size:11px;font-weight:600;color:#cbd5e1;letter-spacing:0.6px;text-transform:uppercase;\">"
            + escapeHtml(badgeText) + "</span>\n"
            + "                  </td>\n"
            + "                </tr>\n"
            + "              </table>\n"
            + "            </td>\n"
            + "          </tr>\n"
            + "\n"
            // ── BODY ──
            + "          <!-- Body content -->\n"
            + "          <tr>\n"
            + "            <td class=\"body-pad\" style=\"padding:44px 48px 36px;\">\n"
            + contentHtml
            + "            </td>\n"
            + "          </tr>\n"
            + "\n"
            // ── DIVIDER ──
            + "          <tr>\n"
            + "            <td style=\"padding:0 48px;\"><div style=\"height:1px;background:linear-gradient(to right,transparent,#e2e8f0,transparent);\"></div></td>\n"
            + "          </tr>\n"
            + "\n"
            // ── FOOTER ──
            + "          <!-- Footer -->\n"
            + "          <tr>\n"
            + "            <td style=\"padding:28px 48px 32px;background:#f8fafc;\">\n"
            + "              <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\">\n"
            + "                <tr>\n"
            + "                  <td align=\"center\">\n"
            + "                    <p style=\"margin:0 0 8px;font-size:12px;color:#94a3b8;line-height:1.6;\">This is an automated notification from <strong style=\"color:#64748b;\">Work Report</strong>.</p>\n"
            + "                    <p style=\"margin:0 0 16px;font-size:12px;color:#94a3b8;line-height:1.6;\">If you didn&rsquo;t request this, you can safely ignore this email &mdash; your account remains secure.</p>\n"
            + "                    <p style=\"margin:0;font-size:11px;color:#cbd5e1;\">&copy; " + year + " Work Report Inc. &middot; All rights reserved.</p>\n"
            + "                  </td>\n"
            + "                </tr>\n"
            + "              </table>\n"
            + "            </td>\n"
            + "          </tr>\n"
            + "\n"
            + "        </table>\n"
            + "        <!-- /Email container -->\n"
            + "\n"
            + "      </td>\n"
            + "    </tr>\n"
            + "  </table>\n"
            + "  <!-- /Email wrapper -->\n"
            + "\n"
            + "</body>\n"
            + "</html>";
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  SHARED COMPONENTS
    // ─────────────────────────────────────────────────────────────────────────

    /** Renders a full-width primary CTA button */
    private String ctaButton(String url, String label, String bgColor) {
        return "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\" style=\"margin:28px 0;\">\n"
            + "  <tr>\n"
            + "    <td align=\"center\">\n"
            + "      <table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\">\n"
            + "        <tr>\n"
            + "          <td style=\"border-radius:10px;background:" + bgColor + ";box-shadow:0 4px 14px rgba(0,0,0,0.18);\">\n"
            + "            <a href=\"" + escapeHtml(url) + "\" target=\"_blank\" rel=\"noopener noreferrer\"\n"
            + "               style=\"display:inline-block;padding:15px 40px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.2px;font-family:'Inter',Helvetica,Arial,sans-serif;\">"
            + escapeHtml(label) + "</a>\n"
            + "          </td>\n"
            + "        </tr>\n"
            + "      </table>\n"
            + "    </td>\n"
            + "  </tr>\n"
            + "</table>\n";
    }

    /** Renders a styled details/info card */
    private String infoCard(String borderColor, String bgColor, String... rows) {
        StringBuilder sb = new StringBuilder();
        sb.append("<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\"\n")
          .append("       style=\"border:1.5px solid ").append(borderColor).append(";background:").append(bgColor)
          .append(";border-radius:10px;margin:24px 0;overflow:hidden;\">\n");
        for (String row : rows) {
            sb.append(row);
        }
        sb.append("</table>\n");
        return sb.toString();
    }

    /** Renders a single info-card row */
    private String infoRow(String label, String value, String valueColor) {
        return "  <tr>\n"
            + "    <td style=\"padding:12px 20px;border-bottom:1px solid rgba(0,0,0,0.05);\">\n"
            + "      <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\">\n"
            + "        <tr>\n"
            + "          <td width=\"140\" valign=\"top\" style=\"font-size:13px;font-weight:600;color:#94a3b8;padding-right:12px;\">" + escapeHtml(label) + "</td>\n"
            + "          <td valign=\"top\" style=\"font-size:13px;font-weight:600;color:" + valueColor + ";\">" + value + "</td>\n"
            + "        </tr>\n"
            + "      </table>\n"
            + "    </td>\n"
            + "  </tr>\n";
    }

    /** Renders the standard closing fallback link */
    private String fallbackLink(String url) {
        return "<p style=\"margin:20px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;text-align:center;\">"
            + "Button not working? <a href=\"" + escapeHtml(url) + "\" target=\"_blank\" "
            + "style=\"color:#3b82f6;word-break:break-all;\">" + escapeHtml(url) + "</a></p>\n";
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  1. PASSWORD RESET
    // ─────────────────────────────────────────────────────────────────────────

    public String buildPasswordResetEmail(String userName, String resetUrl, int expiryMinutes) {
        String content =
            "<h1 style=\"margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;line-height:1.25;\">Reset your password</h1>\n"
          + "<p style=\"margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.7;\">Hi <strong style=\"color:#1e293b;\">" + escapeHtml(userName) + "</strong>, we received a request to reset your Work Report account password. Click the button below to create a new one.</p>\n"

          + ctaButton(resetUrl, "Reset My Password", "linear-gradient(135deg,#3b82f6 0%,#6366f1 100%)")

          + infoCard("#e2e8f0", "#f8fafc",
                infoRow("Requested at", escapeHtml(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy · HH:mm"))), "#1e293b"),
                infoRow("Expires in", expiryMinutes + " minutes", "#dc2626"),
                infoRow("Single use", "This link becomes invalid after use", "#1e293b")
            )

          + "<p style=\"margin:0;font-size:13px;color:#94a3b8;line-height:1.7;\">"
          + "If you didn&rsquo;t request a password reset, no action is needed &mdash; your account remains secure. "
          + "For security concerns, please contact your workspace administrator immediately.</p>\n"

          + fallbackLink(resetUrl);

        return wrapInEnterpriseLayout(
            "Reset your Work Report password – link expires in " + expiryMinutes + " minutes",
            "Security Notice",
            "linear-gradient(90deg,#3b82f6,#6366f1)",
            content
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  2. WELCOME / ACCOUNT APPROVED
    // ─────────────────────────────────────────────────────────────────────────

    public String buildWelcomeEmail(String userName, String orgName, String loginUrl) {
        String content =
            "<h1 style=\"margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;line-height:1.25;\">Welcome aboard, " + escapeHtml(userName) + "! 🎉</h1>\n"
          + "<p style=\"margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.7;\">Your Work Report account has been set up and is now <strong style=\"color:#16a34a;\">active</strong> for <strong style=\"color:#1e293b;\">" + escapeHtml(orgName) + "</strong>. You&rsquo;re all set to start logging work, tracking progress, and generating analytics.</p>\n"

          + ctaButton(loginUrl, "Go to My Dashboard →", "linear-gradient(135deg,#16a34a 0%,#15803d 100%)")

          + infoCard("#bbf7d0", "#f0fdf4",
                infoRow("Organization", escapeHtml(orgName), "#166534"),
                infoRow("Account Status", "<span style=\"display:inline-block;background:#dcfce7;color:#166534;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:700;\">ACTIVE</span>", "#166534"),
                infoRow("Access Level", "Personal Workspace", "#166534")
            )

          + "<p style=\"margin:0;font-size:13px;color:#94a3b8;line-height:1.7;\">Start by logging your first daily work entry, creating a project, or exploring the analytics dashboard.</p>\n";

        return wrapInEnterpriseLayout(
            "Welcome to Work Report – Your account is now active",
            "Onboarding",
            "linear-gradient(90deg,#16a34a,#22c55e)",
            content
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  3. TEAM INVITATION
    // ─────────────────────────────────────────────────────────────────────────

    public String buildTeamInvitationEmail(String inviterName, String teamName, String orgName, String role, String inviteUrl, String personalNote) {

        String noteHtml = "";
        if (personalNote != null && !personalNote.isBlank()) {
            noteHtml = "<table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\"\n"
                + "       style=\"border-left:4px solid #3b82f6;background:#eff6ff;border-radius:0 8px 8px 0;margin:0 0 24px;\">\n"
                + "  <tr><td style=\"padding:14px 18px;font-size:14px;color:#1d4ed8;font-style:italic;line-height:1.6;\">&ldquo;" + escapeHtml(personalNote) + "&rdquo;</td></tr>\n"
                + "</table>\n";
        }

        String content =
            "<h1 style=\"margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;line-height:1.25;\">You&rsquo;ve been invited to join a team</h1>\n"
          + "<p style=\"margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.7;\"><strong style=\"color:#1e293b;\">" + escapeHtml(inviterName) + "</strong> has invited you to join the <strong style=\"color:#1e293b;\">" + escapeHtml(teamName) + "</strong> team in <strong style=\"color:#1e293b;\">" + escapeHtml(orgName) + "</strong> on Work Report.</p>\n"

          + noteHtml

          + infoCard("#e9d5ff", "#faf5ff",
                infoRow("Team", escapeHtml(teamName), "#6d28d9"),
                infoRow("Organization", escapeHtml(orgName), "#6d28d9"),
                infoRow("Assigned Role", "<span style=\"display:inline-block;background:#ede9fe;color:#5b21b6;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:700;\">" + escapeHtml(role.toUpperCase()) + "</span>", "#6d28d9"),
                infoRow("Invited by", escapeHtml(inviterName), "#6d28d9")
            )

          + ctaButton(inviteUrl, "Accept Team Invitation →", "linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)")

          + "<p style=\"margin:0;font-size:13px;color:#94a3b8;line-height:1.7;\">This invitation link will expire in <strong>7 days</strong>. If you don&rsquo;t recognise this invitation or weren&rsquo;t expecting it, you can safely ignore this email.</p>\n"

          + fallbackLink(inviteUrl);

        return wrapInEnterpriseLayout(
            "You've been invited to join " + teamName + " on Work Report",
            "Team Invitation",
            "linear-gradient(90deg,#7c3aed,#a855f7)",
            content
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  4. WORK ENTRY SUBMITTED FOR REVIEW
    // ─────────────────────────────────────────────────────────────────────────

    public String buildWorkSubmittedEmail(String managerName, String employeeName, String projectName, String workTitle, String reviewUrl) {
        String content =
            "<h1 style=\"margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;line-height:1.25;\">Work entry pending your review</h1>\n"
          + "<p style=\"margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.7;\">Hi <strong style=\"color:#1e293b;\">" + escapeHtml(managerName) + "</strong>, <strong style=\"color:#1e293b;\">" + escapeHtml(employeeName) + "</strong> has submitted a new work entry that requires your review and approval.</p>\n"

          + infoCard("#fde68a", "#fffbeb",
                infoRow("Submitted by", escapeHtml(employeeName), "#92400e"),
                infoRow("Project", escapeHtml(projectName), "#92400e"),
                infoRow("Work Title", escapeHtml(workTitle), "#92400e"),
                infoRow("Status", "<span style=\"display:inline-block;background:#fef3c7;color:#92400e;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:700;\">PENDING REVIEW</span>", "#92400e"),
                infoRow("Submitted at", escapeHtml(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy · HH:mm"))), "#92400e")
            )

          + ctaButton(reviewUrl, "Review Work Entry →", "linear-gradient(135deg,#d97706 0%,#b45309 100%)")

          + "<p style=\"margin:0;font-size:13px;color:#94a3b8;line-height:1.7;\">Prompt reviews keep team velocity metrics accurate and ensure employees receive timely feedback on their work.</p>\n";

        return wrapInEnterpriseLayout(
            employeeName + " submitted a work entry for your review",
            "Review Pending",
            "linear-gradient(90deg,#d97706,#f59e0b)",
            content
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  5. WORK ENTRY APPROVED
    // ─────────────────────────────────────────────────────────────────────────

    public String buildWorkApprovedEmail(String employeeName, String reviewerName, String projectName, String workTitle, String feedback, String viewUrl) {
        String feedbackRow = (feedback != null && !feedback.isBlank())
            ? infoRow("Reviewer Note", escapeHtml(feedback), "#166534")
            : "";

        String content =
            "<h1 style=\"margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;line-height:1.25;\">Your work entry was approved ✅</h1>\n"
          + "<p style=\"margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.7;\">Hi <strong style=\"color:#1e293b;\">" + escapeHtml(employeeName) + "</strong>, great news! <strong style=\"color:#1e293b;\">" + escapeHtml(reviewerName) + "</strong> has reviewed and approved your work entry.</p>\n"

          + infoCard("#bbf7d0", "#f0fdf4",
                infoRow("Project", escapeHtml(projectName), "#166534"),
                infoRow("Work Title", escapeHtml(workTitle), "#166534"),
                infoRow("Status", "<span style=\"display:inline-block;background:#dcfce7;color:#166534;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:700;\">✓ APPROVED</span>", "#166534"),
                infoRow("Approved by", escapeHtml(reviewerName), "#166534"),
                feedbackRow
            )

          + ctaButton(viewUrl, "View in Work Entries →", "linear-gradient(135deg,#16a34a 0%,#15803d 100%)")

          + "<p style=\"margin:0;font-size:13px;color:#94a3b8;line-height:1.7;\">Your approved work is now reflected in the team&rsquo;s analytics dashboard and project reports.</p>\n";

        return wrapInEnterpriseLayout(
            "Your work entry for " + projectName + " was approved",
            "Approved",
            "linear-gradient(90deg,#16a34a,#22c55e)",
            content
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  6. WORK ENTRY REJECTED / REVISION NEEDED
    // ─────────────────────────────────────────────────────────────────────────

    public String buildWorkRejectedEmail(String employeeName, String reviewerName, String projectName, String workTitle, String reason, String editUrl) {
        String reasonText = (reason != null && !reason.isBlank()) ? reason : "Please revise work details and resubmit.";

        String content =
            "<h1 style=\"margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;line-height:1.25;\">Your work entry needs revision</h1>\n"
          + "<p style=\"margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.7;\">Hi <strong style=\"color:#1e293b;\">" + escapeHtml(employeeName) + "</strong>, <strong style=\"color:#1e293b;\">" + escapeHtml(reviewerName) + "</strong> has reviewed your work entry and requested some changes before it can be approved.</p>\n"

          + infoCard("#fecaca", "#fef2f2",
                infoRow("Project", escapeHtml(projectName), "#991b1b"),
                infoRow("Work Title", escapeHtml(workTitle), "#991b1b"),
                infoRow("Status", "<span style=\"display:inline-block;background:#fee2e2;color:#991b1b;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:700;\">✕ REVISION NEEDED</span>", "#991b1b"),
                infoRow("Reviewed by", escapeHtml(reviewerName), "#991b1b"),
                infoRow("Reason", escapeHtml(reasonText), "#991b1b")
            )

          + ctaButton(editUrl, "Edit & Resubmit →", "linear-gradient(135deg,#dc2626 0%,#b91c1c 100%)")

          + "<p style=\"margin:0;font-size:13px;color:#94a3b8;line-height:1.7;\">Please address the feedback above, update your work entry, and resubmit for approval. Reach out to your manager if you have any questions.</p>\n";

        return wrapInEnterpriseLayout(
            "Action required: your work entry for " + projectName + " needs revision",
            "Revision Needed",
            "linear-gradient(90deg,#dc2626,#ef4444)",
            content
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  7. REPORT READY
    // ─────────────────────────────────────────────────────────────────────────

    public String buildReportReadyEmail(String userName, String reportFormat, String dateRange, String downloadUrl) {
        String content =
            "<h1 style=\"margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;line-height:1.25;\">Your report is ready 📊</h1>\n"
          + "<p style=\"margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.7;\">Hi <strong style=\"color:#1e293b;\">" + escapeHtml(userName) + "</strong>, your requested work analytics report has been generated and is ready for download.</p>\n"

          + infoCard("#bae6fd", "#f0f9ff",
                infoRow("Report Format", escapeHtml(reportFormat), "#075985"),
                infoRow("Date Range", escapeHtml(dateRange), "#075985"),
                infoRow("Generated at", escapeHtml(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy · HH:mm"))), "#075985")
            )

          + ctaButton(downloadUrl, "View & Download Report →", "linear-gradient(135deg,#0284c7 0%,#0369a1 100%)")

          + "<p style=\"margin:0;font-size:13px;color:#94a3b8;line-height:1.7;\">Reports are generated in real-time based on your current work entries. For recurring reports, use the scheduled export feature in the Reports section.</p>\n"

          + fallbackLink(downloadUrl);

        return wrapInEnterpriseLayout(
            "Your Work Report analytics report is ready for download",
            "Report Ready",
            "linear-gradient(90deg,#0284c7,#38bdf8)",
            content
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  8. ACCOUNT / SECURITY NOTIFICATION
    // ─────────────────────────────────────────────────────────────────────────

    public String buildAccountNotificationEmail(String userName, String actionTitle, String message, String supportEmail) {
        String supportHtml = (supportEmail != null && !supportEmail.isBlank())
            ? " or contact your administrator at <a href=\"mailto:" + escapeHtml(supportEmail) + "\" style=\"color:#3b82f6;\">" + escapeHtml(supportEmail) + "</a>"
            : "";

        String content =
            "<h1 style=\"margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;line-height:1.25;\">" + escapeHtml(actionTitle) + "</h1>\n"
          + "<p style=\"margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.7;\">Hi <strong style=\"color:#1e293b;\">" + escapeHtml(userName) + "</strong>, " + escapeHtml(message) + "</p>\n"

          + infoCard("#e2e8f0", "#f8fafc",
                infoRow("Notification", escapeHtml(actionTitle), "#1e293b"),
                infoRow("Timestamp", escapeHtml(LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy · HH:mm:ss"))), "#1e293b"),
                infoRow("Account", escapeHtml(userName), "#1e293b")
            )

          + "<p style=\"margin:20px 0 0;font-size:13px;color:#94a3b8;line-height:1.7;\">If you did not perform this action, please review your account security immediately" + supportHtml + ".</p>\n";

        return wrapInEnterpriseLayout(
            actionTitle + " – Work Report account notification",
            "Account Update",
            "linear-gradient(90deg,#475569,#64748b)",
            content
        );
    }

    public String buildAccountStatusNotificationEmail(String userName, String actionTitle, String message, String supportEmail) {
        return buildAccountNotificationEmail(userName, actionTitle, message, supportEmail);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  UTILITY
    // ─────────────────────────────────────────────────────────────────────────

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }
}
