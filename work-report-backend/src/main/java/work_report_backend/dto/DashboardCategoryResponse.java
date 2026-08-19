package work_report_backend.dto;

public class DashboardCategoryResponse {

    private String category;
    private long workCount;

    public DashboardCategoryResponse() {
    }

    public DashboardCategoryResponse(String category, long workCount) {
        this.category = category;
        this.workCount = workCount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public long getWorkCount() {
        return workCount;
    }

    public void setWorkCount(long workCount) {
        this.workCount = workCount;
    }
}
