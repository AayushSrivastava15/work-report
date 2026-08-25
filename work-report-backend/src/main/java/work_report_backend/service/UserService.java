package work_report_backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import work_report_backend.dto.AdminUserStatsResponse;
import work_report_backend.dto.ChangePasswordRequest;
import work_report_backend.dto.LoginRequest;
import work_report_backend.dto.LoginResponse;
import work_report_backend.dto.PageResponse;
import work_report_backend.dto.UserProfileUpdateRequest;
import work_report_backend.dto.UserRequest;
import work_report_backend.dto.UserResponse;
import work_report_backend.entity.Organization;
import work_report_backend.entity.Team;
import work_report_backend.entity.User;
import work_report_backend.exception.DuplicateResourceException;
import work_report_backend.exception.InvalidCredentialsException;
import work_report_backend.exception.ResourceNotFoundException;
import work_report_backend.repository.OrganizationRepository;
import work_report_backend.repository.TeamRepository;
import work_report_backend.repository.UserRepository;
import work_report_backend.util.SecurityUtils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttemptService;
    private final SecurityAuditService securityAuditService;
    private final RbacService rbacService;
    private final NotificationService notificationService;
    private final SecureRandom secureRandom = new SecureRandom();

    public UserService(
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            TeamRepository teamRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            LoginAttemptService loginAttemptService,
            SecurityAuditService securityAuditService,
            RbacService rbacService,
            NotificationService notificationService
    ) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.teamRepository = teamRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.loginAttemptService = loginAttemptService;
        this.securityAuditService = securityAuditService;
        this.rbacService = rbacService;
        this.notificationService = notificationService;
    }

    // Authenticate / Login User and Generate JWT with Brute Force Protection
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // 1. Check Brute-Force Rate Limiting Lockout
        if (loginAttemptService.isBlocked(email)) {
            int remaining = loginAttemptService.getRemainingLockMinutes(email);
            securityAuditService.logAccountLocked(email, remaining);
            throw new InvalidCredentialsException(
                    "Account temporarily locked due to too many failed login attempts. Please try again after " + remaining + " minute(s)."
            );
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            loginAttemptService.loginFailed(email);
            securityAuditService.logLoginFailure(email, "User not found");
            throw new InvalidCredentialsException("Invalid email or password");
        }

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());

        // Handle legacy plaintext fallback migration on login
        if (!matches && request.getPassword().equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);
            matches = true;
        }

        if (!matches) {
            loginAttemptService.loginFailed(email);
            securityAuditService.logLoginFailure(email, "Invalid password");
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Account Status Lifecycle Checks
        String status = user.getStatus() != null ? user.getStatus().toUpperCase() : "ACTIVE";
        if ("PENDING".equals(status)) {
            securityAuditService.logLoginFailure(email, "Account awaiting approval");
            String orgName = user.getOrganization() != null ? user.getOrganization().getName() : "your organization";
            throw new InvalidCredentialsException("Your account is currently awaiting administrator approval from " + orgName + ".");
        } else if ("SUSPENDED".equals(status)) {
            securityAuditService.logLoginFailure(email, "Account suspended");
            throw new InvalidCredentialsException("Your account has been suspended. Please contact your organization administrator.");
        } else if ("REJECTED".equals(status)) {
            String reasonMsg = (user.getRejectionReason() != null && !user.getRejectionReason().isBlank())
                    ? " Reason: " + user.getRejectionReason()
                    : "";
            securityAuditService.logLoginFailure(email, "Account rejected");
            throw new InvalidCredentialsException("Your account registration request was rejected." + reasonMsg);
        }

        // Clear failed attempts on successful login
        loginAttemptService.loginSucceeded(email);
        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        String orgCode = user.getOrganization() != null ? user.getOrganization().getCode() : null;
        securityAuditService.logLoginSuccess(email, user.getId(), user.getRole(), orgId, orgCode);

        String token = jwtService.generateToken(user);
        UserResponse userResponse = convertToResponse(user);

        return new LoginResponse(token, "Bearer", jwtService.getExpirationTime(), userResponse);
    }

    // Create User / Multi-Tenant Smart Registration
    @Transactional
    public UserResponse createUser(UserRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already exists: " + email);
        }

        String mode = request.getRegistrationMode() != null ? request.getRegistrationMode().trim().toUpperCase() : "";
        if (mode.isBlank()) {
            if ("INDIVIDUAL".equalsIgnoreCase(request.getAccountType()) || "SOLO".equalsIgnoreCase(request.getAccountType())) {
                mode = "INDIVIDUAL";
            } else if ("JOIN_TEAM".equalsIgnoreCase(request.getAccountType()) || "TEAM".equalsIgnoreCase(request.getAccountType()) || (request.getOrganizationCode() != null && !request.getOrganizationCode().isBlank())) {
                mode = "JOIN_TEAM";
            } else if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
                mode = "CREATE_COMPANY";
            } else {
                mode = "INDIVIDUAL";
            }
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDepartment(request.getDepartment() != null ? request.getDepartment().trim() : null);
        user.setDesignation(request.getDesignation() != null ? request.getDesignation().trim() : null);
        user.setEmployeeId(request.getEmployeeId() != null ? request.getEmployeeId().trim() : null);

        Organization targetOrg;

        // Check if an authenticated Admin is creating this user
        boolean callerIsAdmin = false;
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        if (caller != null && "ADMIN".equalsIgnoreCase(caller.getRole())) {
            callerIsAdmin = true;
        }

        if (callerIsAdmin && caller.getOrganization() != null) {
            // Admin is creating user inside their own organization
            targetOrg = caller.getOrganization();
            user.setOrganization(targetOrg);
            user.setRole(request.getRole() != null && !request.getRole().isBlank() ? request.getRole().toUpperCase() : "USER");
            user.setStatus(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus().toUpperCase() : "ACTIVE");
        } else if ("CREATE_COMPANY".equalsIgnoreCase(mode)) {
            // MODE 1: Create New Company / Team
            String compName = request.getCompanyName() != null && !request.getCompanyName().isBlank()
                    ? request.getCompanyName().trim()
                    : request.getName().trim() + "'s Organization";

            String orgCode = generateUniqueOrgCode(compName);
            targetOrg = new Organization(compName, orgCode, "COMPANY", null);
            targetOrg = organizationRepository.save(targetOrg);

            user.setOrganization(targetOrg);
            user.setRole("ADMIN");
            user.setStatus("ACTIVE");

            securityAuditService.logOrganizationCreated(compName, orgCode, "COMPANY", email);
        } else if ("JOIN_TEAM".equalsIgnoreCase(mode)) {
            // MODE 2: Join Existing Organization with Company Code
            String rawCode = (request.getOrganizationCode() != null && !request.getOrganizationCode().isBlank())
                    ? request.getOrganizationCode().trim().toUpperCase()
                    : "WORK-1001";
            targetOrg = organizationRepository.findByCode(rawCode)
                    .orElseThrow(() -> new ResourceNotFoundException("Invalid company code. No organization found with code: " + rawCode));

            user.setOrganization(targetOrg);
            user.setRole("USER");
            user.setStatus("PENDING"); // Must be approved by Organization Admin

            securityAuditService.logUserJoinRequested(email, rawCode, targetOrg.getId());
        } else {
            // MODE 3: Individual / Solo Professional Workspace
            String wsName = request.getName().trim() + "'s Personal Workspace";
            String soloCode = generateUniqueOrgCode("SOLO");
            targetOrg = new Organization(wsName, soloCode, "INDIVIDUAL", null);
            targetOrg = organizationRepository.save(targetOrg);

            user.setOrganization(targetOrg);
            user.setRole("ADMIN");
            user.setStatus("ACTIVE");

            securityAuditService.logOrganizationCreated(wsName, soloCode, "INDIVIDUAL", email);
        }

        User savedUser = userRepository.save(user);

        // If organization owner was not set (for newly created orgs), set it to this user
        if (targetOrg.getOwnerId() == null) {
            targetOrg.setOwnerId(savedUser.getId());
            organizationRepository.save(targetOrg);
        }

        securityAuditService.logUserRegistration(
                savedUser.getEmail(),
                savedUser.getId(),
                savedUser.getRole(),
                savedUser.getStatus(),
                mode,
                targetOrg.getCode()
        );

        // Send welcome transactional email if account is immediately active
        if ("ACTIVE".equalsIgnoreCase(savedUser.getStatus())) {
            notificationService.sendWelcomeNotification(savedUser);
        }

        return convertToResponse(savedUser);
    }

    // Helper: Generate collision-free human-readable Organization Code
    public String generateUniqueOrgCode(String namePrefix) {
        String prefix = namePrefix.replaceAll("[^a-zA-Z]", "").toUpperCase();
        if (prefix.length() < 3) {
            prefix = "ORG";
        } else if (prefix.length() > 6) {
            prefix = prefix.substring(0, 6);
        }

        String code;
        int attempts = 0;
        do {
            int num = 1000 + secureRandom.nextInt(9000);
            code = prefix + "-" + num;
            attempts++;
            if (attempts > 50) {
                code = "WRK-" + System.currentTimeMillis() % 100000;
                break;
            }
        } while (organizationRepository.existsByCode(code));

        return code;
    }

    // Get User by ID (returns Response DTO)
    public UserResponse getUserResponseById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToResponse(user);
    }

    // Get All Users in caller's organization (Restricted to Tenant Admin)
    public List<UserResponse> getAllUserResponses() {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        Long orgId = caller != null && caller.getOrganization() != null ? caller.getOrganization().getId() : null;

        if (orgId == null) {
            return userRepository.findAll().stream().map(this::convertToResponse).collect(Collectors.toList());
        }

        return userRepository.findByOrganizationId(orgId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Paginated search and filtering scoped strictly to Admin's organization
    public PageResponse<UserResponse> searchUsersPaginated(
            String keyword,
            String status,
            String role,
            String department,
            Long teamId,
            int page,
            int size
    ) {
        int cappedSize = Math.max(1, Math.min(size, 100));
        int validPage = Math.max(0, page);

        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        Long orgId = caller != null && caller.getOrganization() != null ? caller.getOrganization().getId() : null;

        Pageable pageable = PageRequest.of(validPage, cappedSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<User> userPage;
        if (orgId != null) {
            userPage = userRepository.searchUsersByOrg(
                    orgId,
                    keyword != null && !keyword.isBlank() ? keyword.trim() : null,
                    status != null && !status.isBlank() ? status.trim().toUpperCase() : null,
                    role != null && !role.isBlank() ? role.trim().toUpperCase() : null,
                    department != null && !department.isBlank() ? department.trim() : null,
                    teamId,
                    pageable
            );
        } else {
            userPage = userRepository.searchUsers(
                    keyword != null && !keyword.isBlank() ? keyword.trim() : null,
                    status != null && !status.isBlank() ? status.trim().toUpperCase() : null,
                    role != null && !role.isBlank() ? role.trim().toUpperCase() : null,
                    department != null && !department.isBlank() ? department.trim() : null,
                    pageable
            );
        }

        return PageResponse.of(userPage, this::convertToResponse);
    }

    // Admin User Statistics scoped strictly to Admin's organization
    public AdminUserStatsResponse getAdminUserStats() {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        Long orgId = caller != null && caller.getOrganization() != null ? caller.getOrganization().getId() : null;

        long total, active, pending, suspended, rejected;
        String orgName = caller != null && caller.getOrganization() != null ? caller.getOrganization().getName() : "Enterprise";
        String orgCode = caller != null && caller.getOrganization() != null ? caller.getOrganization().getCode() : "N/A";
        String orgType = caller != null && caller.getOrganization() != null ? caller.getOrganization().getType() : "COMPANY";

        if (orgId != null) {
            total = userRepository.countByOrganizationId(orgId);
            active = userRepository.countByOrganizationIdAndStatus(orgId, "ACTIVE");
            pending = userRepository.countByOrganizationIdAndStatus(orgId, "PENDING");
            suspended = userRepository.countByOrganizationIdAndStatus(orgId, "SUSPENDED");
            rejected = userRepository.countByOrganizationIdAndStatus(orgId, "REJECTED");
        } else {
            total = userRepository.count();
            active = userRepository.countByStatus("ACTIVE");
            pending = userRepository.countByStatus("PENDING");
            suspended = userRepository.countByStatus("SUSPENDED");
            rejected = userRepository.countByStatus("REJECTED");
        }

        return new AdminUserStatsResponse(total, active, pending, suspended, rejected, orgName, orgCode, orgType);
    }

    // Admin Action: Approve User (Enforces Tenant Isolation)
    public UserResponse approveUser(Long id, String approvedByEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        validateTenantAction(user);

        user.setStatus("ACTIVE");
        user.setApprovedAt(LocalDateTime.now());
        user.setApprovedBy(approvedByEmail);
        user.setRejectionReason(null);

        User saved = userRepository.save(user);
        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        securityAuditService.logUserStatusChange(saved.getEmail(), "ACTIVE", approvedByEmail, orgId);

        // Send approval notification email via Resend
        notificationService.sendUserApprovedNotification(saved, approvedByEmail);

        return convertToResponse(saved);
    }

    // Admin Action: Reject User (Enforces Tenant Isolation)
    public UserResponse rejectUser(Long id, String reason, String rejectedByEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        validateTenantAction(user);

        user.setStatus("REJECTED");
        user.setRejectionReason(reason);

        User saved = userRepository.save(user);
        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        securityAuditService.logUserStatusChange(saved.getEmail(), "REJECTED", rejectedByEmail, orgId);

        // Send rejection notification email via Resend
        notificationService.sendUserRejectedNotification(saved, reason);

        return convertToResponse(saved);
    }

    // Admin Action: Suspend User (Enforces Tenant Isolation)
    public UserResponse suspendUser(Long id, String actorEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        validateTenantAction(user);

        user.setStatus("SUSPENDED");
        User saved = userRepository.save(user);
        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        securityAuditService.logUserStatusChange(saved.getEmail(), "SUSPENDED", actorEmail, orgId);
        return convertToResponse(saved);
    }

    // Admin Action: Reactivate User (Enforces Tenant Isolation)
    public UserResponse reactivateUser(Long id, String actorEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        validateTenantAction(user);

        user.setStatus("ACTIVE");
        User saved = userRepository.save(user);
        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        securityAuditService.logUserStatusChange(saved.getEmail(), "ACTIVE", actorEmail, orgId);
        return convertToResponse(saved);
    }

    // Admin Action: Update User Role (Enforces Tenant Isolation & Role Constraints)
    public UserResponse updateUserRole(Long id, String newRole) {
        String actorEmail = SecurityUtils.getCurrentUserEmail().orElse("admin");
        return updateUserRole(id, newRole, actorEmail);
    }

    public UserResponse updateUserRole(Long id, String newRole, String actorEmail) {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        SecurityUtils.requireAdminRole(userRepository);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        validateTenantAction(user);

        String sanitizedRole = newRole != null ? newRole.trim().toUpperCase() : "USER";
        if (!List.of("ADMIN", "MANAGER", "USER").contains(sanitizedRole)) {
            sanitizedRole = "USER";
        }

        user.setRole(sanitizedRole);
        User saved = userRepository.save(user);
        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        securityAuditService.logUserRoleChange(saved.getEmail(), sanitizedRole, actorEmail, orgId);

        // Send role updated notification email
        notificationService.sendRoleChangedNotification(saved, sanitizedRole, actorEmail);

        return convertToResponse(saved);
    }

    // Helper: Validates that caller and target user belong to the exact same organization
    private void validateTenantAction(User targetUser) {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        if (caller == null || targetUser == null) {
            return;
        }

        if (caller.getOrganization() != null && targetUser.getOrganization() != null) {
            if (!caller.getOrganization().getId().equals(targetUser.getOrganization().getId())) {
                throw new AccessDeniedException("Access denied: You cannot perform actions on users in another organization.");
            }
        }
    }

    // Update User Profile & Team Assignment
    public UserResponse updateUser(Long id, UserRequest request) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        validateTenantAction(existingUser);

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!existingUser.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("Email already exists: " + newEmail);
        }

        existingUser.setName(request.getName().trim());
        existingUser.setEmail(newEmail);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getDepartment() != null) {
            existingUser.setDepartment(request.getDepartment().trim());
        }
        if (request.getDesignation() != null) {
            existingUser.setDesignation(request.getDesignation().trim());
        }
        if (request.getEmployeeId() != null) {
            existingUser.setEmployeeId(request.getEmployeeId().trim());
        }

        // Handle Team Assignment if provided
        if (request.getTeamId() != null) {
            Long orgId = existingUser.getOrganization() != null ? existingUser.getOrganization().getId() : null;
            if (orgId != null) {
                if (request.getTeamId() == 0L || request.getTeamId() == -1L) {
                    existingUser.setTeam(null);
                } else {
                    Team team = teamRepository.findByIdAndOrganizationId(request.getTeamId(), orgId)
                            .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + request.getTeamId()));
                    existingUser.setTeam(team);
                }
            }
        }

        User updatedUser = userRepository.save(existingUser);
        return convertToResponse(updatedUser);
    }

    // Delete User
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        validateTenantAction(user);
        userRepository.delete(user);
    }

    // Get Effective Permissions for Authenticated User
    public work_report_backend.dto.EffectivePermissionsResponse getCurrentUserEffectivePermissions() {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        if (caller == null) {
            throw new AccessDeniedException("Unauthorized: No authenticated user found.");
        }
        return rbacService.buildEffectivePermissions(caller);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }
        if (request.getDesignation() != null) {
            user.setDesignation(request.getDesignation().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }

        User updated = userRepository.save(user);
        return convertToResponse(updated);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        // Validate new password matching
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        if (request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        User saved = userRepository.save(user);

        // Send password changed security alert email via Resend
        notificationService.sendPasswordChangedNotification(saved);
    }

    // Convert Entity -> Response DTO (Includes Organization and Team Metadata)
    public UserResponse convertToResponse(User user) {
        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        String orgName = user.getOrganization() != null ? user.getOrganization().getName() : null;
        String orgCode = user.getOrganization() != null ? user.getOrganization().getCode() : null;
        String orgType = user.getOrganization() != null ? user.getOrganization().getType() : null;

        Long teamId = user.getTeam() != null ? user.getTeam().getId() : null;
        String teamName = user.getTeam() != null ? user.getTeam().getName() : null;

        UserResponse res = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getDepartment(),
                user.getDesignation(),
                user.getEmployeeId(),
                user.getRejectionReason(),
                user.getApprovedAt(),
                user.getApprovedBy(),
                user.getCreatedAt(),
                orgId,
                orgName,
                orgCode,
                orgType
        );
        res.setTeamId(teamId);
        res.setTeamName(teamName);
        res.setManager("MANAGER".equalsIgnoreCase(user.getRole()));
        res.setBio(user.getBio());
        res.setAvatarUrl(user.getAvatarUrl());
        return res;
    }
}
