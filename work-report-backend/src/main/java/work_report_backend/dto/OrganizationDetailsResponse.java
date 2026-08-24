package work_report_backend.dto;

import java.time.LocalDateTime;

public class OrganizationDetailsResponse {

    private Long id;
    private String name;
    private String code;
    private String type;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private long totalMembers;
    private long totalTeams;
    private long totalProjects;
    private long totalReports;
    private String plan;
    private LocalDateTime createdAt;

    public OrganizationDetailsResponse() {
    }

    public OrganizationDetailsResponse(
            Long id,
            String name,
            String code,
            String type,
            Long ownerId,
            String ownerName,
            String ownerEmail,
            long totalMembers,
            long totalTeams,
            long totalProjects,
            long totalReports,
            String plan,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.type = type;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
        this.totalMembers = totalMembers;
        this.totalTeams = totalTeams;
        this.totalProjects = totalProjects;
        this.totalReports = totalReports;
        this.plan = plan;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public long getTotalMembers() {
        return totalMembers;
    }

    public void setTotalMembers(long totalMembers) {
        this.totalMembers = totalMembers;
    }

    public long getTotalTeams() {
        return totalTeams;
    }

    public void setTotalTeams(long totalTeams) {
        this.totalTeams = totalTeams;
    }

    public long getTotalProjects() {
        return totalProjects;
    }

    public void setTotalProjects(long totalProjects) {
        this.totalProjects = totalProjects;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
