package work_report_backend.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import work_report_backend.dto.LoginRequest;
import work_report_backend.dto.LoginResponse;
import work_report_backend.dto.UserResponse;
import work_report_backend.exception.InvalidCredentialsException;
import work_report_backend.service.UserService;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("test@example.com", "password123");
        UserResponse user = new UserResponse(1L, "Test User", "test@example.com", LocalDateTime.now());
        LoginResponse mockResponse = new LoginResponse("mock.jwt.token", "Bearer", 3600000L, user);

        when(userService.login(any(LoginRequest.class))).thenReturn(mockResponse);

        ResponseEntity<LoginResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("mock.jwt.token", response.getBody().getToken());
        assertEquals("Bearer", response.getBody().getTokenType());
        assertEquals(3600000L, response.getBody().getExpiresIn());
        assertNotNull(response.getBody().getUser());
        assertEquals("Test User", response.getBody().getUser().getName());
        assertEquals("test@example.com", response.getBody().getUser().getEmail());
        assertEquals(1L, response.getBody().getUser().getId());
    }

    @Test
    void testLoginInvalidCredentials() {
        LoginRequest request = new LoginRequest("test@example.com", "wrongpassword");

        when(userService.login(any(LoginRequest.class)))
                .thenThrow(new InvalidCredentialsException("Invalid email or password"));

        assertThrows(InvalidCredentialsException.class, () -> authController.login(request));
    }
}
