package work_report_backend.dto;

import java.time.LocalDateTime;

public class TeamInvitationResponse {

    private Long id;
    private String token;
    private String email;
    private Long teamId;
    private String teamName;
    private Long organizationId;
    private String organizationName;
    private Long inviterId;
    private String inviterName;
    private String inviterEmail;
    private String role;
    private String status;
    private String message;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;

    public TeamInvitationResponse() {}

    public TeamInvitationResponse(Long id, String token, String email, Long teamId, String teamName,
                                  Long organizationId, String organizationName, Long inviterId, String inviterName,
                                  String inviterEmail, String role, String status, String message,
                                  LocalDateTime expiresAt, LocalDateTime createdAt, LocalDateTime acceptedAt) {
        this.id = id;
        this.token = token;
        this.email = email;
        this.teamId = teamId;
        this.teamName = teamName;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.inviterId = inviterId;
        this.inviterName = inviterName;
        this.inviterEmail = inviterEmail;
        this.role = role;
        this.status = status;
        this.message = message;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.acceptedAt = acceptedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public Long getInviterId() {
        return inviterId;
    }

    public void setInviterId(Long inviterId) {
        this.inviterId = inviterId;
    }

    public String getInviterName() {
        return inviterName;
    }

    public void setInviterName(String inviterName) {
        this.inviterName = inviterName;
    }

    public String getInviterEmail() {
        return inviterEmail;
    }

    public void setInviterEmail(String inviterEmail) {
        this.inviterEmail = inviterEmail;
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }
}
