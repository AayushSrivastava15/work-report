package work_report_backend.dto;

public class ValidateTokenResponse {

    private boolean valid;
    private String email;
    private String name;
    private String teamName;
    private String organizationName;
    private String role;
    private String message;

    public ValidateTokenResponse() {}

    public static ValidateTokenResponse validPasswordReset(String email, String name) {
        ValidateTokenResponse res = new ValidateTokenResponse();
        res.valid = true;
        res.email = email;
        res.name = name;
        res.message = "Token is valid";
        return res;
    }

    public static ValidateTokenResponse validInvitation(String email, String teamName, String organizationName, String role) {
        ValidateTokenResponse res = new ValidateTokenResponse();
        res.valid = true;
        res.email = email;
        res.teamName = teamName;
        res.organizationName = organizationName;
        res.role = role;
        res.message = "Invitation is valid";
        return res;
    }

    public static ValidateTokenResponse invalid(String message) {
        ValidateTokenResponse res = new ValidateTokenResponse();
        res.valid = false;
        res.message = message;
        return res;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
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
