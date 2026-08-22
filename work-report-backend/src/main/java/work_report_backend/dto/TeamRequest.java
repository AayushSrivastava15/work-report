package work_report_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TeamRequest {

    @NotBlank(message = "Team name is required")
    @Size(max = 255, message = "Team name cannot exceed 255 characters")
    private String name;

    private String description;

    private Long managerId;

    public TeamRequest() {
    }

    public TeamRequest(String name, String description, Long managerId) {
        this.name = name;
        this.description = description;
        this.managerId = managerId;
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

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }
}
