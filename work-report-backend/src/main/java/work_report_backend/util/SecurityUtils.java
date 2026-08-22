package work_report_backend.util;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import work_report_backend.entity.Organization;
import work_report_backend.entity.Project;
import work_report_backend.entity.User;
import work_report_backend.entity.WorkEntry;
import work_report_backend.repository.UserRepository;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<String> getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return Optional.of(((UserDetails) principal).getUsername());
        } else if (principal instanceof String && !"anonymousUser".equals(principal)) {
            return Optional.of((String) principal);
        }

        return Optional.empty();
    }

    public static User getAuthenticatedUser(UserRepository userRepository) {
        String email = getCurrentUserEmail().orElse(null);
        if (email == null || userRepository == null) {
            return null;
        }
        return userRepository.findByEmail(email).orElse(null);
    }

    public static Organization getAuthenticatedUserOrg(UserRepository userRepository) {
        User user = getAuthenticatedUser(userRepository);
        return user != null ? user.getOrganization() : null;
    }

    public static void validateUserAccess(Long targetUserId, UserRepository userRepository) {
        String email = getCurrentUserEmail().orElse(null);
        if (email == null || userRepository == null) {
            return;
        }

        User caller = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Unauthorized: Authenticated user not found"));

        if (caller.getId().equals(targetUserId)) {
            return;
        }

        // If not the same user, verify admin role AND same organization
        boolean isAdmin = "ADMIN".equalsIgnoreCase(caller.getRole());
        if (!isAdmin) {
            throw new AccessDeniedException("Access denied: You cannot access resources belonging to another user.");
        }

        User targetUser = userRepository.findById(targetUserId).orElse(null);
        if (targetUser != null && targetUser.getOrganization() != null && caller.getOrganization() != null) {
            if (!caller.getOrganization().getId().equals(targetUser.getOrganization().getId())) {
                throw new AccessDeniedException("Access denied: Target user belongs to a different organization.");
            }
        }
    }

    public static void validateTenantAccess(Long targetOrgId, UserRepository userRepository) {
        String email = getCurrentUserEmail().orElse(null);
        if (email == null || userRepository == null || targetOrgId == null) {
            return;
        }

        User caller = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Unauthorized: Authenticated user not found"));

        if (caller.getOrganization() != null && !caller.getOrganization().getId().equals(targetOrgId)) {
            throw new AccessDeniedException("Access denied: Resource belongs to a different organization.");
        }
    }

    public static void validateProjectOwnership(Project project, UserRepository userRepository) {
        if (project == null || userRepository == null) {
            return;
        }
        String email = getCurrentUserEmail().orElse(null);
        if (email == null) return;

        User caller = userRepository.findByEmail(email).orElse(null);
        if (caller == null) return;

        // Verify organization match
        if (project.getOrganization() != null && caller.getOrganization() != null) {
            if (!caller.getOrganization().getId().equals(project.getOrganization().getId())) {
                throw new AccessDeniedException("Access denied: Project belongs to a different organization.");
            }
        }

        // Verify user match (unless admin)
        boolean isAdmin = "ADMIN".equalsIgnoreCase(caller.getRole());
        if (!isAdmin && project.getUser() != null && !caller.getId().equals(project.getUser().getId())) {
            throw new AccessDeniedException("Access denied: You cannot access this project.");
        }
    }

    public static void validateWorkEntryOwnership(WorkEntry workEntry, UserRepository userRepository) {
        if (workEntry == null || userRepository == null) {
            return;
        }
        String email = getCurrentUserEmail().orElse(null);
        if (email == null) return;

        User caller = userRepository.findByEmail(email).orElse(null);
        if (caller == null) return;

        // Verify organization match
        if (workEntry.getOrganization() != null && caller.getOrganization() != null) {
            if (!caller.getOrganization().getId().equals(workEntry.getOrganization().getId())) {
                throw new AccessDeniedException("Access denied: Work entry belongs to a different organization.");
            }
        }

        // Verify user match (unless admin)
        boolean isAdmin = "ADMIN".equalsIgnoreCase(caller.getRole());
        if (!isAdmin && workEntry.getUser() != null && !caller.getId().equals(workEntry.getUser().getId())) {
            throw new AccessDeniedException("Access denied: You cannot access this work entry.");
        }
    }

    public static void requireAdminRole(UserRepository userRepository) {
        requireRole(userRepository, "ADMIN");
    }

    public static void requireAdminOrManagerRole(UserRepository userRepository) {
        requireRole(userRepository, "ADMIN", "MANAGER");
    }

    public static void requireRole(UserRepository userRepository, String... allowedRoles) {
        String email = getCurrentUserEmail().orElse(null);
        if (email == null || userRepository == null) {
            throw new AccessDeniedException("Unauthorized: Full authentication is required.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Unauthorized: Authenticated user not found"));

        String userRole = user.getRole() != null ? user.getRole().toUpperCase() : "USER";
        for (String role : allowedRoles) {
            if (role.equalsIgnoreCase(userRole)) {
                return;
            }
        }

        throw new AccessDeniedException("Access denied: You do not have the required role privileges.");
    }

    public static boolean isAuthenticated() {
        return getCurrentUserEmail().isPresent();
    }
}
