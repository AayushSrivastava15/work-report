package work_report_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import work_report_backend.dto.ForgotPasswordRequest;
import work_report_backend.dto.ResetPasswordRequest;
import work_report_backend.dto.ValidateTokenResponse;
import work_report_backend.entity.PasswordResetToken;
import work_report_backend.entity.User;
import work_report_backend.repository.PasswordResetTokenRepository;
import work_report_backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int EXPIRY_MINUTES = 30;

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public PasswordResetService(
            PasswordResetTokenRepository passwordResetTokenRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            NotificationService notificationService
    ) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @Transactional
    public String initiatePasswordReset(ForgotPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            return "If an account exists with this email, a password reset link has been sent.";
        }
        return initiatePasswordReset(request.getEmail());
    }

    @Transactional
    public String initiatePasswordReset(String email) {
        if (email == null || email.isBlank()) {
            return "If an account exists with this email, a password reset link has been sent.";
        }

        String normalizedEmail = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);

        if (userOpt.isEmpty()) {
            log.info("Password reset requested for non-existent email: {}", normalizedEmail);
            return "If an account exists with this email, a password reset link has been sent.";
        }

        User user = userOpt.get();

        // Invalidate prior pending tokens safely
        try {
            List<PasswordResetToken> pending = passwordResetTokenRepository.findByUserAndUsedFalse(user);
            for (PasswordResetToken pt : pending) {
                pt.setUsed(true);
            }
            passwordResetTokenRepository.saveAll(pending);
        } catch (Exception e) {
            log.warn("Could not invalidate prior tokens: {}", e.getMessage());
        }

        // Generate cryptographically random token
        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(EXPIRY_MINUTES);

        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiresAt);
        passwordResetTokenRepository.save(resetToken);

        log.info("Generated password reset token for user ID: {}", user.getId());

        // Dispatch transactional email notification
        try {
            notificationService.sendPasswordResetNotification(user.getEmail(), user.getName(), token, user.getId());
        } catch (Throwable t) {
            log.error("Failed to send password reset notification: {}", t.getMessage());
        }

        return "If an account exists with this email, a password reset link has been sent.";
    }

    @Transactional(readOnly = true)
    public ValidateTokenResponse validateToken(String token) {
        if (token == null || token.isBlank()) {
            return ValidateTokenResponse.invalid("Token is required");
        }

        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token.trim());
        if (tokenOpt.isEmpty()) {
            return ValidateTokenResponse.invalid("Invalid password reset token");
        }

        PasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.isUsed()) {
            return ValidateTokenResponse.invalid("This password reset token has already been used");
        }

        if (resetToken.isExpired()) {
            return ValidateTokenResponse.invalid("This password reset token has expired");
        }

        User user = resetToken.getUser();
        return ValidateTokenResponse.validPasswordReset(user.getEmail(), user.getName());
    }

    @Transactional(readOnly = true)
    public boolean validateResetToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token.trim());
        return tokenOpt.isPresent() && tokenOpt.get().isValid();
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        completePasswordReset(request);
    }

    @Transactional
    public void completePasswordReset(ResetPasswordRequest request) {
        if (request == null || request.getToken() == null || request.getToken().isBlank()) {
            throw new IllegalArgumentException("Reset token is required");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        if (request.getConfirmPassword() != null && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (!resetToken.isValid()) {
            throw new IllegalArgumentException("This password reset token has expired or has already been used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark current token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Invalidate any other pending tokens safely
        try {
            List<PasswordResetToken> pending = passwordResetTokenRepository.findByUserAndUsedFalse(user);
            for (PasswordResetToken pt : pending) {
                pt.setUsed(true);
            }
            passwordResetTokenRepository.saveAll(pending);
        } catch (Exception e) {
            log.warn("Could not invalidate remaining tokens: {}", e.getMessage());
        }

        log.info("Password successfully reset for user ID: {}", user.getId());

        // Dispatch security notification email safely
        try {
            notificationService.sendAccountStatusNotification(
                    user.getEmail(),
                    user.getName(),
                    "Password Changed Successfully",
                    "Your Work Report account password was recently updated. If you did not perform this change, please contact your workspace administrator immediately.",
                    user.getId()
            );
        } catch (Throwable t) {
            log.warn("Could not send password change notification: {}", t.getMessage());
        }
    }
}
