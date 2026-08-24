package work_report_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OrganizationUpdateRequest {

    @NotBlank(message = "Organization name is required")
    @Size(max = 150, message = "Organization name cannot exceed 150 characters")
    private String name;

    public OrganizationUpdateRequest() {
    }

    public OrganizationUpdateRequest(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
