package work_report_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work_report_backend.dto.TeamRequest;
import work_report_backend.dto.TeamResponse;
import work_report_backend.dto.UserResponse;
import work_report_backend.service.TeamService;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
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
}
