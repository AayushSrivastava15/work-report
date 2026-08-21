package work_report_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work_report_backend.dto.PageResponse;
import work_report_backend.dto.ProjectRequest;
import work_report_backend.dto.ProjectResponse;
import work_report_backend.entity.Project;
import work_report_backend.repository.ProjectRepository;
import work_report_backend.repository.UserRepository;
import work_report_backend.service.ProjectService;
import work_report_backend.util.SecurityUtils;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectController(
            ProjectService projectService,
            ProjectRepository projectRepository,
            UserRepository userRepository
    ) {
        this.projectService = projectService;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    // 1. Create Project for a User
    @PostMapping("/user/{userId}")
    public ResponseEntity<ProjectResponse> createProject(
            @PathVariable Long userId,
            @Valid @RequestBody ProjectRequest request
    ) {
        if (userRepository != null) {
            SecurityUtils.validateUserAccess(userId, userRepository);
        }
        ProjectResponse created = projectService.createProject(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 2. Get All Projects (Paginated)
    @GetMapping
    public ResponseEntity<PageResponse<ProjectResponse>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(projectService.getAllProjects(page, size));
    }

    // 3. Get Project by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        if (projectRepository != null && userRepository != null) {
            Project project = projectRepository.findById(id).orElse(null);
            if (project != null) {
                SecurityUtils.validateProjectOwnership(project, userRepository);
            }
        }
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    // 4. Update Project
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request
    ) {
        if (projectRepository != null && userRepository != null) {
            Project project = projectRepository.findById(id).orElse(null);
            if (project != null) {
                SecurityUtils.validateProjectOwnership(project, userRepository);
            }
        }
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    // 5. Delete Project
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        if (projectRepository != null && userRepository != null) {
            Project project = projectRepository.findById(id).orElse(null);
            if (project != null) {
                SecurityUtils.validateProjectOwnership(project, userRepository);
            }
        }
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Get Projects by User (Paginated)
    @GetMapping("/user/{userId}")
    public ResponseEntity<PageResponse<ProjectResponse>> getProjectsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (userRepository != null) {
            SecurityUtils.validateUserAccess(userId, userRepository);
        }
        return ResponseEntity.ok(projectService.getProjectsByUser(userId, page, size));
    }
}