package work_report_backend.util;

public enum Permission {
    // User Permissions
    USER_VIEW,
    USER_CREATE,
    USER_UPDATE,
    USER_DELETE,
    USER_APPROVE,
    USER_REJECT,
    USER_SUSPEND,
    USER_REACTIVATE,
    USER_ASSIGN_ROLE,
    USER_ASSIGN_TEAM,

    // Team Permissions
    TEAM_VIEW,
    TEAM_CREATE,
    TEAM_UPDATE,
    TEAM_DELETE,
    TEAM_MEMBER_VIEW,
    TEAM_MEMBER_MANAGE,
    TEAM_MANAGER_ASSIGN,

    // Report & Work Entry Permissions
    REPORT_CREATE,
    REPORT_VIEW,
    REPORT_UPDATE,
    REPORT_DELETE,
    REPORT_SUBMIT,
    REPORT_WITHDRAW,
    REPORT_APPROVE,
    REPORT_REJECT,
    REPORT_RESUBMIT,
    REPORT_EXPORT,

    // Project Permissions
    PROJECT_VIEW,
    PROJECT_CREATE,
    PROJECT_UPDATE,
    PROJECT_DELETE,

    // Organization Permissions
    ORGANIZATION_VIEW,
    ORGANIZATION_UPDATE,
    ORGANIZATION_SETTINGS,

    // Audit Permissions
    AUDIT_VIEW
}
