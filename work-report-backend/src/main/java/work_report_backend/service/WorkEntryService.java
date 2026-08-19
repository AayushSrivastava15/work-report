package work_report_backend.service;

import org.springframework.stereotype.Service;
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

    // ── Phase 3 — CRUD ────────────────────────────────────────────────────────

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

        WorkEntry workEntry = new WorkEntry();
        workEntry.setDate(request.getDate());
        workEntry.setTitle(request.getTitle());
        workEntry.setDescription(request.getDescription());
        workEntry.setCategory(request.getCategory());
        workEntry.setTechnology(request.getTechnology());
        workEntry.setStatus(request.getStatus());
        workEntry.setUser(user);
        workEntry.setProject(project);

        WorkEntry savedWorkEntry = workEntryRepository.save(workEntry);
        return convertToResponse(savedWorkEntry);
    }

    // Get All Work Entries
    public List<WorkEntryResponse> getAllWorkEntries() {
        return workEntryRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get Work Entry by ID
    public WorkEntryResponse getWorkEntryById(Long id) {
        WorkEntry workEntry = workEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work entry not found with id: " + id));
        return convertToResponse(workEntry);
    }

    // Get Work Entries by User (ordered by date descending)
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

    // Get Work Entries by Project
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

    // Update Work Entry
    public WorkEntryResponse updateWorkEntry(Long id, WorkEntryRequest request) {
        WorkEntry existingEntry = workEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work entry not found with id: " + id));

        existingEntry.setDate(request.getDate());
        existingEntry.setTitle(request.getTitle());
        existingEntry.setDescription(request.getDescription());
        existingEntry.setCategory(request.getCategory());
        existingEntry.setTechnology(request.getTechnology());
        existingEntry.setStatus(request.getStatus());
        // id, user, project are NOT changed

        WorkEntry saved = workEntryRepository.save(existingEntry);
        return convertToResponse(saved);
    }

    // Delete Work Entry
    public void deleteWorkEntry(Long id) {
        if (!workEntryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Work entry not found with id: " + id);
        }
        workEntryRepository.deleteById(id);
    }

    // ── Phase 4 — Filtering & Search ─────────────────────────────────────────

    // 1. Filter by date range (no user/project restriction)
    public List<WorkEntryResponse> filterByDateRange(LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        return workEntryRepository
                .findByDateBetweenOrderByDateDesc(startDate, endDate)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
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

    // 4. Filter by user + project + date range
    public List<WorkEntryResponse> filterByUserAndProjectAndDateRange(
            Long userId, Long projectId, LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with id: " + projectId);
        }
        return workEntryRepository
                .findByUserIdAndProjectIdAndDateBetweenOrderByDateDesc(userId, projectId, startDate, endDate)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 5. Filter by category (case-insensitive)
    public List<WorkEntryResponse> filterByCategory(String category) {
        return workEntryRepository
                .findByCategoryIgnoreCaseOrderByDateDesc(category)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 6. Filter by technology (case-insensitive)
    public List<WorkEntryResponse> filterByTechnology(String technology) {
        return workEntryRepository
                .findByTechnologyIgnoreCaseOrderByDateDesc(technology)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 7. Filter by status (case-insensitive)
    public List<WorkEntryResponse> filterByStatus(String status) {
        return workEntryRepository
                .findByStatusIgnoreCaseOrderByDateDesc(status)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 8. Keyword search across title, description, category, technology
    public List<WorkEntryResponse> searchByKeyword(String keyword) {
        return workEntryRepository
                .searchByKeyword(keyword)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new InvalidDateRangeException(
                    "startDate (" + startDate + ") must not be after endDate (" + endDate + ")"
            );
        }
    }

    // Convert Entity -> Response DTO
    private WorkEntryResponse convertToResponse(WorkEntry workEntry) {
        return new WorkEntryResponse(
                workEntry.getId(),
                workEntry.getDate(),
                workEntry.getTitle(),
                workEntry.getDescription(),
                workEntry.getCategory(),
                workEntry.getTechnology(),
                workEntry.getStatus(),
                workEntry.getProject() != null ? workEntry.getProject().getId() : null,
                workEntry.getProject() != null ? workEntry.getProject().getName() : null
        );
    }
}