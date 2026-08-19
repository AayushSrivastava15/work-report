package work_report_backend.service;

import org.springframework.stereotype.Service;
import work_report_backend.dto.*;
import work_report_backend.entity.WorkEntry;
import work_report_backend.exception.ResourceNotFoundException;
import work_report_backend.repository.ProjectRepository;
import work_report_backend.repository.UserRepository;
import work_report_backend.repository.WorkEntryRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final WorkEntryRepository workEntryRepository;

    public DashboardService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            WorkEntryRepository workEntryRepository
    ) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.workEntryRepository = workEntryRepository;
    }

    // 1. Total work count for user
    public DashboardWorkCountResponse getWorkCount(Long userId) {
        verifyUserExists(userId);
        long count = workEntryRepository.countByUserId(userId);
        return new DashboardWorkCountResponse(userId, count);
    }

    // 2. Total project count for user
    public DashboardProjectCountResponse getProjectCount(Long userId) {
        verifyUserExists(userId);
        long count = projectRepository.countByUserId(userId);
        return new DashboardProjectCountResponse(userId, count);
    }

    // 3. Current calendar month work entries for user (dynamically calculated)
    public List<WorkEntryResponse> getCurrentMonthWork(Long userId) {
        verifyUserExists(userId);
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        return workEntryRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(userId, startOfMonth, endOfMonth)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 4. Current week work entries for user (Monday to Sunday, dynamically calculated)
    public List<WorkEntryResponse> getCurrentWeekWork(Long userId) {
        verifyUserExists(userId);
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        return workEntryRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(userId, startOfWeek, endOfWeek)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 5. Work grouped by project for user
    public List<DashboardProjectResponse> getWorkByProject(Long userId) {
        verifyUserExists(userId);
        return workEntryRepository.countWorkEntriesByProjectForUser(userId);
    }

    // 6. Work grouped by category for user
    public List<DashboardCategoryResponse> getWorkByCategory(Long userId) {
        verifyUserExists(userId);
        return workEntryRepository.countWorkEntriesByCategoryForUser(userId);
    }

    // 7. Work grouped by technology for user
    public List<DashboardTechnologyResponse> getWorkByTechnology(Long userId) {
        verifyUserExists(userId);
        return workEntryRepository.countWorkEntriesByTechnologyForUser(userId);
    }

    // 8. Work grouped by status for user
    public List<DashboardStatusResponse> getWorkByStatus(Long userId) {
        verifyUserExists(userId);
        return workEntryRepository.countWorkEntriesByStatusForUser(userId);
    }

    private void verifyUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
    }

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
