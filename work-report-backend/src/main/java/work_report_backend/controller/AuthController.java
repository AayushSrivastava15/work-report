package work_report_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import work_report_backend.dto.LoginRequest;
import work_report_backend.dto.LoginResponse;
import org.springframework.http.HttpStatus;
import work_report_backend.dto.UserRequest;
import work_report_backend.dto.UserResponse;
import work_report_backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
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

    @org.springframework.web.bind.annotation.GetMapping("/me")
    public ResponseEntity<work_report_backend.dto.EffectivePermissionsResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserEffectivePermissions());
    }

    @org.springframework.web.bind.annotation.GetMapping("/permissions")
    public ResponseEntity<work_report_backend.dto.EffectivePermissionsResponse> getPermissions() {
        return ResponseEntity.ok(userService.getCurrentUserEffectivePermissions());
    }
}
