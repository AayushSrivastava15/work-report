package work_report_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work_report_backend.dto.TeamRequest;
import work_report_backend.dto.TeamResponse;
import work_report_backend.dto.UserResponse;
import work_report_backend.dto.TeamInvitationRequest;
import work_report_backend.dto.TeamInvitationResponse;
import work_report_backend.dto.ValidateTokenResponse;
import work_report_backend.entity.User;
import work_report_backend.repository.UserRepository;
import work_report_backend.service.TeamInvitationService;
import work_report_backend.service.TeamService;
import work_report_backend.util.SecurityUtils;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;
    private final TeamInvitationService teamInvitationService;
    private final UserRepository userRepository;

    public TeamController(
            TeamService teamService,
            TeamInvitationService teamInvitationService,
            UserRepository userRepository
    ) {
        this.teamService = teamService;
        this.teamInvitationService = teamInvitationService;
        this.userRepository = userRepository;
    }

    // 1. Get All Teams in Caller's Organization
    @GetMapping
    public ResponseEntity<List<TeamResponse>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    // 2. Get Team by ID
    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getTeamById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    // 3. Create Team (Admin Only)
    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@Valid @RequestBody TeamRequest request) {
        TeamResponse created = teamService.createTeam(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 4. Update Team (Admin Only)
    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable Long id,
            @Valid @RequestBody TeamRequest request
    ) {
        return ResponseEntity.ok(teamService.updateTeam(id, request));
    }

    // 5. Delete Team (Admin Only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Assign Member to Team (Admin or Team Manager)
    @PostMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> addMemberToTeam(
            @PathVariable Long id,
            @PathVariable Long userId
    ) {
        teamService.addMemberToTeam(id, userId);
        return ResponseEntity.ok().build();
    }

    // 7. Remove Member from Team (Admin or Team Manager)
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMemberFromTeam(
            @PathVariable Long id,
            @PathVariable Long userId
    ) {
        teamService.removeMemberFromTeam(id, userId);
        return ResponseEntity.noContent().build();
    }

    // 8. Assign Manager to Team (Admin Only)
    @PutMapping("/{id}/manager/{managerUserId}")
    public ResponseEntity<Void> assignTeamManager(
            @PathVariable Long id,
            @PathVariable Long managerUserId
    ) {
        teamService.assignTeamManager(id, managerUserId);
        return ResponseEntity.ok().build();
    }

    // 9. Get Team Members
    @GetMapping("/{id}/members")
    public ResponseEntity<List<UserResponse>> getTeamMembers(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamMembers(id));
    }

    // 10. Invite Member by Email (Transactional Email via Resend)
    @PostMapping("/{id}/invitations")
    public ResponseEntity<TeamInvitationResponse> inviteMember(
            @PathVariable Long id,
            @Valid @RequestBody TeamInvitationRequest request
    ) {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        TeamInvitationResponse invitation = teamInvitationService.inviteMember(id, request, caller);
        return ResponseEntity.status(HttpStatus.CREATED).body(invitation);
    }

    // 11. Get Team Invitations
    @GetMapping("/{id}/invitations")
    public ResponseEntity<List<TeamInvitationResponse>> getTeamInvitations(@PathVariable Long id) {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        return ResponseEntity.ok(teamInvitationService.getInvitationsForTeam(id, caller));
    }

    // 12. Cancel Invitation
    @DeleteMapping("/invitations/{invitationId}")
    public ResponseEntity<Void> cancelInvitation(@PathVariable Long invitationId) {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        teamInvitationService.cancelInvitation(invitationId, caller);
        return ResponseEntity.noContent().build();
    }

    // 13. Validate Invitation Token (Public)
    @GetMapping("/invitations/validate")
    public ResponseEntity<ValidateTokenResponse> validateInvitation(@RequestParam("token") String token) {
        return ResponseEntity.ok(teamInvitationService.validateInvitationToken(token));
    }

    // 14. Accept Invitation (Assigns Member to Team)
    @PostMapping("/invitations/accept")
    public ResponseEntity<TeamInvitationResponse> acceptInvitation(@RequestParam("token") String token) {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        TeamInvitationResponse response = teamInvitationService.acceptInvitation(token, caller);
        return ResponseEntity.ok(response);
    }
}
