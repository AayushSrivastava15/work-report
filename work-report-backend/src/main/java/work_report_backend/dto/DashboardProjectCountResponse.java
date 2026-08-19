package work_report_backend.dto;

public class DashboardProjectCountResponse {

    private Long userId;
    private long projectCount;

    public DashboardProjectCountResponse() {
    }

    public DashboardProjectCountResponse(Long userId, long projectCount) {
        this.userId = userId;
        this.projectCount = projectCount;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public long getProjectCount() {
        return projectCount;
    }

    public void setProjectCount(long projectCount) {
        this.projectCount = projectCount;
    }
}
