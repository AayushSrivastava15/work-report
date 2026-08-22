package work_report_backend.dto;

import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String status;
    private String department;
    private String designation;
    private String employeeId;
    private String rejectionReason;
    private LocalDateTime approvedAt;
    private String approvedBy;
    private LocalDateTime createdAt;

    // Tenant Organization Info
    private Long organizationId;
    private String organizationName;
    private String organizationCode;
    private String organizationType;

    // Team Info & Role Info
    private Long teamId;
    private String teamName;
    private boolean isManager;

    public UserResponse() {
    }

    public UserResponse(Long id, String name, String email, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = "USER";
        this.status = "ACTIVE";
        this.createdAt = createdAt;
    }

    public UserResponse(
            Long id,
            String name,
            String email,
            String role,
            String status,
            String department,
            String designation,
            String employeeId,
            String rejectionReason,
            LocalDateTime approvedAt,
            String approvedBy,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.department = department;
        this.designation = designation;
        this.employeeId = employeeId;
        this.rejectionReason = rejectionReason;
        this.approvedAt = approvedAt;
        this.approvedBy = approvedBy;
        this.createdAt = createdAt;
    }

    public UserResponse(
            Long id,
            String name,
            String email,
            String role,
            String status,
            String department,
            String designation,
            String employeeId,
            String rejectionReason,
            LocalDateTime approvedAt,
            String approvedBy,
            LocalDateTime createdAt,
            Long organizationId,
            String organizationName,
            String organizationCode,
            String organizationType
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.department = department;
        this.designation = designation;
        this.employeeId = employeeId;
        this.rejectionReason = rejectionReason;
        this.approvedAt = approvedAt;
        this.approvedBy = approvedBy;
        this.createdAt = createdAt;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.organizationCode = organizationCode;
        this.organizationType = organizationType;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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

    public String getOrganizationCode() {
        return organizationCode;
    }

    public void setOrganizationCode(String organizationCode) {
        this.organizationCode = organizationCode;
    }

    public String getOrganizationType() {
        return organizationType;
    }

    public void setOrganizationType(String organizationType) {
        this.organizationType = organizationType;
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

    public boolean isManager() {
        return isManager;
    }

    public void setManager(boolean manager) {
        isManager = manager;
    }
}
