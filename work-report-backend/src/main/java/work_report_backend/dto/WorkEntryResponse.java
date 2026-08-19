package work_report_backend.dto;


import java.time.LocalDate;

public class WorkEntryResponse {

    private Long id;
    private LocalDate date;
    private String title;
    private String description;
    private String category;
    private String technology;
    private String status;

    private Long projectId;
    private String projectName;

    public WorkEntryResponse() {
    }

    public WorkEntryResponse(
            Long id,
            LocalDate date,
            String title,
            String description,
            String category,
            String technology,
            String status,
            Long projectId,
            String projectName
    ) {
        this.id = id;
        this.date = date;
        this.title = title;
        this.description = description;
        this.category = category;
        this.technology = technology;
        this.status = status;
        this.projectId = projectId;
        this.projectName = projectName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }
}
