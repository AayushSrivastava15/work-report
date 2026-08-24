package work_report_backend.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import work_report_backend.dto.TeamRequest;
import work_report_backend.dto.TeamResponse;
import work_report_backend.dto.UserResponse;
import work_report_backend.entity.Organization;
import work_report_backend.entity.Team;
import work_report_backend.entity.User;
import work_report_backend.exception.DuplicateResourceException;
import work_report_backend.exception.ResourceNotFoundException;
import work_report_backend.repository.TeamRepository;
import work_report_backend.repository.UserRepository;
import work_report_backend.util.SecurityUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final SecurityAuditService securityAuditService;

    public TeamService(
            TeamRepository teamRepository,
            UserRepository userRepository,
            SecurityAuditService securityAuditService
    ) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.securityAuditService = securityAuditService;
    }

    private User getCaller() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new AccessDeniedException("Unauthorized: Full authentication required."));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Unauthorized: User not found."));
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getAllTeams() {
        User caller = getCaller();
        Organization org = caller.getOrganization();
        if (org == null) {
            return List.of();
        }

        List<Team> teams = teamRepository.findByOrganizationId(org.getId());
        return teams.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Team findTeamOrValidateOrg(Long teamId, Long orgId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
        if (team.getOrganization() == null || !team.getOrganization().getId().equals(orgId)) {
            throw new AccessDeniedException("Access denied: You cannot access teams outside your organization.");
        }
        return team;
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeamById(Long id) {
        User caller = getCaller();
        Organization org = caller.getOrganization();
        if (org == null) {
            throw new AccessDeniedException("Access denied: Caller has no organization.");
        }

        Team team = findTeamOrValidateOrg(id, org.getId());
        return mapToResponse(team);
    }

    public TeamResponse createTeam(TeamRequest request) {
        User caller = getCaller();
        SecurityUtils.requireAdminRole(userRepository);

        Organization org = caller.getOrganization();
        if (org == null) {
            throw new AccessDeniedException("Access denied: Admin has no organization.");
        }

        if (teamRepository.existsByNameAndOrganizationId(request.getName(), org.getId())) {
            throw new DuplicateResourceException("A team named '" + request.getName() + "' already exists in this organization.");
        }

        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findByIdAndOrganizationId(request.getManagerId(), org.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager user not found with id: " + request.getManagerId()));

            // Promote user to MANAGER if they are currently USER
            if ("USER".equalsIgnoreCase(manager.getRole())) {
                manager.setRole("MANAGER");
                userRepository.save(manager);
            }
        }

        Team team = new Team(request.getName(), request.getDescription(), org, manager);
        Team saved = teamRepository.save(team);

        if (manager != null) {
            manager.setTeam(saved);
            userRepository.save(manager);
        }

        securityAuditService.logTeamAction(
                "TEAM_CREATED",
                saved.getId(),
                "name='" + saved.getName() + "'" + (manager != null ? " manager=" + manager.getEmail() : ""),
                caller.getEmail(),
                org.getId()
        );

        return mapToResponse(saved);
    }

    public TeamResponse updateTeam(Long id, TeamRequest request) {
        User caller = getCaller();
        SecurityUtils.requireAdminRole(userRepository);

        Organization org = caller.getOrganization();
        Team team = findTeamOrValidateOrg(id, org.getId());

        if (!team.getName().equalsIgnoreCase(request.getName()) &&
                teamRepository.existsByNameAndOrganizationId(request.getName(), org.getId())) {
            throw new DuplicateResourceException("A team named '" + request.getName() + "' already exists in this organization.");
        }

        team.setName(request.getName());
        team.setDescription(request.getDescription());

        if (request.getManagerId() != null) {
            User manager = userRepository.findByIdAndOrganizationId(request.getManagerId(), org.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager user not found with id: " + request.getManagerId()));

            if ("USER".equalsIgnoreCase(manager.getRole())) {
                manager.setRole("MANAGER");
                userRepository.save(manager);
            }
            team.setManager(manager);
            manager.setTeam(team);
            userRepository.save(manager);
        }

        Team updated = teamRepository.save(team);
        return mapToResponse(updated);
    }

    public void deleteTeam(Long id) {
        User caller = getCaller();
        SecurityUtils.requireAdminRole(userRepository);

        Organization org = caller.getOrganization();
        Team team = findTeamOrValidateOrg(id, org.getId());

        // Unassign members
        List<User> members = userRepository.findByTeamId(id);
        for (User m : members) {
            m.setTeam(null);
            if ("MANAGER".equalsIgnoreCase(m.getRole()) && (team.getManager() != null && m.getId().equals(team.getManager().getId()))) {
                m.setRole("USER");
            }
            userRepository.save(m);
        }

        teamRepository.delete(team);
        securityAuditService.logTeamAction(
                "TEAM_DELETED",
                id,
                "name='" + team.getName() + "'",
                caller.getEmail(),
                org.getId()
        );
    }

    public void addMemberToTeam(Long teamId, Long userId) {
        User caller = getCaller();
        SecurityUtils.requireAdminOrManagerRole(userRepository);

        Organization org = caller.getOrganization();
        Team team = findTeamOrValidateOrg(teamId, org.getId());

        // If caller is MANAGER, verify they manage this team
        if ("MANAGER".equalsIgnoreCase(caller.getRole())) {
            if (team.getManager() == null || !team.getManager().getId().equals(caller.getId())) {
                throw new AccessDeniedException("Access denied: You can only assign members to your own team.");
            }
        }

        User targetUser = userRepository.findByIdAndOrganizationId(userId, org.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        targetUser.setTeam(team);
        userRepository.save(targetUser);

        securityAuditService.logTeamAction(
                "MEMBER_ASSIGNED",
                teamId,
                "targetUser=" + targetUser.getEmail(),
                caller.getEmail(),
                org.getId()
        );
    }

    public void removeMemberFromTeam(Long teamId, Long userId) {
        User caller = getCaller();
        SecurityUtils.requireAdminOrManagerRole(userRepository);

        Organization org = caller.getOrganization();
        Team team = findTeamOrValidateOrg(teamId, org.getId());

        if ("MANAGER".equalsIgnoreCase(caller.getRole())) {
            if (team.getManager() == null || !team.getManager().getId().equals(caller.getId())) {
                throw new AccessDeniedException("Access denied: You can only manage your own team.");
            }
        }

        User targetUser = userRepository.findByIdAndOrganizationId(userId, org.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (targetUser.getTeam() != null && targetUser.getTeam().getId().equals(teamId)) {
            targetUser.setTeam(null);
            userRepository.save(targetUser);

            securityAuditService.logTeamAction(
                    "MEMBER_REMOVED",
                    teamId,
                    "targetUser=" + targetUser.getEmail(),
                    caller.getEmail(),
                    org.getId()
            );
        }
    }

    public void assignTeamManager(Long teamId, Long managerUserId) {
        User caller = getCaller();
        SecurityUtils.requireAdminRole(userRepository);

        Organization org = caller.getOrganization();
        Team team = findTeamOrValidateOrg(teamId, org.getId());

        User manager = userRepository.findByIdAndOrganizationId(managerUserId, org.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + managerUserId));

        if (!"ADMIN".equalsIgnoreCase(manager.getRole())) {
            manager.setRole("MANAGER");
        }
        manager.setTeam(team);
        userRepository.save(manager);

        team.setManager(manager);
        teamRepository.save(team);

        securityAuditService.logTeamAction(
                "MANAGER_ASSIGNED",
                teamId,
                "manager=" + manager.getEmail(),
                caller.getEmail(),
                org.getId()
        );
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getTeamMembers(Long teamId) {
        User caller = getCaller();
        Organization org = caller.getOrganization();
        if (org == null) {
            return List.of();
        }

        Team team = findTeamOrValidateOrg(teamId, org.getId());
        List<User> members = userRepository.findByOrganizationIdAndTeamId(org.getId(), teamId);
        return members.stream()
                .map(this::mapUserToResponse)
                .collect(Collectors.toList());
    }

    private TeamResponse mapToResponse(Team team) {
        int count = (int) userRepository.countByTeamId(team.getId());
        Long managerId = team.getManager() != null ? team.getManager().getId() : null;
        String managerName = team.getManager() != null ? team.getManager().getName() : null;
        String managerEmail = team.getManager() != null ? team.getManager().getEmail() : null;

        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getDescription(),
                team.getOrganization() != null ? team.getOrganization().getId() : null,
                team.getOrganization() != null ? team.getOrganization().getName() : null,
                managerId,
                managerName,
                managerEmail,
                count,
                team.getCreatedAt()
        );
    }

    private UserResponse mapUserToResponse(User user) {
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
