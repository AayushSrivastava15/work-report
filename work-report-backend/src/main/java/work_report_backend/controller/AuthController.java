package work_report_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work_report_backend.dto.*;
import work_report_backend.service.PasswordResetService;
import work_report_backend.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;

    public AuthController(UserService userService, PasswordResetService passwordResetService) {
        this.userService = userService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRequest request) {
        UserResponse created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/me")
    public ResponseEntity<work_report_backend.dto.EffectivePermissionsResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserEffectivePermissions());
    }

    @GetMapping("/permissions")
    public ResponseEntity<work_report_backend.dto.EffectivePermissionsResponse> getPermissions() {
        return ResponseEntity.ok(userService.getCurrentUserEffectivePermissions());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String message = passwordResetService.initiatePasswordReset(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<ValidateTokenResponse> validateResetToken(@RequestParam("token") String token) {
        ValidateTokenResponse response = passwordResetService.validateToken(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.completePasswordReset(request);
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully. You can now log in."));
    }
}
