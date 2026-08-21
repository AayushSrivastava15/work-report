package work_report_backend.dto;

public class AdminUserStatsResponse {

    private long totalUsers;
    private long activeUsers;
    private long pendingUsers;
    private long suspendedUsers;
    private long rejectedUsers;

    private String organizationName;
    private String organizationCode;
    private String organizationType;

    public AdminUserStatsResponse() {
    }

    public AdminUserStatsResponse(long totalUsers, long activeUsers, long pendingUsers, long suspendedUsers, long rejectedUsers) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.pendingUsers = pendingUsers;
        this.suspendedUsers = suspendedUsers;
        this.rejectedUsers = rejectedUsers;
    }

    public AdminUserStatsResponse(
            long totalUsers,
            long activeUsers,
            long pendingUsers,
            long suspendedUsers,
            long rejectedUsers,
            String organizationName,
            String organizationCode,
            String organizationType
    ) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.pendingUsers = pendingUsers;
        this.suspendedUsers = suspendedUsers;
        this.rejectedUsers = rejectedUsers;
        this.organizationName = organizationName;
        this.organizationCode = organizationCode;
        this.organizationType = organizationType;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getPendingUsers() {
        return pendingUsers;
    }

    public void setPendingUsers(long pendingUsers) {
        this.pendingUsers = pendingUsers;
    }

    public long getSuspendedUsers() {
        return suspendedUsers;
    }

    public void setSuspendedUsers(long suspendedUsers) {
        this.suspendedUsers = suspendedUsers;
    }

    public long getRejectedUsers() {
        return rejectedUsers;
    }

    public void setRejectedUsers(long rejectedUsers) {
        this.rejectedUsers = rejectedUsers;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getOrganizationCode() {
        return organizationCode;
    }

    public void setOrganizationCode(String organizationCode) {
        this.organizationCode = organizationCode;
    }

    public String getOrganizationType() {
        return organizationType;
    }

    public void setOrganizationType(String organizationType) {
        this.organizationType = organizationType;
    }
}
