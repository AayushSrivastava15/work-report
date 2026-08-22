package work_report_backend.dto;

import java.time.LocalDateTime;

public class TeamResponse {

    private Long id;
    private String name;
    private String description;
    private Long organizationId;
    private String organizationName;
    private Long managerId;
    private String managerName;
    private String managerEmail;
    private int memberCount;
    private LocalDateTime createdAt;

    public TeamResponse() {
    }

    public TeamResponse(
            Long id,
            String name,
            String description,
            Long organizationId,
            String organizationName,
            Long managerId,
            String managerName,
            String managerEmail,
            int memberCount,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.managerId = managerId;
        this.managerName = managerName;
        this.managerEmail = managerEmail;
        this.memberCount = memberCount;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public String getManagerName() {
        return managerName;
    }

    public void setManagerName(String managerName) {
        this.managerName = managerName;
    }

    public String getManagerEmail() {
        return managerEmail;
    }

    public void setManagerEmail(String managerEmail) {
        this.managerEmail = managerEmail;
    }

    public int getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
