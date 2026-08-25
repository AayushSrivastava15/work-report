package work_report_backend.service;

import org.springframework.stereotype.Service;
import work_report_backend.dto.ReportFilterRequest;
import work_report_backend.dto.ReportPreviewResponse;
import work_report_backend.dto.WorkEntryResponse;
import work_report_backend.entity.User;
import work_report_backend.entity.WorkEntry;
import work_report_backend.exception.InvalidDateRangeException;
import work_report_backend.exception.ResourceNotFoundException;
import work_report_backend.repository.UserRepository;
import work_report_backend.repository.WorkEntryRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final WorkEntryRepository workEntryRepository;
    private final UserRepository userRepository;
    private final ReportExportService reportExportService;
    private final NotificationService notificationService;

    public ReportService(
            WorkEntryRepository workEntryRepository,
            UserRepository userRepository,
            ReportExportService reportExportService,
            NotificationService notificationService
    ) {
        this.workEntryRepository = workEntryRepository;
        this.userRepository = userRepository;
        this.reportExportService = reportExportService;
        this.notificationService = notificationService;
    }

    public ReportPreviewResponse generateReportData(Long userId, ReportFilterRequest filter) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            if (filter.getStartDate().isAfter(filter.getEndDate())) {
                throw new InvalidDateRangeException("Start date cannot be after end date.");
            }
        }

        List<WorkEntry> workEntries = workEntryRepository.filterReportEntries(
                userId,
                filter.getStartDate(),
                filter.getEndDate(),
                filter.getProjectId(),
                filter.getCategory(),
                filter.getTechnology(),
                filter.getStatus(),
                filter.getKeyword()
        );

        List<WorkEntryResponse> entryResponses = workEntries.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        int totalProjects = (int) entryResponses.stream()
                .map(WorkEntryResponse::getProjectId)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        return new ReportPreviewResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                filter.getStartDate(),
                filter.getEndDate(),
                entryResponses.size(),
                totalProjects,
                entryResponses
        );
    }

    public byte[] exportPdf(Long userId, ReportFilterRequest filter) {
        ReportPreviewResponse report = generateReportData(userId, filter);
        return reportExportService.generatePdf(report);
    }

    public byte[] exportDocx(Long userId, ReportFilterRequest filter) {
        ReportPreviewResponse report = generateReportData(userId, filter);
        return reportExportService.generateDocx(report);
    }

    public byte[] exportExcel(Long userId, ReportFilterRequest filter) {
        ReportPreviewResponse report = generateReportData(userId, filter);
        return reportExportService.generateExcel(report);
    }

    public String generateFilename(ReportFilterRequest filter, String extension) {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            return "work-report-" + filter.getStartDate().format(dtf) + "-to-" + filter.getEndDate().format(dtf) + "." + extension;
        } else if (filter.getStartDate() != null) {
            return "work-report-from-" + filter.getStartDate().format(dtf) + "." + extension;
        } else if (filter.getEndDate() != null) {
            return "work-report-to-" + filter.getEndDate().format(dtf) + "." + extension;
        } else {
            return "work-report-" + LocalDate.now().format(dtf) + "." + extension;
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
