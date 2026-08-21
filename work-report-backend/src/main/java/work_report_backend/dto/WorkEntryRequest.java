package work_report_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

public class WorkEntryRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Technology is required")
    private String technology;

    @NotBlank(message = "Status is required")
    @Pattern(
            regexp = "^(?i)(Completed|In Progress|Pending|Blocked|Draft|Submitted|Approved|Rejected)$",
            message = "Status must be one of: Draft, Submitted, Pending, Approved, Rejected, Completed, In Progress, Blocked"
    )
    private String status;

    public WorkEntryRequest() {
    }

    public WorkEntryRequest(LocalDate date, String title, String description, String category, String technology, String status) {
        this.date = date;
        this.title = title;
        this.description = description;
        this.category = category;
        this.technology = technology;
        this.status = status;
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
}