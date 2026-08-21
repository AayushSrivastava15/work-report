package work_report_backend.dto;

import java.time.LocalDate;
import java.util.List;

public class ReportPreviewResponse {

    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDate startDate;
    private LocalDate endDate;
    private int totalEntries;
    private int totalProjects;
    private List<WorkEntryResponse> entries;

    public ReportPreviewResponse() {
    }

    public ReportPreviewResponse(Long userId, String userName, String userEmail,
                                 LocalDate startDate, LocalDate endDate,
                                 int totalEntries, int totalProjects,
                                 List<WorkEntryResponse> entries) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalEntries = totalEntries;
        this.totalProjects = totalProjects;
        this.entries = entries;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
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

    public int getTotalEntries() {
        return totalEntries;
    }

    public void setTotalEntries(int totalEntries) {
        this.totalEntries = totalEntries;
    }

    public int getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(int totalProjects) {
        this.totalProjects = totalProjects;
    }

    public List<WorkEntryResponse> getEntries() {
        return entries;
    }

    public void setEntries(List<WorkEntryResponse> entries) {
        this.entries = entries;
    }
}
