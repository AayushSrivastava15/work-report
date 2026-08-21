package work_report_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work_report_backend.dto.AdminUserStatsResponse;
import work_report_backend.dto.PageResponse;
import work_report_backend.dto.UserResponse;
import work_report_backend.repository.UserRepository;
import work_report_backend.service.UserService;
import work_report_backend.util.SecurityUtils;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public AdminUserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // 1. Get Paginated Users with Multi-Criteria Filters & Search
    @GetMapping
    public ResponseEntity<PageResponse<UserResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        SecurityUtils.requireAdminRole(userRepository);
        return ResponseEntity.ok(
                userService.searchUsersPaginated(keyword, status, role, department, page, size)
        );
    }

    // 2. Get User Overview Stats
    @GetMapping("/stats")
    public ResponseEntity<AdminUserStatsResponse> getUserStats() {
        SecurityUtils.requireAdminRole(userRepository);
        return ResponseEntity.ok(userService.getAdminUserStats());
    }

    // 3. Get User by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        SecurityUtils.requireAdminRole(userRepository);
        return ResponseEntity.ok(userService.getUserResponseById(id));
    }

    // 4. Approve User Registration
    @PutMapping("/{id}/approve")
    public ResponseEntity<UserResponse> approveUser(@PathVariable Long id) {
        SecurityUtils.requireAdminRole(userRepository);
        String adminEmail = SecurityUtils.getCurrentUserEmail().orElse("admin");
        return ResponseEntity.ok(userService.approveUser(id, adminEmail));
    }

    // 5. Reject User Registration
    @PutMapping("/{id}/reject")
    public ResponseEntity<UserResponse> rejectUser(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        SecurityUtils.requireAdminRole(userRepository);
        String reason = body != null ? body.get("reason") : null;
        String adminEmail = SecurityUtils.getCurrentUserEmail().orElse("admin");
        return ResponseEntity.ok(userService.rejectUser(id, reason, adminEmail));
    }

    // 6. Suspend User
    @PutMapping("/{id}/suspend")
    public ResponseEntity<UserResponse> suspendUser(@PathVariable Long id) {
        SecurityUtils.requireAdminRole(userRepository);
        String adminEmail = SecurityUtils.getCurrentUserEmail().orElse("admin");
        return ResponseEntity.ok(userService.suspendUser(id, adminEmail));
    }

    // 7. Reactivate User
    @PutMapping("/{id}/reactivate")
    public ResponseEntity<UserResponse> reactivateUser(@PathVariable Long id) {
        SecurityUtils.requireAdminRole(userRepository);
        String adminEmail = SecurityUtils.getCurrentUserEmail().orElse("admin");
        return ResponseEntity.ok(userService.reactivateUser(id, adminEmail));
    }

    // 8. Update User Role
    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        SecurityUtils.requireAdminRole(userRepository);
        String newRole = body != null ? body.get("role") : "USER";
        return ResponseEntity.ok(userService.updateUserRole(id, newRole));
    }
}
