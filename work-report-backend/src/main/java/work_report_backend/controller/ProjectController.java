package work_report_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work_report_backend.dto.ProjectRequest;
import work_report_backend.dto.ProjectResponse;
import work_report_backend.service.ProjectService;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // 1. Create Project for a User
    @PostMapping("/user/{userId}")
    public ResponseEntity<ProjectResponse> createProject(
            @PathVariable Long userId,
            @Valid @RequestBody ProjectRequest request
    ) {
        ProjectResponse created = projectService.createProject(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 2. Get All Projects
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    // 3. Get Project by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    // 4. Update Project
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request
    ) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    // 5. Delete Project
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id
    ) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Get Projects by User
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByUser(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(projectService.getProjectsByUser(userId));
    }
}