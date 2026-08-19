package work_report_backend.dto;

public class DashboardStatusResponse {

    private String status;
    private long workCount;

    public DashboardStatusResponse() {
    }

    public DashboardStatusResponse(String status, long workCount) {
        this.status = status;
        this.workCount = workCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getWorkCount() {
        return workCount;
    }

    public void setWorkCount(long workCount) {
        this.workCount = workCount;
    }
}
