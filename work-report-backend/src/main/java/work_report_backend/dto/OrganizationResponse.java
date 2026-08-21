package work_report_backend.dto;

import java.time.LocalDateTime;

public class OrganizationResponse {

    private Long id;
    private String name;
    private String code;
    private String type;
    private Long ownerId;
    private LocalDateTime createdAt;

    public OrganizationResponse() {
    }

    public OrganizationResponse(Long id, String name, String code, String type, Long ownerId, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.type = type;
        this.ownerId = ownerId;
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
