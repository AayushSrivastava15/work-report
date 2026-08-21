package work_report_backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import work_report_backend.entity.WorkEntry;
import work_report_backend.repository.WorkEntryRepository;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class WorkReportBackendApplicationTests {

    @Autowired
    private WorkEntryRepository workEntryRepository;

    @Test
    void contextLoads() {
    }

    @Test
    void testFilterReportEntries_WithAllNulls() {
        List<WorkEntry> entries = workEntryRepository.filterReportEntries(
                1L, null, null, null, null, null, null, null
        );
        assertNotNull(entries);
    }

    @Test
    void testFilterReportEntries_WithFilters() {
        List<WorkEntry> entries = workEntryRepository.filterReportEntries(
                1L,
                LocalDate.now().minusDays(30),
                LocalDate.now(),
                null,
                "Development",
                "React",
                "Completed",
                "search"
        );
        assertNotNull(entries);
    }
}
