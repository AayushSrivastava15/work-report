package work_report_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class TeamInvitationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid corporate email address")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    private String email;

    @Pattern(regexp = "^(MEMBER|MANAGER)$", message = "Role must be either MEMBER or MANAGER")
    private String role = "MEMBER";

    @Size(max = 500, message = "Invitation message cannot exceed 500 characters")
    private String message;

    public TeamInvitationRequest() {}

    public TeamInvitationRequest(String email, String role, String message) {
        this.email = email;
        this.role = role != null ? role : "MEMBER";
        this.message = message;
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
