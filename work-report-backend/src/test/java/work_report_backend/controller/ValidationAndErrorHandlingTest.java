package work_report_backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import work_report_backend.dto.LoginRequest;

import work_report_backend.dto.UserRequest;
import work_report_backend.dto.WorkEntryRequest;
import work_report_backend.dto.WorkEntryResponse;
import work_report_backend.exception.DuplicateResourceException;
import work_report_backend.exception.GlobalExceptionHandler;
import work_report_backend.exception.InvalidCredentialsException;
import work_report_backend.exception.ResourceNotFoundException;
import work_report_backend.service.ProjectService;
import work_report_backend.service.ReportService;
import work_report_backend.service.UserService;
import work_report_backend.service.WorkEntryService;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ValidationAndErrorHandlingTest {

        private MockMvc projectMockMvc;
        private MockMvc workEntryMockMvc;
        private MockMvc userMockMvc;
        private MockMvc authMockMvc;
        // private MockMvc reportMockMvc;

        @Mock
        private ProjectService projectService;

        @Mock
        private WorkEntryService workEntryService;

        @Mock
        private UserService userService;

        @Mock
        private ReportService reportService;

        @InjectMocks
        private ProjectController projectController;

        @InjectMocks
        private WorkEntryController workEntryController;

        @InjectMocks
        private UserController userController;

        @InjectMocks
        private AuthController authController;

        @InjectMocks
        private ReportController reportController;

        @BeforeEach
        void setUp() {
                GlobalExceptionHandler handler = new GlobalExceptionHandler();
                projectMockMvc = MockMvcBuilders.standaloneSetup(projectController).setControllerAdvice(handler)
                                .build();
                workEntryMockMvc = MockMvcBuilders.standaloneSetup(workEntryController).setControllerAdvice(handler)
                                .build();
                userMockMvc = MockMvcBuilders.standaloneSetup(userController).setControllerAdvice(handler).build();
                authMockMvc = MockMvcBuilders.standaloneSetup(authController).setControllerAdvice(handler).build();
                // reportMockMvc =
                // MockMvcBuilders.standaloneSetup(reportController).setControllerAdvice(handler).build();
        }

        // TEST 1 — Empty Project Name (400 Validation Failed)
        @Test
        void testCreateProject_EmptyName_Returns400() throws Exception {
                String json = "{\"name\":\"\", \"description\":\"desc\"}";

                projectMockMvc.perform(post("/api/projects/user/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.error").value("Validation Failed"))
                                .andExpect(jsonPath("$.fieldErrors.name").value("Project name is required"));
        }

        // TEST 2 — Whitespace Project Name (400 Validation Failed)
        @Test
        void testCreateProject_WhitespaceName_Returns400() throws Exception {
                String json = "{\"name\":\"   \", \"description\":\"desc\"}";

                projectMockMvc.perform(post("/api/projects/user/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.fieldErrors.name").value("Project name is required"));
        }

        // TEST 3 — Empty Work Entry (400 with all field errors)
        @Test
        void testCreateWorkEntry_EmptyRequest_Returns400WithFieldErrors() throws Exception {
                String json = "{}";

                workEntryMockMvc.perform(post("/api/work-entries/user/1/project/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.error").value("Validation Failed"))
                                .andExpect(jsonPath("$.fieldErrors.date").value("Date is required"))
                                .andExpect(jsonPath("$.fieldErrors.title").value("Title is required"))
                                .andExpect(jsonPath("$.fieldErrors.description").value("Description is required"))
                                .andExpect(jsonPath("$.fieldErrors.category").value("Category is required"))
                                .andExpect(jsonPath("$.fieldErrors.technology").value("Technology is required"))
                                .andExpect(jsonPath("$.fieldErrors.status").value("Status is required"));
        }

        // TEST 4 — Invalid Status Enum Value (400)
        @Test
        void testCreateWorkEntry_InvalidStatus_Returns400() throws Exception {
                String json = """
                                {
                                    "date": "2026-08-21",
                                    "title": "Title",
                                    "description": "Description",
                                    "category": "Development",
                                    "technology": "Java",
                                    "status": "InvalidStatus"
                                }
                                """;

                workEntryMockMvc.perform(post("/api/work-entries/user/1/project/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.fieldErrors.status", containsString("Status must be one of")));
        }

        // TEST 5 — Valid Work Entry Creation (201 Created)
        @Test
        void testCreateWorkEntry_Valid_Returns201() throws Exception {
                String json = """
                                {
                                    "date": "2026-08-21",
                                    "title": "New feature",
                                    "description": "Implemented feature",
                                    "category": "Development",
                                    "technology": "Java",
                                    "status": "Completed"
                                }
                                """;

                WorkEntryResponse mockResponse = new WorkEntryResponse(
                                1L, LocalDate.now(), "New feature", "Implemented feature",
                                "Development", "Java", "Completed", 1L, "Test Project");

                when(workEntryService.createWorkEntry(eq(1L), eq(1L), any(WorkEntryRequest.class)))
                                .thenReturn(mockResponse);

                workEntryMockMvc.perform(post("/api/work-entries/user/1/project/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.title").value("New feature"));
        }

        // TEST 6 — Invalid User ID (404 Not Found)
        @Test
        void testGetUserById_NotFound_Returns404() throws Exception {
                when(userService.getUserResponseById(999999L))
                                .thenThrow(new ResourceNotFoundException("User not found with id: 999999"));

                userMockMvc.perform(get("/api/users/999999"))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.status").value(404))
                                .andExpect(jsonPath("$.error").value("Not Found"))
                                .andExpect(jsonPath("$.message", containsString("User not found with id: 999999")));
        }

        // TEST 7 — Invalid Project ID (404 Not Found)
        @Test
        void testGetProjectById_NotFound_Returns404() throws Exception {
                when(projectService.getProjectById(999999L))
                                .thenThrow(new ResourceNotFoundException("Project not found with id: 999999"));

                projectMockMvc.perform(get("/api/projects/999999"))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.status").value(404))
                                .andExpect(jsonPath("$.error").value("Not Found"));
        }

        // TEST 8 — Invalid Work Entry ID (404 Not Found)
        @Test
        void testGetWorkEntryById_NotFound_Returns404() throws Exception {
                when(workEntryService.getWorkEntryById(999999L))
                                .thenThrow(new ResourceNotFoundException("Work entry not found with id: 999999"));

                workEntryMockMvc.perform(get("/api/work-entries/999999"))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.status").value(404))
                                .andExpect(jsonPath("$.error").value("Not Found"));
        }

        // TEST 9 — Invalid JSON (Malformed request body -> 400 Bad Request)
        @Test
        void testMalformedJson_Returns400() throws Exception {
                userMockMvc.perform(post("/api/users")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":"))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.error").value("Malformed JSON"));
        }

        // TEST 10 — Invalid Path Variable (Non-numeric ID -> 400 Bad Request)
        @Test
        void testInvalidPathVariable_Returns400() throws Exception {
                projectMockMvc.perform(get("/api/projects/abc"))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.error").value("Invalid Parameter"))
                                .andExpect(jsonPath("$.message", containsString("Invalid parameter 'id': abc")));
        }

        // TEST 11 — Duplicate Email Conflict (409 Conflict)
        @Test
        void testCreateUser_DuplicateEmail_Returns409() throws Exception {
                String json = "{\"name\":\"Duplicate\", \"email\":\"test@example.com\", \"password\":\"pass123\"}";

                when(userService.createUser(any(UserRequest.class)))
                                .thenThrow(new DuplicateResourceException("Email already exists: test@example.com"));

                userMockMvc.perform(post("/api/users")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.status").value(409))
                                .andExpect(jsonPath("$.error").value("Conflict"))
                                .andExpect(jsonPath("$.message", containsString("Email already exists")));
        }

        // TEST 12 — Invalid Credentials (401 Unauthorized)
        @Test
        void testLogin_InvalidCredentials_Returns401() throws Exception {
                String json = "{\"email\":\"test@example.com\", \"password\":\"wrongpass\"}";

                when(userService.login(any(LoginRequest.class)))
                                .thenThrow(new InvalidCredentialsException("Invalid email or password"));

                authMockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.status").value(401))
                                .andExpect(jsonPath("$.error").value("Unauthorized"))
                                .andExpect(jsonPath("$.message").value("Invalid email or password"));
        }

        // TEST 13 — Project Ownership Validation Failure (404)
        @Test
        void testCreateWorkEntry_ProjectDoesNotBelongToUser_Returns404() throws Exception {
                String json = """
                                {
                                    "date": "2026-08-21",
                                    "title": "Cross user task",
                                    "description": "Description",
                                    "category": "Development",
                                    "technology": "Java",
                                    "status": "Completed"
                                }
                                """;

                when(workEntryService.createWorkEntry(eq(1L), eq(2L), any(WorkEntryRequest.class)))
                                .thenThrow(new ResourceNotFoundException("Project not found with id: 2 for user: 1"));

                workEntryMockMvc.perform(post("/api/work-entries/user/1/project/2")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.status").value(404))
                                .andExpect(jsonPath("$.message").value("Project not found with id: 2 for user: 1"));
        }
}
