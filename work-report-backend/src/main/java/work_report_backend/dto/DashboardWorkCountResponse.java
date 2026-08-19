package work_report_backend.dto;

public class DashboardWorkCountResponse {

    private Long userId;
    private long workCount;

    public DashboardWorkCountResponse() {
    }

    public DashboardWorkCountResponse(Long userId, long workCount) {
        this.userId = userId;
        this.workCount = workCount;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public long getWorkCount() {
        return workCount;
    }

    public void setWorkCount(long workCount) {
        this.workCount = workCount;
    }
}
