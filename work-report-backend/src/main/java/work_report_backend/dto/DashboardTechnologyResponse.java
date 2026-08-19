package work_report_backend.dto;

public class DashboardTechnologyResponse {

    private String technology;
    private long workCount;

    public DashboardTechnologyResponse() {
    }

    public DashboardTechnologyResponse(String technology, long workCount) {
        this.technology = technology;
        this.workCount = workCount;
    }

    public String getTechnology() {
        return technology;
    }

    public void setTechnology(String technology) {
        this.technology = technology;
    }

    public long getWorkCount() {
        return workCount;
    }

    public void setWorkCount(long workCount) {
        this.workCount = workCount;
    }
}
