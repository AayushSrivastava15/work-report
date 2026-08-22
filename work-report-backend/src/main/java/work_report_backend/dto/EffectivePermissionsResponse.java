package work_report_backend.dto;

import java.util.List;

public class EffectivePermissionsResponse {

    private Long userId;
    private String name;
    private String email;
    private String role;
    private String status;
    private Long organizationId;
    private String organizationName;
    private String organizationCode;
    private Long teamId;
    private String teamName;
    private boolean isManager;
    private Long managedTeamId;
    private String managedTeamName;
    private List<String> permissions;

    public EffectivePermissionsResponse() {
    }

    public EffectivePermissionsResponse(
            Long userId,
            String name,
            String email,
            String role,
            String status,
            Long organizationId,
            String organizationName,
            String organizationCode,
            Long teamId,
            String teamName,
            boolean isManager,
            Long managedTeamId,
            String managedTeamName,
            List<String> permissions
    ) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.organizationCode = organizationCode;
        this.teamId = teamId;
        this.teamName = teamName;
        this.isManager = isManager;
        this.managedTeamId = managedTeamId;
        this.managedTeamName = managedTeamName;
        this.permissions = permissions;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public Long getManagedTeamId() {
        return managedTeamId;
    }

    public void setManagedTeamId(Long managedTeamId) {
        this.managedTeamId = managedTeamId;
    }

    public String getManagedTeamName() {
        return managedTeamName;
    }

    public void setManagedTeamName(String managedTeamName) {
        this.managedTeamName = managedTeamName;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }
}
