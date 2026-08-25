package work_report_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import work_report_backend.dto.TeamInvitationRequest;
import work_report_backend.dto.TeamInvitationResponse;
import work_report_backend.dto.ValidateTokenResponse;
import work_report_backend.entity.Organization;
import work_report_backend.entity.Team;
import work_report_backend.entity.TeamInvitation;
import work_report_backend.entity.User;
import work_report_backend.exception.DuplicateResourceException;
import work_report_backend.exception.ResourceNotFoundException;
import work_report_backend.repository.TeamInvitationRepository;
import work_report_backend.repository.TeamRepository;
import work_report_backend.repository.UserRepository;
import work_report_backend.util.SecurityUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TeamInvitationService {

    private static final Logger log = LoggerFactory.getLogger(TeamInvitationService.class);
    private static final int EXPIRY_DAYS = 7;

    private final TeamInvitationRepository teamInvitationRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TeamInvitationService(
            TeamInvitationRepository teamInvitationRepository,
            TeamRepository teamRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.teamInvitationRepository = teamInvitationRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User resolveCaller(User caller) {
        if (caller != null) {
            return caller;
        }
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new AccessDeniedException("Unauthorized: Full authentication required."));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Unauthorized: User not found."));
    }

    public TeamInvitationResponse createInvitation(Long teamId, TeamInvitationRequest request) {
        return inviteMember(teamId, request, null);
    }

    public TeamInvitationResponse inviteMember(Long teamId, TeamInvitationRequest request, User caller) {
        User inviter = resolveCaller(caller);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));

        Organization org = inviter.getOrganization();
        if (org == null || team.getOrganization() == null || !team.getOrganization().getId().equals(org.getId())) {
            throw new AccessDeniedException("Forbidden: Team belongs to a different organization.");
        }

        boolean isAdmin = "ADMIN".equalsIgnoreCase(inviter.getRole());
        boolean isManager = team.getManager() != null && team.getManager().getId().equals(inviter.getId());
        if (!isAdmin && !isManager) {
            throw new AccessDeniedException("Forbidden: Only Organization Admins or Team Managers can send invitations.");
        }

        String recipientEmail = request.getEmail().trim().toLowerCase();

        Optional<User> existingUser = userRepository.findByEmail(recipientEmail);
        if (existingUser.isPresent() && existingUser.get().getTeam() != null &&
                existingUser.get().getTeam().getId().equals(team.getId())) {
            throw new DuplicateResourceException("User (" + recipientEmail + ") is already a member of " + team.getName());
        }

        Optional<TeamInvitation> existingInvite = teamInvitationRepository.findByEmailAndTeamIdAndStatus(recipientEmail, teamId, "PENDING");
        if (existingInvite.isPresent() && !existingInvite.get().isExpired()) {
            throw new DuplicateResourceException("A pending invitation has already been sent to " + recipientEmail);
        }

        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        String role = (request.getRole() != null && "MANAGER".equalsIgnoreCase(request.getRole())) ? "MANAGER" : "MEMBER";
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(EXPIRY_DAYS);

        TeamInvitation invitation = new TeamInvitation(
                token,
                recipientEmail,
                team,
                org,
                inviter,
                role,
                request.getMessage(),
                expiresAt
        );

        TeamInvitation saved = teamInvitationRepository.save(invitation);
        log.info("Team invitation created [ID: {}] for {} to join team {}", saved.getId(), recipientEmail, team.getName());

        notificationService.sendTeamInvitationNotification(
                recipientEmail,
                inviter.getName(),
                team.getName(),
                org.getName(),
                role,
                token,
                request.getMessage(),
                saved.getId()
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TeamInvitationResponse> getInvitationsByTeam(Long teamId) {
        return getInvitationsForTeam(teamId, null);
    }

    @Transactional(readOnly = true)
    public List<TeamInvitationResponse> getInvitationsForTeam(Long teamId, User caller) {
        User user = resolveCaller(caller);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));

        if (user.getOrganization() == null || team.getOrganization() == null ||
                !team.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new AccessDeniedException("Forbidden: Team belongs to a different organization.");
        }

        List<TeamInvitation> invitations = teamInvitationRepository.findByTeamIdOrderByCreatedAtDesc(teamId);
        return invitations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ValidateTokenResponse validateInvitationToken(String token) {
        if (token == null || token.isBlank()) {
            return ValidateTokenResponse.invalid("Token is required");
        }

        Optional<TeamInvitation> inviteOpt = teamInvitationRepository.findByToken(token.trim());
        if (inviteOpt.isEmpty()) {
            return ValidateTokenResponse.invalid("Invalid invitation token");
        }

        TeamInvitation invitation = inviteOpt.get();
        if (!"PENDING".equalsIgnoreCase(invitation.getStatus())) {
            return ValidateTokenResponse.invalid("This invitation is " + invitation.getStatus().toLowerCase());
        }

        if (invitation.isExpired()) {
            return ValidateTokenResponse.invalid("This invitation has expired");
        }

        return ValidateTokenResponse.validInvitation(
                invitation.getEmail(),
                invitation.getTeam() != null ? invitation.getTeam().getName() : "Team",
                invitation.getOrganization() != null ? invitation.getOrganization().getName() : "Organization",
                invitation.getRole()
        );
    }

    @Transactional(readOnly = true)
    public TeamInvitationResponse validateInvitation(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Invitation token is required");
        }

        TeamInvitation invitation = teamInvitationRepository.findByToken(token.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found for token"));

        if (!invitation.isPending()) {
            throw new IllegalArgumentException("This invitation has expired or has already been processed");
        }

        return mapToResponse(invitation);
    }

    public TeamInvitationResponse acceptInvitation(String token, User caller) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Invitation token is required");
        }

        TeamInvitation invitation = teamInvitationRepository.findByToken(token.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.isPending()) {
            throw new IllegalArgumentException("This invitation is no longer valid or has already been accepted");
        }

        String recipientEmail = invitation.getEmail();
        Optional<User> userOpt = caller != null ? Optional.of(caller) : userRepository.findByEmail(recipientEmail);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setOrganization(invitation.getOrganization());
            user.setTeam(invitation.getTeam());

            if ("MANAGER".equalsIgnoreCase(invitation.getRole()) && "USER".equalsIgnoreCase(user.getRole())) {
                user.setRole("MANAGER");
            }

            userRepository.save(user);
            log.info("User {} successfully assigned to team {} via invitation", user.getEmail(), invitation.getTeam().getName());
        }

        invitation.setStatus("ACCEPTED");
        invitation.setAcceptedAt(LocalDateTime.now());
        TeamInvitation saved = teamInvitationRepository.save(invitation);

        return mapToResponse(saved);
    }

    public void acceptInvitation(String token) {
        acceptInvitation(token, null);
    }

    public void cancelInvitation(Long invitationId) {
        cancelInvitation(invitationId, null);
    }

    public void cancelInvitation(Long invitationId, User caller) {
        User user = resolveCaller(caller);
        TeamInvitation invitation = teamInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found with ID: " + invitationId));

        if (user.getOrganization() == null || invitation.getOrganization() == null ||
                !invitation.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new AccessDeniedException("Forbidden: Invitation belongs to a different organization.");
        }

        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());
        boolean isManager = invitation.getTeam().getManager() != null &&
                invitation.getTeam().getManager().getId().equals(user.getId());

        if (!isAdmin && !isManager) {
            throw new AccessDeniedException("Forbidden: Only Admins or Team Managers can cancel invitations.");
        }

        invitation.setStatus("CANCELLED");
        teamInvitationRepository.save(invitation);
        log.info("Invitation ID {} cancelled by user {}", invitationId, user.getEmail());
    }

    private TeamInvitationResponse mapToResponse(TeamInvitation ti) {
        return new TeamInvitationResponse(
                ti.getId(),
                ti.getToken(),
                ti.getEmail(),
                ti.getTeam() != null ? ti.getTeam().getId() : null,
                ti.getTeam() != null ? ti.getTeam().getName() : null,
                ti.getOrganization() != null ? ti.getOrganization().getId() : null,
                ti.getOrganization() != null ? ti.getOrganization().getName() : null,
                ti.getInviter() != null ? ti.getInviter().getId() : null,
                ti.getInviter() != null ? ti.getInviter().getName() : null,
                ti.getInviter() != null ? ti.getInviter().getEmail() : null,
                ti.getRole(),
                ti.getStatus(),
                ti.getMessage(),
                ti.getExpiresAt(),
                ti.getCreatedAt(),
                ti.getAcceptedAt()
        );
    }
}
