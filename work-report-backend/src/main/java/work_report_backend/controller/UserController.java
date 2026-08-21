package work_report_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work_report_backend.dto.ProjectResponse;
import work_report_backend.dto.UserRequest;
import work_report_backend.dto.UserResponse;
import work_report_backend.dto.WorkEntryResponse;
import work_report_backend.repository.UserRepository;
import work_report_backend.service.ProjectService;
import work_report_backend.service.UserService;
import work_report_backend.service.WorkEntryService;
import work_report_backend.util.SecurityUtils;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final WorkEntryService workEntryService;
    private final ProjectService projectService;
    private final UserRepository userRepository;

    public UserController(
            UserService userService,
            WorkEntryService workEntryService,
            ProjectService projectService,
            UserRepository userRepository
    ) {
        this.userService = userService;
        this.workEntryService = workEntryService;
        this.projectService = projectService;
        this.userRepository = userRepository;
    }

    // 1. Create User
    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserRequest request
    ) {
        UserResponse created = userService.createUser(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // 2. Get All Users (Restricted to Administrators)
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        SecurityUtils.requireAdminRole(userRepository);
        return ResponseEntity.ok(userService.getAllUserResponses());
    }

    // 3. Get User by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        SecurityUtils.validateUserAccess(id, userRepository);
        return ResponseEntity.ok(userService.getUserResponseById(id));
    }

    // 4. Update User
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request
    ) {
        SecurityUtils.validateUserAccess(id, userRepository);
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // 5. Delete User
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        SecurityUtils.validateUserAccess(id, userRepository);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Get User's Work Entries
    @GetMapping("/{id}/work-entries")
    public ResponseEntity<List<WorkEntryResponse>> getUserWorkEntries(
            @PathVariable Long id
    ) {
        SecurityUtils.validateUserAccess(id, userRepository);
        return ResponseEntity.ok(
                workEntryService.getWorkEntriesByUser(id)
        );
    }

    // 7. Get User's Projects
    @GetMapping("/{id}/projects")
    public ResponseEntity<List<ProjectResponse>> getUserProjects(
            @PathVariable Long id
    ) {
        SecurityUtils.validateUserAccess(id, userRepository);
        return ResponseEntity.ok(
                projectService.getProjectsByUser(id)
        );
    }
}