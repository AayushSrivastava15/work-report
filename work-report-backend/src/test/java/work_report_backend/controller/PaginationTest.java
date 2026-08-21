package work_report_backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import work_report_backend.dto.PageResponse;
import work_report_backend.dto.ProjectResponse;
import work_report_backend.dto.WorkEntryResponse;
import work_report_backend.exception.GlobalExceptionHandler;
import work_report_backend.service.ProjectService;
import work_report_backend.service.WorkEntryService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PaginationTest {

    private MockMvc workEntryMockMvc;
    private MockMvc projectMockMvc;

    @Mock
    private WorkEntryService workEntryService;

    @Mock
    private ProjectService projectService;

    @InjectMocks
    private WorkEntryController workEntryController;

    @InjectMocks
    private ProjectController projectController;

    @BeforeEach
    void setUp() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        workEntryMockMvc = MockMvcBuilders.standaloneSetup(workEntryController).setControllerAdvice(handler).build();
        projectMockMvc = MockMvcBuilders.standaloneSetup(projectController).setControllerAdvice(handler).build();
    }

    // TEST 1 — FIRST PAGE (page=0, size=10)
    @Test
    void testGetWorkEntries_FirstPage_Returns200WithPageResponse() throws Exception {
        WorkEntryResponse item1 = new WorkEntryResponse(1L, LocalDate.now(), "Task 1", "Desc 1", "Development", "Java", "Completed", 1L, "Proj");
        PageResponse<WorkEntryResponse> mockPage = new PageResponse<>(
                List.of(item1), 0, 10, 42L, 5, true, false
        );

        when(workEntryService.getAllWorkEntries(0, 10)).thenReturn(mockPage);

        workEntryMockMvc.perform(get("/api/work-entries?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(42))
                .andExpect(jsonPath("$.totalPages").value(5))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(false))
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title").value("Task 1"));
    }

    // TEST 2 — SECOND PAGE (page=1, size=10)
    @Test
    void testGetWorkEntries_SecondPage_ReturnsPage1() throws Exception {
        WorkEntryResponse item11 = new WorkEntryResponse(11L, LocalDate.now(), "Task 11", "Desc 11", "Development", "Java", "Completed", 1L, "Proj");
        PageResponse<WorkEntryResponse> mockPage = new PageResponse<>(
                List.of(item11), 1, 10, 42L, 5, false, false
        );

        when(workEntryService.getAllWorkEntries(1, 10)).thenReturn(mockPage);

        workEntryMockMvc.perform(get("/api/work-entries?page=1&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.first").value(false))
                .andExpect(jsonPath("$.last").value(false))
                .andExpect(jsonPath("$.content[0].title").value("Task 11"));
    }

    // TEST 3 — TOTAL COUNT (totalElements=42, totalPages=5 for size=10)
    @Test
    void testGetWorkEntries_TotalCountVerification() throws Exception {
        PageResponse<WorkEntryResponse> mockPage = new PageResponse<>(
                List.of(), 0, 10, 42L, 5, true, false
        );

        when(workEntryService.getAllWorkEntries(0, 10)).thenReturn(mockPage);

        workEntryMockMvc.perform(get("/api/work-entries?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(42))
                .andExpect(jsonPath("$.totalPages").value(5));
    }

    // TEST 4 — LAST PAGE (page=4, size=10, last=true)
    @Test
    void testGetWorkEntries_LastPage_ReturnsLastTrue() throws Exception {
        WorkEntryResponse item41 = new WorkEntryResponse(41L, LocalDate.now(), "Task 41", "Desc", "Testing", "JUnit", "Completed", 1L, "Proj");
        WorkEntryResponse item42 = new WorkEntryResponse(42L, LocalDate.now(), "Task 42", "Desc", "Testing", "JUnit", "Completed", 1L, "Proj");
        PageResponse<WorkEntryResponse> mockPage = new PageResponse<>(
                List.of(item41, item42), 4, 10, 42L, 5, false, true
        );

        when(workEntryService.getAllWorkEntries(4, 10)).thenReturn(mockPage);

        workEntryMockMvc.perform(get("/api/work-entries?page=4&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(4))
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.first").value(false))
                .andExpect(jsonPath("$.last").value(true));
    }

    // TEST 5 — OVERSIZED PAGE (size=10000 passed to controller)
    @Test
    void testGetWorkEntries_OversizedPage() throws Exception {
        PageResponse<WorkEntryResponse> mockPage = new PageResponse<>(
                List.of(), 0, 100, 5L, 1, true, true
        );

        when(workEntryService.getAllWorkEntries(0, 10000)).thenReturn(mockPage);

        workEntryMockMvc.perform(get("/api/work-entries?page=0&size=10000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(100));
    }

    // TEST 6 — INVALID PAGE (page=-1 -> 400 Bad Request)
    @Test
    void testGetWorkEntries_NegativePage_Returns400() throws Exception {
        when(workEntryService.getAllWorkEntries(-1, 10))
                .thenThrow(new IllegalArgumentException("Page index must not be less than zero."));

        workEntryMockMvc.perform(get("/api/work-entries?page=-1&size=10"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Invalid Parameter"))
                .andExpect(jsonPath("$.message").value("Page index must not be less than zero."));
    }

    // TEST 7 — INVALID SIZE (size=0 -> 400 Bad Request)
    @Test
    void testGetWorkEntries_ZeroSize_Returns400() throws Exception {
        when(workEntryService.getAllWorkEntries(0, 0))
                .thenThrow(new IllegalArgumentException("Page size must be greater than zero."));

        workEntryMockMvc.perform(get("/api/work-entries?page=0&size=0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Invalid Parameter"))
                .andExpect(jsonPath("$.message").value("Page size must be greater than zero."));
    }

    // TEST 8 — SEARCH PAGINATION (search + page=0&size=10)
    @Test
    void testSearchWorkEntries_Paginated() throws Exception {
        WorkEntryResponse item = new WorkEntryResponse(1L, LocalDate.now(), "Spring Boot Dev", "Desc", "Dev", "Java", "Completed", 1L, "Proj");
        PageResponse<WorkEntryResponse> mockPage = new PageResponse<>(
                List.of(item), 0, 10, 1L, 1, true, true
        );

        when(workEntryService.searchByKeyword("Spring", 0, 10)).thenReturn(mockPage);

        workEntryMockMvc.perform(get("/api/work-entries/search?keyword=Spring&page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title").value("Spring Boot Dev"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // TEST 9 — FILTER PAGINATION (filter + date range + page=0&size=10)
    @Test
    void testFilterWorkEntries_Paginated() throws Exception {
        LocalDate start = LocalDate.of(2026, 8, 1);
        LocalDate end = LocalDate.of(2026, 8, 31);
        WorkEntryResponse item = new WorkEntryResponse(1L, LocalDate.of(2026, 8, 15), "Filtered Task", "Desc", "Dev", "Java", "Completed", 1L, "Proj");
        PageResponse<WorkEntryResponse> mockPage = new PageResponse<>(
                List.of(item), 0, 10, 1L, 1, true, true
        );

        when(workEntryService.filterByDateRange(eq(start), eq(end), eq(0), eq(10))).thenReturn(mockPage);

        workEntryMockMvc.perform(get("/api/work-entries/filter?startDate=2026-08-01&endDate=2026-08-31&page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title").value("Filtered Task"));
    }

    // TEST 10 — USER ISOLATION (user work entries only queries user 1)
    @Test
    void testGetUserWorkEntries_UserIsolation() throws Exception {
        WorkEntryResponse user1Item = new WorkEntryResponse(1L, LocalDate.now(), "User 1 Entry", "Desc", "Dev", "Java", "Completed", 1L, "Proj");
        PageResponse<WorkEntryResponse> mockPage = new PageResponse<>(
                List.of(user1Item), 0, 10, 1L, 1, true, true
        );

        when(workEntryService.getWorkEntriesByUser(eq(1L), eq(0), eq(10))).thenReturn(mockPage);

        workEntryMockMvc.perform(get("/api/work-entries/user/1?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("User 1 Entry"));
    }

    // TEST 11 — PROJECT PAGINATION (projects/user/1?page=0&size=10)
    @Test
    void testGetProjectsByUser_Paginated() throws Exception {
        ProjectResponse proj = new ProjectResponse(1L, "Project Alpha", "Description", 1L, LocalDateTime.now());
        PageResponse<ProjectResponse> mockPage = new PageResponse<>(
                List.of(proj), 0, 10, 1L, 1, true, true
        );

        when(projectService.getProjectsByUser(eq(1L), eq(0), eq(10))).thenReturn(mockPage);

        projectMockMvc.perform(get("/api/projects/user/1?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].name").value("Project Alpha"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}
