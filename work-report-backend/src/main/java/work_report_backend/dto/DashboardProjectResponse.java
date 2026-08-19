package work_report_backend.dto;

public class DashboardProjectResponse {

    private Long projectId;
    private String projectName;
    private long workCount;

    public DashboardProjectResponse() {
    }

    public DashboardProjectResponse(Long projectId, String projectName, long workCount) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.workCount = workCount;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public long getWorkCount() {
        return workCount;
    }

    public void setWorkCount(long workCount) {
        this.workCount = workCount;
    }
}
