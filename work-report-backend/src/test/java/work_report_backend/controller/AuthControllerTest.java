package work_report_backend.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import work_report_backend.dto.LoginRequest;
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
        UserResponse mockResponse = new UserResponse(1L, "Test User", "test@example.com", LocalDateTime.now());

        when(userService.login(any(LoginRequest.class))).thenReturn(mockResponse);

        ResponseEntity<UserResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Test User", response.getBody().getName());
        assertEquals("test@example.com", response.getBody().getEmail());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void testLoginInvalidCredentials() {
        LoginRequest request = new LoginRequest("test@example.com", "wrongpassword");

        when(userService.login(any(LoginRequest.class)))
                .thenThrow(new InvalidCredentialsException("Invalid email or password"));

        assertThrows(InvalidCredentialsException.class, () -> authController.login(request));
    }
}
