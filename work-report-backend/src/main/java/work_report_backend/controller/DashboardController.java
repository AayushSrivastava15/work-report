package work_report_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work_report_backend.dto.*;
import work_report_backend.repository.UserRepository;
import work_report_backend.service.DashboardService;
import work_report_backend.util.SecurityUtils;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    // 0. High-Density Analytics Endpoint
    @GetMapping("/user/{userId}/analytics")
    public ResponseEntity<DashboardAnalyticsResponse> getAnalytics(
            @PathVariable Long userId,
            @ModelAttribute AnalyticsFilterRequest filter
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        return ResponseEntity.ok(dashboardService.getAnalyticsData(userId, filter));
    }

    // 1. Total work-entry count
    @GetMapping("/user/{userId}/work-count")
    public ResponseEntity<DashboardWorkCountResponse> getWorkCount(
            @PathVariable Long userId
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        return ResponseEntity.ok(dashboardService.getWorkCount(userId));
    }

    // 2. Total project count
    @GetMapping("/user/{userId}/project-count")
    public ResponseEntity<DashboardProjectCountResponse> getProjectCount(
            @PathVariable Long userId
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        return ResponseEntity.ok(dashboardService.getProjectCount(userId));
    }

    // 3. Current calendar month work entries
    @GetMapping("/user/{userId}/current-month")
    public ResponseEntity<List<WorkEntryResponse>> getCurrentMonthWork(
            @PathVariable Long userId
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        return ResponseEntity.ok(dashboardService.getCurrentMonthWork(userId));
    }

    // 4. Current week work entries (Monday to Sunday)
    @GetMapping("/user/{userId}/current-week")
    public ResponseEntity<List<WorkEntryResponse>> getCurrentWeekWork(
            @PathVariable Long userId
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        return ResponseEntity.ok(dashboardService.getCurrentWeekWork(userId));
    }

    // 5. Work grouped by project
    @GetMapping("/user/{userId}/projects")
    public ResponseEntity<List<DashboardProjectResponse>> getWorkByProject(
            @PathVariable Long userId
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        return ResponseEntity.ok(dashboardService.getWorkByProject(userId));
    }

    // 6. Work grouped by category
    @GetMapping("/user/{userId}/categories")
    public ResponseEntity<List<DashboardCategoryResponse>> getWorkByCategory(
            @PathVariable Long userId
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        return ResponseEntity.ok(dashboardService.getWorkByCategory(userId));
    }

    // 7. Work grouped by technology
    @GetMapping("/user/{userId}/technologies")
    public ResponseEntity<List<DashboardTechnologyResponse>> getWorkByTechnology(
            @PathVariable Long userId
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        return ResponseEntity.ok(dashboardService.getWorkByTechnology(userId));
    }

    // 8. Work grouped by status
    @GetMapping("/user/{userId}/status")
    public ResponseEntity<List<DashboardStatusResponse>> getWorkByStatus(
            @PathVariable Long userId
    ) {
        SecurityUtils.validateUserAccess(userId, userRepository);
        return ResponseEntity.ok(dashboardService.getWorkByStatus(userId));
    }
}
