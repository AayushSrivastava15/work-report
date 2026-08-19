package work_report_backend.controller;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import work_report_backend.dto.WorkEntryRequest;
import work_report_backend.dto.WorkEntryResponse;
import work_report_backend.service.WorkEntryService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/work-entries")
public class WorkEntryController {

    private final WorkEntryService workEntryService;

    public WorkEntryController(WorkEntryService workEntryService) {
        this.workEntryService = workEntryService;
    }

    // ── Phase 3 — CRUD ────────────────────────────────────────────────────────

    // 1. Create Work Entry
    @PostMapping("/user/{userId}/project/{projectId}")
    public ResponseEntity<WorkEntryResponse> createWorkEntry(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @Valid @RequestBody WorkEntryRequest request
    ) {
        WorkEntryResponse saved = workEntryService.createWorkEntry(userId, projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 2. Get All Work Entries
    @GetMapping
    public ResponseEntity<List<WorkEntryResponse>> getAllWorkEntries() {
        return ResponseEntity.ok(workEntryService.getAllWorkEntries());
    }

    // 3. Get Work Entry by ID
    @GetMapping("/{id}")
    public ResponseEntity<WorkEntryResponse> getWorkEntryById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(workEntryService.getWorkEntryById(id));
    }

    // 4. Get Work Entries by User
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkEntryResponse>> getWorkEntriesByUser(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(workEntryService.getWorkEntriesByUser(userId));
    }

    // 5. Get Work Entries by Project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<WorkEntryResponse>> getWorkEntriesByProject(
            @PathVariable Long projectId
    ) {
        return ResponseEntity.ok(workEntryService.getWorkEntriesByProject(projectId));
    }

    // 6. Update Work Entry
    @PutMapping("/{id}")
    public ResponseEntity<WorkEntryResponse> updateWorkEntry(
            @PathVariable Long id,
            @Valid @RequestBody WorkEntryRequest request
    ) {
        return ResponseEntity.ok(workEntryService.updateWorkEntry(id, request));
    }

    // 7. Delete Work Entry
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkEntry(
            @PathVariable Long id
    ) {
        workEntryService.deleteWorkEntry(id);
        return ResponseEntity.noContent().build();
    }

    // ── Phase 4 — Filtering & Search ─────────────────────────────────────────

    // 8. Filter by date range
    // GET /api/work-entries/filter?startDate=2026-08-01&endDate=2026-08-31
    @GetMapping("/filter")
    public ResponseEntity<List<WorkEntryResponse>> filterByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(workEntryService.filterByDateRange(startDate, endDate));
    }

    // 9. Filter by user + date range
    // GET /api/work-entries/filter/user/{userId}?startDate=...&endDate=...
    @GetMapping("/filter/user/{userId}")
    public ResponseEntity<List<WorkEntryResponse>> filterByUserAndDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(workEntryService.filterByUserAndDateRange(userId, startDate, endDate));
    }

    // 10. Filter by project + date range
    // GET /api/work-entries/filter/project/{projectId}?startDate=...&endDate=...
    @GetMapping("/filter/project/{projectId}")
    public ResponseEntity<List<WorkEntryResponse>> filterByProjectAndDateRange(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(workEntryService.filterByProjectAndDateRange(projectId, startDate, endDate));
    }

    // 11. Filter by user + project + date range
    // GET /api/work-entries/filter/user/{userId}/project/{projectId}?startDate=...&endDate=...
    @GetMapping("/filter/user/{userId}/project/{projectId}")
    public ResponseEntity<List<WorkEntryResponse>> filterByUserAndProjectAndDateRange(
            @PathVariable Long userId,
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(
                workEntryService.filterByUserAndProjectAndDateRange(userId, projectId, startDate, endDate));
    }

    // 12. Filter by category (case-insensitive)
    // GET /api/work-entries/filter/category/{category}
    @GetMapping("/filter/category/{category}")
    public ResponseEntity<List<WorkEntryResponse>> filterByCategory(
            @PathVariable String category
    ) {
        return ResponseEntity.ok(workEntryService.filterByCategory(category));
    }

    // 13. Filter by technology (case-insensitive)
    // GET /api/work-entries/filter/technology/{technology}
    @GetMapping("/filter/technology/{technology}")
    public ResponseEntity<List<WorkEntryResponse>> filterByTechnology(
            @PathVariable String technology
    ) {
        return ResponseEntity.ok(workEntryService.filterByTechnology(technology));
    }

    // 14. Filter by status (case-insensitive)
    // GET /api/work-entries/filter/status/{status}
    @GetMapping("/filter/status/{status}")
    public ResponseEntity<List<WorkEntryResponse>> filterByStatus(
            @PathVariable String status
    ) {
        return ResponseEntity.ok(workEntryService.filterByStatus(status));
    }

    // 15. Keyword search
    // GET /api/work-entries/search?keyword=token
    @GetMapping("/search")
    public ResponseEntity<List<WorkEntryResponse>> searchByKeyword(
            @RequestParam String keyword
    ) {
        return ResponseEntity.ok(workEntryService.searchByKeyword(keyword));
    }
}