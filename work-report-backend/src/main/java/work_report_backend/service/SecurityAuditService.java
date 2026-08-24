package work_report_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Service for structured security audit logging.
 * Logs security-relevant lifecycle events without exposing passwords or tokens.
 */
@Service
public class SecurityAuditService {

    private static final Logger auditLog = LoggerFactory.getLogger("SECURITY_AUDIT");

    public void logLoginSuccess(String email, Long userId, String role, Long orgId, String orgCode) {
        auditLog.info("EVENT=LOGIN_SUCCESS email='{}' userId={} role='{}' orgId={} orgCode='{}'",
                email, userId, role, orgId, orgCode);
    }

    public void logLoginFailure(String email, String reason) {
        auditLog.warn("EVENT=LOGIN_FAILURE email='{}' reason='{}'", email, reason);
    }

    public void logAccountLocked(String email, int lockoutMinutes) {
        auditLog.warn("EVENT=ACCOUNT_LOCKED email='{}' durationMinutes={}", email, lockoutMinutes);
    }

    public void logOrganizationCreated(String orgName, String orgCode, String orgType, String creatorEmail) {
        auditLog.info("EVENT=ORGANIZATION_CREATED name='{}' code='{}' type='{}' creator='{}'",
                orgName, orgCode, orgType, creatorEmail);
    }

    public void logUserJoinRequested(String email, String orgCode, Long orgId) {
        auditLog.info("EVENT=USER_JOIN_REQUESTED email='{}' orgCode='{}' orgId={}", email, orgCode, orgId);
    }

    public void logUserRegistration(String email, Long userId, String role, String status, String accountType, String orgCode) {
        auditLog.info("EVENT=USER_REGISTRATION email='{}' userId={} role='{}' status='{}' accountType='{}' orgCode='{}'",
                email, userId, role, status, accountType, orgCode);
    }

    public void logUserStatusChange(String targetEmail, String newStatus, String actorEmail, Long orgId) {
        auditLog.info("EVENT=USER_STATUS_CHANGE targetUser='{}' newStatus='{}' changedBy='{}' orgId={}",
                targetEmail, newStatus, actorEmail, orgId);
    }

    public void logUserRoleChange(String targetEmail, String newRole, String actorEmail, Long orgId) {
        auditLog.info("EVENT=USER_ROLE_CHANGE targetUser='{}' newRole='{}' changedBy='{}' orgId={}",
                targetEmail, newRole, actorEmail, orgId);
    }

    public void logReportAction(String action, Long reportId, String actorEmail, Long orgId) {
        auditLog.info("EVENT=REPORT_ACTION action='{}' reportId={} actor='{}' orgId={}", action, reportId, actorEmail, orgId);
    }

    public void logTeamAction(String action, Long teamId, String details, String actorEmail, Long orgId) {
        auditLog.info("EVENT=TEAM_ACTION action='{}' teamId={} details='{}' actor='{}' orgId={}",
                action, teamId, details, actorEmail, orgId);
    }

    public void logAccessDenied(String resource, String actorEmail, String reason) {
        auditLog.warn("EVENT=ACCESS_DENIED resource='{}' actor='{}' reason='{}'", resource, actorEmail, reason);
    }

    public void logConfigChange(String property, String details, String actorEmail) {
        auditLog.info("EVENT=CONFIG_CHANGE property='{}' details='{}' actor='{}'", property, details, actorEmail);
    }
}
