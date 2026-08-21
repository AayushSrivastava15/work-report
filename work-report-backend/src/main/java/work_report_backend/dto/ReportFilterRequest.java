package work_report_backend.dto;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public class ReportFilterRequest {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    private Long projectId;
    private String category;
    private String technology;
    private String status;
    private String keyword;

    public ReportFilterRequest() {
    }

    public ReportFilterRequest(LocalDate startDate, LocalDate endDate, Long projectId,
                               String category, String technology, String status, String keyword) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.projectId = projectId;
        this.category = category;
        this.technology = technology;
        this.status = status;
        this.keyword = keyword;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTechnology() {
        return technology;
    }

    public void setTechnology(String technology) {
        this.technology = technology;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
}
