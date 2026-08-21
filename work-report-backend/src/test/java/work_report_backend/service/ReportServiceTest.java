package work_report_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import work_report_backend.dto.ReportFilterRequest;
import work_report_backend.dto.ReportPreviewResponse;
import work_report_backend.entity.Project;
import work_report_backend.entity.User;
import work_report_backend.entity.WorkEntry;
import work_report_backend.exception.InvalidDateRangeException;
import work_report_backend.exception.ResourceNotFoundException;
import work_report_backend.repository.UserRepository;
import work_report_backend.repository.WorkEntryRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private WorkEntryRepository workEntryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReportExportService reportExportService;

    @InjectMocks
    private ReportService reportService;

    private User sampleUser;
    private Project sampleProject;
    private WorkEntry sampleEntry;

    @BeforeEach
    void setUp() {
        sampleUser = new User(1L, "Aayush", "aayush@example.com", "secret", null);
        sampleProject = new Project(10L, "DPWS", "Description", sampleUser, null);
        sampleEntry = new WorkEntry(100L, sampleUser, sampleProject, LocalDate.of(2026, 8, 15), "Task Title",
                "Description", "Development", "Java", "Completed", java.time.LocalDateTime.now(), null);
    }

    @Test
    void testGenerateReportDataSuccess() {
        ReportFilterRequest filter = new ReportFilterRequest();
        filter.setStartDate(LocalDate.of(2026, 8, 1));
        filter.setEndDate(LocalDate.of(2026, 8, 31));

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(workEntryRepository.filterReportEntries(
                eq(1L), eq(filter.getStartDate()), eq(filter.getEndDate()),
                isNull(), isNull(), isNull(), isNull(), isNull()
        )).thenReturn(List.of(sampleEntry));

        ReportPreviewResponse response = reportService.generateReportData(1L, filter);

        assertNotNull(response);
        assertEquals(1L, response.getUserId());
        assertEquals("Aayush", response.getUserName());
        assertEquals(1, response.getTotalEntries());
        assertEquals(1, response.getTotalProjects());
        assertEquals(1, response.getEntries().size());
        assertEquals("Task Title", response.getEntries().get(0).getTitle());
    }

    @Test
    void testGenerateReportDataInvalidDateRangeThrowsException() {
        ReportFilterRequest filter = new ReportFilterRequest();
        filter.setStartDate(LocalDate.of(2026, 8, 31));
        filter.setEndDate(LocalDate.of(2026, 8, 1)); // start > end

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        assertThrows(InvalidDateRangeException.class, () -> reportService.generateReportData(1L, filter));
    }

    @Test
    void testGenerateReportDataUserNotFoundThrowsException() {
        ReportFilterRequest filter = new ReportFilterRequest();
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reportService.generateReportData(99L, filter));
    }

    @Test
    void testGenerateFilename() {
        ReportFilterRequest filter = new ReportFilterRequest();
        filter.setStartDate(LocalDate.of(2026, 8, 1));
        filter.setEndDate(LocalDate.of(2026, 8, 31));

        String pdfName = reportService.generateFilename(filter, "pdf");
        assertEquals("work-report-2026-08-01-to-2026-08-31.pdf", pdfName);

        String docxName = reportService.generateFilename(filter, "docx");
        assertEquals("work-report-2026-08-01-to-2026-08-31.docx", docxName);

        String xlsxName = reportService.generateFilename(filter, "xlsx");
        assertEquals("work-report-2026-08-01-to-2026-08-31.xlsx", xlsxName);
    }
}
