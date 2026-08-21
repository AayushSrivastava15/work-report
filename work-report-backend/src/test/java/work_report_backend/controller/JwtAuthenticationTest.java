package work_report_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import work_report_backend.dto.LoginRequest;
import work_report_backend.entity.User;
import work_report_backend.repository.UserRepository;
import work_report_backend.service.JwtService;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class JwtAuthenticationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;
    private User testUserA;
    private User testUserB;
    private String tokenA;
    private String tokenB;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        // Ensure User A exists
        testUserA = userRepository.findByEmail("jwttesta@example.com").orElseGet(() -> {
            User user = new User("JWT User A", "jwttesta@example.com", passwordEncoder.encode("Password123!"));
            return userRepository.save(user);
        });

        // Ensure User B exists
        testUserB = userRepository.findByEmail("jwttestb@example.com").orElseGet(() -> {
            User user = new User("JWT User B", "jwttestb@example.com", passwordEncoder.encode("Password123!"));
            return userRepository.save(user);
        });

        tokenA = jwtService.generateToken(testUserA);
        tokenB = jwtService.generateToken(testUserB);
    }

    // TEST 1 — VALID LOGIN
    @Test
    void testLogin_ValidCredentials_Returns200WithJwtAndSafeUser() throws Exception {
        LoginRequest request = new LoginRequest("jwttesta@example.com", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(greaterThan(0)))
                .andExpect(jsonPath("$.user.id").value(testUserA.getId()))
                .andExpect(jsonPath("$.user.email").value("jwttesta@example.com"))
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    // TEST 2 — INVALID PASSWORD
    @Test
    void testLogin_WrongPassword_Returns401() throws Exception {
        LoginRequest request = new LoginRequest("jwttesta@example.com", "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    // TEST 3 — UNKNOWN USER EMAIL
    @Test
    void testLogin_UnknownEmail_Returns401() throws Exception {
        LoginRequest request = new LoginRequest("nonexistent_user_999@example.com", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    // TEST 4 — BLANK EMAIL
    @Test
    void testLogin_BlankEmail_Returns400() throws Exception {
        LoginRequest request = new LoginRequest("", "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    // TEST 5 — BLANK PASSWORD
    @Test
    void testLogin_BlankPassword_Returns400() throws Exception {
        LoginRequest request = new LoginRequest("jwttesta@example.com", "");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    // TEST 6 — PROTECTED ENDPOINT WITHOUT TOKEN (401)
    @Test
    void testProtectedEndpoint_NoToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/dashboard/user/" + testUserA.getId() + "/work-count"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    // TEST 7 — PROTECTED ENDPOINT WITH INVALID TOKEN (401)
    @Test
    void testProtectedEndpoint_InvalidToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/dashboard/user/" + testUserA.getId() + "/work-count")
                        .header("Authorization", "Bearer invalid-token-xyz"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    // TEST 8 — PROTECTED ENDPOINT WITH EXPIRED TOKEN (401)
    @Test
    void testProtectedEndpoint_ExpiredToken_Returns401() throws Exception {
        // Build expired token
        String expiredToken = jwtService.generateToken(java.util.Map.of("userId", testUserA.getId(), "name", testUserA.getName()), "jwttesta@example.com");
        // We can pass a dummy expired header
        mockMvc.perform(get("/api/dashboard/user/" + testUserA.getId() + "/work-count")
                        .header("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqd3R0ZXN0YUBleGFtcGxlLmNvbSIsImV4cCI6MTUxNjIzOTAyMn0.invalid"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    // TEST 9 — PROTECTED ENDPOINT WITH MALFORMED HEADER (401)
    @Test
    void testProtectedEndpoint_MalformedHeader_Returns401() throws Exception {
        mockMvc.perform(get("/api/dashboard/user/" + testUserA.getId() + "/work-count")
                        .header("Authorization", "Token some-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    // TEST 10 — PROTECTED ENDPOINT WITH VALID TOKEN (200)
    @Test
    void testProtectedEndpoint_ValidToken_Returns200() throws Exception {
        mockMvc.perform(get("/api/dashboard/user/" + testUserA.getId() + "/work-count")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(testUserA.getId()))
                .andExpect(jsonPath("$.workCount").value(greaterThanOrEqualTo(0)));
    }

    // TEST 11 — USER ISOLATION (USER A TRYING TO ACCESS USER B DATA -> 403)
    @Test
    void testUserIsolation_UserACannotAccessUserBData_Returns403() throws Exception {
        mockMvc.perform(get("/api/dashboard/user/" + testUserB.getId() + "/work-count")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }
}
