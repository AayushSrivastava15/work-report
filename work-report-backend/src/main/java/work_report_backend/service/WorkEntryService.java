package work_report_backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import work_report_backend.dto.PageResponse;
import work_report_backend.dto.WorkEntryRequest;
import work_report_backend.dto.WorkEntryResponse;
import work_report_backend.entity.Project;
import work_report_backend.entity.User;
import work_report_backend.entity.WorkEntry;
import work_report_backend.exception.InvalidDateRangeException;
import work_report_backend.exception.ResourceNotFoundException;
import work_report_backend.repository.ProjectRepository;
import work_report_backend.repository.UserRepository;
import work_report_backend.repository.WorkEntryRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkEntryService {

    private final WorkEntryRepository workEntryRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public WorkEntryService(
            WorkEntryRepository workEntryRepository,
            UserRepository userRepository,
            ProjectRepository projectRepository
    ) {
        this.workEntryRepository = workEntryRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    // ── Phase 3 & 14 — CRUD & Lifecycle ──────────────────────────────────────────

    // Create Work Entry
    public WorkEntryResponse createWorkEntry(
            Long userId,
            Long projectId,
            WorkEntryRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!project.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId + " for user: " + userId);
        }

        WorkEntry workEntry = new WorkEntry();
        workEntry.setDate(request.getDate());
        workEntry.setTitle(request.getTitle().trim());
        workEntry.setDescription(request.getDescription().trim());
        workEntry.setCategory(request.getCategory().trim());
        workEntry.setTechnology(request.getTechnology().trim());
        workEntry.setOrganization(user.getOrganization());

        String initialStatus = request.getStatus() != null ? request.getStatus().trim() : "DRAFT";
        workEntry.setStatus(initialStatus);

        if ("PENDING".equalsIgnoreCase(initialStatus) || "SUBMITTED".equalsIgnoreCase(initialStatus)) {
            workEntry.setSubmittedAt(LocalDateTime.now());
        }

        workEntry.setUser(user);
        workEntry.setProject(project);

        WorkEntry savedWorkEntry = workEntryRepository.save(workEntry);
        return convertToResponse(savedWorkEntry);
    }

    // Get All Work Entries (Unpaginated)
    public List<WorkEntryResponse> getAllWorkEntries() {
        return workEntryRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get All Work Entries (Paginated)
    public PageResponse<WorkEntryResponse> getAllWorkEntries(int page, int size) {
        Pageable pageable = createPageable(page, size, defaultSort());
        Page<WorkEntry> entryPage = workEntryRepository.findAll(pageable);
        return PageResponse.of(entryPage, this::convertToResponse);
    }

    // Get Work Entry by ID
    public WorkEntryResponse getWorkEntryById(Long id) {
        WorkEntry workEntry = workEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work entry not found with id: " + id));
        return convertToResponse(workEntry);
    }

    // Get Work Entries by User (Unpaginated)
    public List<WorkEntryResponse> getWorkEntriesByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return workEntryRepository
                .findByUserIdOrderByDateDesc(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get Work Entries by User (Paginated)
    public PageResponse<WorkEntryResponse> getWorkEntriesByUser(Long userId, int page, int size) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        Pageable pageable = createPageable(page, size, defaultSort());
        Page<WorkEntry> entryPage = workEntryRepository.findByUserId(userId, pageable);
        return PageResponse.of(entryPage, this::convertToResponse);
    }

    // Get Work Entries by Project (Unpaginated)
    public List<WorkEntryResponse> getWorkEntriesByProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId);
        }
        return workEntryRepository
                .findByProjectId(projectId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get Work Entries by Project (Paginated)
    public PageResponse<WorkEntryResponse> getWorkEntriesByProject(Long projectId, int page, int size) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId);
        }
        Pageable pageable = createPageable(page, size, defaultSort());
        Page<WorkEntry> entryPage = workEntryRepository.findByProjectId(projectId, pageable);
        return PageResponse.of(entryPage, this::convertToResponse);
    }

    // Update Work Entry
    public WorkEntryResponse updateWorkEntry(Long id, WorkEntryRequest request) {
        WorkEntry existingEntry = workEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work entry not found with id: " + id));

        String currentStatus = existingEntry.getStatus() != null ? existingEntry.getStatus().toUpperCase() : "DRAFT";
        if ("APPROVED".equals(currentStatus)) {
            throw new IllegalStateException("Approved work entries are locked and cannot be directly modified.");
        }

        existingEntry.setDate(request.getDate());
        existingEntry.setTitle(request.getTitle().trim());
        existingEntry.setDescription(request.getDescription().trim());
        existingEntry.setCategory(request.getCategory().trim());
        existingEntry.setTechnology(request.getTechnology().trim());
        existingEntry.setStatus(request.getStatus());

        WorkEntry saved = workEntryRepository.save(existingEntry);
        return convertToResponse(saved);
    }

    // Delete Work Entry
    public void deleteWorkEntry(Long id) {
        WorkEntry existing = workEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work entry not found with id: " + id));

        String currentStatus = existing.getStatus() != null ? existing.getStatus().toUpperCase() : "DRAFT";
        if ("APPROVED".equals(currentStatus)) {
            throw new IllegalStateException("Approved work reports are archived and cannot be deleted.");
        }

        workEntryRepository.deleteById(id);
    }

    // ── Phase 14 — Workflow Lifecycle Operations ───────────────────────────────

    // 1. Submit Report for Review (DRAFT -> PENDING)
    public WorkEntryResponse submitWorkEntry(Long id) {
        WorkEntry entry = workEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work entry not found with id: " + id));

        entry.setStatus("PENDING");
        entry.setSubmittedAt(LocalDateTime.now());
        entry.setRejectionReason(null);

        WorkEntry saved = workEntryRepository.save(entry);
        return convertToResponse(saved);
    }

    // 2. Withdraw Submitted Report (PENDING -> DRAFT)
    public WorkEntryResponse withdrawWorkEntry(Long id) {
        WorkEntry entry = workEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work entry not found with id: " + id));

        String status = entry.getStatus() != null ? entry.getStatus().toUpperCase() : "";
        if (!"PENDING".equals(status) && !"SUBMITTED".equals(status)) {
            throw new IllegalStateException("Only pending entries awaiting review can be withdrawn to draft.");
        }

        entry.setStatus("DRAFT");
        WorkEntry saved = workEntryRepository.save(entry);
        return convertToResponse(saved);
    }

    // 3. Approve Report (PENDING -> APPROVED)
    public WorkEntryResponse approveWorkEntry(Long id, Long reviewerId, String reviewerName) {
        WorkEntry entry = workEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work entry not found with id: " + id));

        entry.setStatus("APPROVED");
        entry.setReviewerId(reviewerId);
        entry.setReviewerName(reviewerName);
        entry.setReviewedAt(LocalDateTime.now());
        entry.setRejectionReason(null);

        WorkEntry saved = workEntryRepository.save(entry);
        return convertToResponse(saved);
    }

    // 4. Reject Report (PENDING -> REJECTED)
    public WorkEntryResponse rejectWorkEntry(Long id, String reason, Long reviewerId, String reviewerName) {
        WorkEntry entry = workEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work entry not found with id: " + id));

        entry.setStatus("REJECTED");
        entry.setRejectionReason(reason);
        entry.setReviewerId(reviewerId);
        entry.setReviewerName(reviewerName);
        entry.setReviewedAt(LocalDateTime.now());

        WorkEntry saved = workEntryRepository.save(entry);
        return convertToResponse(saved);
    }

    // 5. Resubmit Rejected Report (REJECTED -> PENDING)
    public WorkEntryResponse resubmitWorkEntry(Long id, WorkEntryRequest request) {
        WorkEntry entry = workEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work entry not found with id: " + id));

        entry.setDate(request.getDate());
        entry.setTitle(request.getTitle().trim());
        entry.setDescription(request.getDescription().trim());
        entry.setCategory(request.getCategory().trim());
        entry.setTechnology(request.getTechnology().trim());
        entry.setStatus("PENDING");
        entry.setSubmittedAt(LocalDateTime.now());
        entry.setRejectionReason(null);

        WorkEntry saved = workEntryRepository.save(entry);
        return convertToResponse(saved);
    }

    // ── Phase 4 & 10 — Filtering & Search (Paginated & Unpaginated) ──────────

    // 1. Filter by date range
    public List<WorkEntryResponse> filterByDateRange(LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        return workEntryRepository
                .findByDateBetweenOrderByDateDesc(startDate, endDate)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<WorkEntryResponse> filterByDateRange(
            LocalDate startDate, LocalDate endDate, int page, int size) {
        validateDateRange(startDate, endDate);
        Pageable pageable = createPageable(page, size, defaultSort());
        Page<WorkEntry> entryPage = workEntryRepository.findByDateBetween(startDate, endDate, pageable);
        return PageResponse.of(entryPage, this::convertToResponse);
    }

    // 2. Filter by user + date range
    public List<WorkEntryResponse> filterByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return workEntryRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<WorkEntryResponse> filterByUserAndDateRange(
            Long userId, LocalDate startDate, LocalDate endDate, int page, int size) {
        validateDateRange(startDate, endDate);
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        Pageable pageable = createPageable(page, size, defaultSort());
        Page<WorkEntry> entryPage = workEntryRepository.findByUserIdAndDateBetween(userId, startDate, endDate, pageable);
        return PageResponse.of(entryPage, this::convertToResponse);
    }

    // 3. Filter by project + date range
    public List<WorkEntryResponse> filterByProjectAndDateRange(Long projectId, LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId);
        }
        return workEntryRepository
                .findByProjectIdAndDateBetweenOrderByDateDesc(projectId, startDate, endDate)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<WorkEntryResponse> filterByProjectAndDateRange(
            Long projectId, LocalDate startDate, LocalDate endDate, int page, int size) {
        validateDateRange(startDate, endDate);
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId);
        }
        Pageable pageable = createPageable(page, size, defaultSort());
        Page<WorkEntry> entryPage = workEntryRepository.findByProjectIdAndDateBetween(projectId, startDate, endDate, pageable);
        return PageResponse.of(entryPage, this::convertToResponse);
    }

    // 4. Filter by user + project + date range
    public List<WorkEntryResponse> filterByUserAndProjectAndDateRange(
            Long userId, Long projectId, LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!project.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId + " for user: " + userId);
        }

        return workEntryRepository
                .findByUserIdAndProjectIdAndDateBetweenOrderByDateDesc(userId, projectId, startDate, endDate)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<WorkEntryResponse> filterByUserAndProjectAndDateRange(
            Long userId, Long projectId, LocalDate startDate, LocalDate endDate, int page, int size) {
        validateDateRange(startDate, endDate);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!project.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId + " for user: " + userId);
        }

        Pageable pageable = createPageable(page, size, defaultSort());
        Page<WorkEntry> entryPage = workEntryRepository.findByUserIdAndProjectIdAndDateBetween(
                userId, projectId, startDate, endDate, pageable);
        return PageResponse.of(entryPage, this::convertToResponse);
    }

    // 5. Filter by category (case-insensitive)
    public List<WorkEntryResponse> filterByCategory(String category) {
        return workEntryRepository
                .findByCategoryIgnoreCaseOrderByDateDesc(category)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<WorkEntryResponse> filterByCategory(String category, int page, int size) {
        Pageable pageable = createPageable(page, size, defaultSort());
        Page<WorkEntry> entryPage = workEntryRepository.findByCategoryIgnoreCase(category, pageable);
        return PageResponse.of(entryPage, this::convertToResponse);
    }

    // 6. Filter by technology (case-insensitive)
    public List<WorkEntryResponse> filterByTechnology(String technology) {
        return workEntryRepository
                .findByTechnologyIgnoreCaseOrderByDateDesc(technology)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<WorkEntryResponse> filterByTechnology(String technology, int page, int size) {
        Pageable pageable = createPageable(page, size, defaultSort());
        Page<WorkEntry> entryPage = workEntryRepository.findByTechnologyIgnoreCase(technology, pageable);
        return PageResponse.of(entryPage, this::convertToResponse);
    }

    // 7. Filter by status (case-insensitive)
    public List<WorkEntryResponse> filterByStatus(String status) {
        return workEntryRepository
                .findByStatusIgnoreCaseOrderByDateDesc(status)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<WorkEntryResponse> filterByStatus(String status, int page, int size) {
        Pageable pageable = createPageable(page, size, defaultSort());
        Page<WorkEntry> entryPage = workEntryRepository.findByStatusIgnoreCase(status, pageable);
        return PageResponse.of(entryPage, this::convertToResponse);
    }

    // 8. Keyword search across title, description, category, technology
    public List<WorkEntryResponse> searchByKeyword(String keyword) {
        return workEntryRepository
                .searchByKeyword(keyword)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PageResponse<WorkEntryResponse> searchByKeyword(String keyword, int page, int size) {
        Pageable pageable = createPageable(page, size, defaultSort());
        Page<WorkEntry> entryPage = workEntryRepository.searchByKeyword(keyword, pageable);
        return PageResponse.of(entryPage, this::convertToResponse);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Pageable createPageable(int page, int size, Sort sort) {
        if (page < 0) {
            throw new IllegalArgumentException("Page index must not be less than zero.");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be greater than zero.");
        }
        int effectiveSize = Math.min(size, 100);
        return PageRequest.of(page, effectiveSize, sort);
    }

    private Sort defaultSort() {
        return Sort.by(
                Sort.Order.desc("date"),
                Sort.Order.desc("id")
        );
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new InvalidDateRangeException("Start date cannot be after end date.");
        }
    }

    // Convert Entity -> Response DTO
    public WorkEntryResponse convertToResponse(WorkEntry workEntry) {
        return new WorkEntryResponse(
                workEntry.getId(),
                workEntry.getDate(),
                workEntry.getTitle(),
                workEntry.getDescription(),
                workEntry.getCategory(),
                workEntry.getTechnology(),
                workEntry.getStatus(),
                workEntry.getProject() != null ? workEntry.getProject().getId() : null,
                workEntry.getProject() != null ? workEntry.getProject().getName() : null,
                workEntry.getSubmittedAt(),
                workEntry.getReviewerId(),
                workEntry.getReviewerName(),
                workEntry.getReviewedAt(),
                workEntry.getRejectionReason(),
                workEntry.getCreatedAt(),
                workEntry.getUpdatedAt()
        );
    }
}