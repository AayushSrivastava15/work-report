package work_report_backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class WorkEntryResponse {

    private Long id;
    private LocalDate date;
    private String title;
    private String description;
    private String category;
    private String technology;
    private String status;

    private Long projectId;
    private String projectName;

    private Long userId;
    private String userName;
    private String userEmail;

    private Long teamId;
    private String teamName;

    private LocalDateTime submittedAt;
    private Long reviewerId;
    private String reviewerName;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WorkEntryResponse() {
    }

    public WorkEntryResponse(
            Long id,
            LocalDate date,
            String title,
            String description,
            String category,
            String technology,
            String status,
            Long projectId,
            String projectName
    ) {
        this.id = id;
        this.date = date;
        this.title = title;
        this.description = description;
        this.category = category;
        this.technology = technology;
        this.status = status;
        this.projectId = projectId;
        this.projectName = projectName;
    }

    public WorkEntryResponse(
            Long id,
            LocalDate date,
            String title,
            String description,
            String category,
            String technology,
            String status,
            Long projectId,
            String projectName,
            LocalDateTime submittedAt,
            Long reviewerId,
            String reviewerName,
            LocalDateTime reviewedAt,
            String rejectionReason,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.date = date;
        this.title = title;
        this.description = description;
        this.category = category;
        this.technology = technology;
        this.status = status;
        this.projectId = projectId;
        this.projectName = projectName;
        this.submittedAt = submittedAt;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
        this.reviewedAt = reviewedAt;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
