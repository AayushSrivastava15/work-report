package work_report_backend.service;

import org.springframework.stereotype.Service;
import work_report_backend.dto.EffectivePermissionsResponse;
import work_report_backend.entity.Team;
import work_report_backend.entity.User;
import work_report_backend.entity.WorkEntry;
import work_report_backend.repository.TeamRepository;
import work_report_backend.util.Permission;
import work_report_backend.util.PermissionScope;

import java.util.ArrayList;
import java.util.List;

@Service
public class RbacService {

    private final TeamRepository teamRepository;

    public RbacService(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    public List<String> getEffectivePermissionStrings(User user) {
        List<String> list = new ArrayList<>();
        if (user == null) {
            return list;
        }

        String role = user.getRole() != null ? user.getRole().toUpperCase() : "USER";

        if ("ADMIN".equals(role)) {
            // Organization Admin - Full organization-level authority
            for (Permission p : Permission.values()) {
                list.add(p.name() + ":" + PermissionScope.ORGANIZATION.name());
            }
        } else if ("MANAGER".equals(role)) {
            // Team Manager - Scoped to assigned team and own resources
            list.add(Permission.USER_VIEW.name() + ":" + PermissionScope.TEAM.name());
            list.add(Permission.TEAM_VIEW.name() + ":" + PermissionScope.TEAM.name());
            list.add(Permission.TEAM_MEMBER_VIEW.name() + ":" + PermissionScope.TEAM.name());

            list.add(Permission.REPORT_CREATE.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_VIEW.name() + ":" + PermissionScope.TEAM.name());
            list.add(Permission.REPORT_UPDATE.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_DELETE.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_SUBMIT.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_WITHDRAW.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_APPROVE.name() + ":" + PermissionScope.TEAM.name());
            list.add(Permission.REPORT_REJECT.name() + ":" + PermissionScope.TEAM.name());
            list.add(Permission.REPORT_RESUBMIT.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_EXPORT.name() + ":" + PermissionScope.TEAM.name());

            list.add(Permission.PROJECT_VIEW.name() + ":" + PermissionScope.TEAM.name());
            list.add(Permission.PROJECT_CREATE.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.PROJECT_UPDATE.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.PROJECT_DELETE.name() + ":" + PermissionScope.OWN.name());
        } else {
            // Standard User / Team Member - Own scope only
            list.add(Permission.REPORT_CREATE.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_VIEW.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_UPDATE.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_DELETE.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_SUBMIT.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_WITHDRAW.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_RESUBMIT.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.REPORT_EXPORT.name() + ":" + PermissionScope.OWN.name());

            list.add(Permission.PROJECT_VIEW.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.PROJECT_CREATE.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.PROJECT_UPDATE.name() + ":" + PermissionScope.OWN.name());
            list.add(Permission.PROJECT_DELETE.name() + ":" + PermissionScope.OWN.name());

            list.add(Permission.TEAM_VIEW.name() + ":" + PermissionScope.OWN.name());
        }

        return list;
    }

    public boolean hasPermission(User user, Permission permission, PermissionScope requiredScope) {
        if (user == null) return false;
        List<String> perms = getEffectivePermissionStrings(user);
        String target = permission.name() + ":" + requiredScope.name();
        if (perms.contains(target)) return true;

        // Organization scope satisfies Team and Own
        if (requiredScope == PermissionScope.TEAM && perms.contains(permission.name() + ":" + PermissionScope.ORGANIZATION.name())) {
            return true;
        }
        if (requiredScope == PermissionScope.OWN && (
                perms.contains(permission.name() + ":" + PermissionScope.ORGANIZATION.name()) ||
                perms.contains(permission.name() + ":" + PermissionScope.TEAM.name()))) {
            return true;
        }
        return false;
    }

    public boolean canReviewWorkEntry(User reviewer, WorkEntry entry) {
        if (reviewer == null || entry == null || entry.getUser() == null) {
            return false;
        }

        // Rule 0: Solo / Individual Workspace Exemption
        // In an INDIVIDUAL workspace, the user is the sole owner and manages their own report lifecycle.
        boolean isIndividualWorkspace = entry.getOrganization() != null &&
                "INDIVIDUAL".equalsIgnoreCase(entry.getOrganization().getType());

        if (isIndividualWorkspace && reviewer.getId().equals(entry.getUser().getId())) {
            return true;
        }

        // Rule 1: Self-approval is strictly forbidden in Corporate / Team organizations
        if (reviewer.getId().equals(entry.getUser().getId())) {
            return false;
        }

        // Rule 2: Must be in the same organization
        if (reviewer.getOrganization() == null || entry.getOrganization() == null ||
            !reviewer.getOrganization().getId().equals(entry.getOrganization().getId())) {
            return false;
        }

        String role = reviewer.getRole() != null ? reviewer.getRole().toUpperCase() : "USER";

        // Rule 3: Organization Admin has authority over all entries in the organization
        if ("ADMIN".equals(role)) {
            return true;
        }

        // Rule 4: Team Manager can review if the author belongs to their managed team
        if ("MANAGER".equals(role)) {
            User author = entry.getUser();
            if (author.getTeam() != null) {
                // Check if reviewer is the manager of the author's team
                if (author.getTeam().getManager() != null && author.getTeam().getManager().getId().equals(reviewer.getId())) {
                    return true;
                }
                // Or if reviewer is in the same team as a manager
                if (reviewer.getTeam() != null && reviewer.getTeam().getId().equals(author.getTeam().getId())) {
                    return true;
                }
            }
        }

        return false;
    }

    public boolean canViewWorkEntry(User viewer, WorkEntry entry) {
        if (viewer == null || entry == null) {
            return false;
        }

        // Rule 1: Author can always view own entry
        if (entry.getUser() != null && viewer.getId().equals(entry.getUser().getId())) {
            return true;
        }

        // Rule 2: Must be in same organization
        if (viewer.getOrganization() == null || entry.getOrganization() == null ||
            !viewer.getOrganization().getId().equals(entry.getOrganization().getId())) {
            return false;
        }

        String role = viewer.getRole() != null ? viewer.getRole().toUpperCase() : "USER";

        if ("ADMIN".equals(role)) {
            return true;
        }

        if ("MANAGER".equals(role)) {
            User author = entry.getUser();
            if (author != null && author.getTeam() != null) {
                if (author.getTeam().getManager() != null && author.getTeam().getManager().getId().equals(viewer.getId())) {
                    return true;
                }
                if (viewer.getTeam() != null && viewer.getTeam().getId().equals(author.getTeam().getId())) {
                    return true;
                }
            }
        }

        return false;
    }

    public EffectivePermissionsResponse buildEffectivePermissions(User user) {
        if (user == null) {
            return new EffectivePermissionsResponse();
        }

        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        String orgName = user.getOrganization() != null ? user.getOrganization().getName() : null;
        String orgCode = user.getOrganization() != null ? user.getOrganization().getCode() : null;

        Long teamId = user.getTeam() != null ? user.getTeam().getId() : null;
        String teamName = user.getTeam() != null ? user.getTeam().getName() : null;

        // Check if user is assigned as a manager for any team
        List<Team> managedTeams = teamRepository != null && user.getId() != null ?
                teamRepository.findByManagerId(user.getId()) : List.of();
        boolean isManager = "MANAGER".equalsIgnoreCase(user.getRole()) || !managedTeams.isEmpty();
        Long managedTeamId = !managedTeams.isEmpty() ? managedTeams.get(0).getId() : null;
        String managedTeamName = !managedTeams.isEmpty() ? managedTeams.get(0).getName() : null;

        List<String> permissions = getEffectivePermissionStrings(user);

        return new EffectivePermissionsResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                orgId,
                orgName,
                orgCode,
                teamId,
                teamName,
                isManager,
                managedTeamId,
                managedTeamName,
                permissions
        );
    }
}
