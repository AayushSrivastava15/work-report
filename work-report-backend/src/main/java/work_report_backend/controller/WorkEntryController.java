package work_report_backend.controller;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work_report_backend.dto.PageResponse;
import work_report_backend.dto.WorkEntryRequest;
import work_report_backend.dto.WorkEntryResponse;
import work_report_backend.entity.User;
import work_report_backend.entity.WorkEntry;
import work_report_backend.repository.UserRepository;
import work_report_backend.repository.WorkEntryRepository;
import work_report_backend.service.WorkEntryService;
import work_report_backend.util.SecurityUtils;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/work-entries")
public class WorkEntryController {

    private final WorkEntryService workEntryService;
    private final WorkEntryRepository workEntryRepository;
    private final UserRepository userRepository;

    public WorkEntryController(
            WorkEntryService workEntryService,
            WorkEntryRepository workEntryRepository,
            UserRepository userRepository
    ) {
        this.workEntryService = workEntryService;
        this.workEntryRepository = workEntryRepository;
        this.userRepository = userRepository;
    }

    private void checkEntryOwnership(Long id) {
        if (workEntryRepository != null && userRepository != null) {
            WorkEntry entry = workEntryRepository.findById(id).orElse(null);
            if (entry != null) {
                SecurityUtils.validateWorkEntryOwnership(entry, userRepository);
            }
        }
    }

    // ── Phase 3 — CRUD ────────────────────────────────────────────────────────

    // 1. Create Work Entry
    @PostMapping("/user/{userId}/project/{projectId}")
    public ResponseEntity<WorkEntryResponse> createWorkEntry(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody WorkEntryRequest request
    ) {
        if (userRepository != null) {
            SecurityUtils.validateUserAccess(userId, userRepository);
        }
        WorkEntryResponse saved = workEntryService.createWorkEntry(userId, projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 2. Get All Work Entries (Paginated)
    @GetMapping
    public ResponseEntity<PageResponse<WorkEntryResponse>> getAllWorkEntries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(workEntryService.getAllWorkEntries(page, size));
    }

    // 3. Get Work Entry by ID
    @GetMapping("/{id}")
    public ResponseEntity<WorkEntryResponse> getWorkEntryById(@PathVariable Long id) {
        checkEntryOwnership(id);
        return ResponseEntity.ok(workEntryService.getWorkEntryById(id));
    }

    // 4. Get Work Entries by User (Paginated)
    @GetMapping("/user/{userId}")
    public ResponseEntity<PageResponse<WorkEntryResponse>> getWorkEntriesByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (userRepository != null) {
            SecurityUtils.validateUserAccess(userId, userRepository);
        }
        return ResponseEntity.ok(workEntryService.getWorkEntriesByUser(userId, page, size));
    }

    // 5. Get Work Entries by Project (Paginated)
    @GetMapping("/project/{projectId}")
    public ResponseEntity<PageResponse<WorkEntryResponse>> getWorkEntriesByProject(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(workEntryService.getWorkEntriesByProject(projectId, page, size));
    }

    // 6. Update Work Entry
    @PutMapping("/{id}")
    public ResponseEntity<WorkEntryResponse> updateWorkEntry(
            @PathVariable Long id,
            @Valid @RequestBody WorkEntryRequest request
    ) {
        checkEntryOwnership(id);
        return ResponseEntity.ok(workEntryService.updateWorkEntry(id, request));
    }

    // 7. Delete Work Entry
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkEntry(@PathVariable Long id) {
        checkEntryOwnership(id);
        workEntryService.deleteWorkEntry(id);
        return ResponseEntity.noContent().build();
    }

    // ── Phase 14 — Workflow Lifecycle Transitions ─────────────────────────────

    // 8. Submit Work Entry (Draft -> Pending)
    @PutMapping("/{id}/submit")
    public ResponseEntity<WorkEntryResponse> submitWorkEntry(@PathVariable Long id) {
        checkEntryOwnership(id);
        return ResponseEntity.ok(workEntryService.submitWorkEntry(id));
    }

    // 9. Withdraw Work Entry (Pending -> Draft)
    @PutMapping("/{id}/withdraw")
    public ResponseEntity<WorkEntryResponse> withdrawWorkEntry(@PathVariable Long id) {
        checkEntryOwnership(id);
        return ResponseEntity.ok(workEntryService.withdrawWorkEntry(id));
    }

