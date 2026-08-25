package work_report_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import work_report_backend.dto.ForgotPasswordRequest;
import work_report_backend.dto.ResetPasswordRequest;
import work_report_backend.dto.ValidateTokenResponse;
import work_report_backend.entity.PasswordResetToken;
import work_report_backend.entity.User;
import work_report_backend.repository.PasswordResetTokenRepository;
import work_report_backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private NotificationService notificationService;

    private PasswordResetService passwordResetService;

    private User testUser;

    @BeforeEach
    void setUp() {
        passwordResetService = new PasswordResetService(
                tokenRepository,
                userRepository,
                passwordEncoder,
                notificationService
        );

        testUser = new User();
        testUser.setId(1L);
        testUser.setName("John Doe");
        testUser.setEmail("john@example.com");
        testUser.setPassword("encodedOldPassword");
    }

    @Test
    @DisplayName("Initiate password reset generates token and sends notification")
    void testInitiatePasswordReset_Success() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

        String message = passwordResetService.initiatePasswordReset(new ForgotPasswordRequest("john@example.com"));

        assertNotNull(message);
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(notificationService).sendPasswordResetNotification(eq("john@example.com"), eq("John Doe"), any(), eq(1L));
    }

    @Test
    @DisplayName("Initiate password reset for non-existent email returns generic message without error")
    void testInitiatePasswordReset_NonExistentEmail() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        String message = passwordResetService.initiatePasswordReset(new ForgotPasswordRequest("unknown@example.com"));

        assertNotNull(message);
        verify(tokenRepository, never()).save(any());
        verify(notificationService, never()).sendPasswordResetNotification(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Validate token returns valid response for active unexpired token")
    void testValidateToken_Valid() {
        PasswordResetToken token = new PasswordResetToken("valid-token", testUser, LocalDateTime.now().plusMinutes(20));
        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));

        ValidateTokenResponse response = passwordResetService.validateToken("valid-token");

        assertTrue(response.isValid());
        assertEquals("john@example.com", response.getEmail());
        assertEquals("John Doe", response.getName());
    }

    @Test
    @DisplayName("Validate token returns invalid response for expired token")
    void testValidateToken_Expired() {
        PasswordResetToken token = new PasswordResetToken("expired-token", testUser, LocalDateTime.now().minusMinutes(5));
        when(tokenRepository.findByToken("expired-token")).thenReturn(Optional.of(token));

        ValidateTokenResponse response = passwordResetService.validateToken("expired-token");

        assertFalse(response.isValid());
    }

    @Test
    @DisplayName("Complete password reset updates password and marks token as used")
    void testCompletePasswordReset_Success() {
        PasswordResetToken token = new PasswordResetToken("valid-token", testUser, LocalDateTime.now().plusMinutes(20));
        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NewSecret123")).thenReturn("encodedNewSecret123");

        ResetPasswordRequest request = new ResetPasswordRequest("valid-token", "NewSecret123", "NewSecret123");
        passwordResetService.completePasswordReset(request);

        assertEquals("encodedNewSecret123", testUser.getPassword());
        assertTrue(token.isUsed());
        verify(userRepository).save(testUser);
        verify(tokenRepository).save(token);
        verify(notificationService).sendAccountStatusNotification(eq("john@example.com"), eq("John Doe"), any(), any(), eq(1L));
    }
}