    // 10. Approve Work Entry (Pending -> Approved) (Admin or Authorized Team Manager)
    @PutMapping("/{id}/approve")
    public ResponseEntity<WorkEntryResponse> approveWorkEntry(@PathVariable Long id) {
        String reviewerEmail = SecurityUtils.getCurrentUserEmail().orElse("admin");
        User reviewer = userRepository != null ? userRepository.findByEmail(reviewerEmail).orElse(null) : null;
        return ResponseEntity.ok(workEntryService.approveWorkEntry(id, reviewer));
    }

    // 11. Reject Work Entry (Pending -> Rejected) (Admin or Authorized Team Manager)
    @PutMapping("/{id}/reject")
    public ResponseEntity<WorkEntryResponse> rejectWorkEntry(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = body != null ? body.get("reason") : null;
        String reviewerEmail = SecurityUtils.getCurrentUserEmail().orElse("admin");
        User reviewer = userRepository != null ? userRepository.findByEmail(reviewerEmail).orElse(null) : null;
        return ResponseEntity.ok(workEntryService.rejectWorkEntry(id, reason, reviewer));
    }

    // 11b. Get Team Work Entries for Manager / Admin Review (Paginated)
    @GetMapping("/team/{teamId}")
    public ResponseEntity<PageResponse<WorkEntryResponse>> getWorkEntriesByTeam(
            @PathVariable Long teamId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (userRepository != null) {
            SecurityUtils.requireAdminOrManagerRole(userRepository);
        }
        return ResponseEntity.ok(workEntryService.getWorkEntriesByTeam(teamId, status, page, size));
    }

    // 12. Resubmit Work Entry (Rejected -> Pending)
    @PutMapping("/{id}/resubmit")
    public ResponseEntity<WorkEntryResponse> resubmitWorkEntry(
            @PathVariable Long id,
            @Valid @RequestBody WorkEntryRequest request
    ) {
        checkEntryOwnership(id);
        return ResponseEntity.ok(workEntryService.resubmitWorkEntry(id, request));
    }

    // ── Phase 4 & 10 — Filtering & Search (Paginated) ─────────────────────────

    // 13. Filter by date range
    @GetMapping("/filter")
    public ResponseEntity<PageResponse<WorkEntryResponse>> filterByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(workEntryService.filterByDateRange(startDate, endDate, page, size));
    }

    // 14. Filter by user + date range
    @GetMapping("/filter/user/{userId}")
    public ResponseEntity<PageResponse<WorkEntryResponse>> filterByUserAndDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (userRepository != null) {
            SecurityUtils.validateUserAccess(userId, userRepository);
        }
        return ResponseEntity.ok(workEntryService.filterByUserAndDateRange(userId, startDate, endDate, page, size));
    }

    // 15. Filter by project + date range
    @GetMapping("/filter/project/{projectId}")
    public ResponseEntity<PageResponse<WorkEntryResponse>> filterByProjectAndDateRange(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(workEntryService.filterByProjectAndDateRange(projectId, startDate, endDate, page, size));
    }

    // 16. Filter by user + project + date range
    @GetMapping("/filter/user/{userId}/project/{projectId}")
    public ResponseEntity<PageResponse<WorkEntryResponse>> filterByUserAndProjectAndDateRange(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (userRepository != null) {
            SecurityUtils.validateUserAccess(userId, userRepository);
        }
        return ResponseEntity.ok(
                workEntryService.filterByUserAndProjectAndDateRange(userId, projectId, startDate, endDate, page, size));
    }

    // 17. Filter by category (case-insensitive)
    @GetMapping("/filter/category/{category}")
    public ResponseEntity<PageResponse<WorkEntryResponse>> filterByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(workEntryService.filterByCategory(category, page, size));
    }

    // 18. Filter by technology (case-insensitive)
    @GetMapping("/filter/technology/{technology}")
    public ResponseEntity<PageResponse<WorkEntryResponse>> filterByTechnology(
            @PathVariable String technology,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(workEntryService.filterByTechnology(technology, page, size));
    }

    // 19. Filter by status (case-insensitive)
    @GetMapping("/filter/status/{status}")
    public ResponseEntity<PageResponse<WorkEntryResponse>> filterByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(workEntryService.filterByStatus(status, page, size));
    }

    // 20. Keyword search
    @GetMapping("/search")
    public ResponseEntity<PageResponse<WorkEntryResponse>> searchByKeyword(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(workEntryService.searchByKeyword(keyword, page, size));
    }
}