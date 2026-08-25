package work_report_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import work_report_backend.dto.TeamInvitationRequest;
import work_report_backend.dto.TeamInvitationResponse;
import work_report_backend.dto.ValidateTokenResponse;
import work_report_backend.entity.Organization;
import work_report_backend.entity.Team;
import work_report_backend.entity.TeamInvitation;
import work_report_backend.entity.User;
import work_report_backend.repository.TeamInvitationRepository;
import work_report_backend.repository.TeamRepository;
import work_report_backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamInvitationServiceTest {

    @Mock
    private TeamInvitationRepository teamInvitationRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    private TeamInvitationService teamInvitationService;

    private Organization testOrg;
    private Team testTeam;
    private User testAdmin;
    private User testMember;

    @BeforeEach
    void setUp() {
        teamInvitationService = new TeamInvitationService(
                teamInvitationRepository,
                teamRepository,
                userRepository,
                notificationService
        );

        testOrg = new Organization("Acme Corp", "ACME", "COMPANY", 1L);
        testOrg.setId(10L);

        testAdmin = new User();
        testAdmin.setId(1L);
        testAdmin.setName("Alice Admin");
        testAdmin.setEmail("admin@acme.com");
        testAdmin.setRole("ADMIN");
        testAdmin.setOrganization(testOrg);

        testTeam = new Team("Frontend Engineering", "UI Team", testOrg, testAdmin);
        testTeam.setId(100L);

        testMember = new User();
        testMember.setId(2L);
        testMember.setName("Bob Member");
        testMember.setEmail("bob@acme.com");
        testMember.setRole("USER");
        testMember.setOrganization(testOrg);
    }

    @Test
    @DisplayName("Admin can invite a new user by email and send notification")
    void testInviteMember_Success() {
        when(teamRepository.findById(100L)).thenReturn(Optional.of(testTeam));
        when(userRepository.findByEmail("newdeveloper@acme.com")).thenReturn(Optional.empty());
        when(teamInvitationRepository.findByEmailAndTeamIdAndStatus("newdeveloper@acme.com", 100L, "PENDING"))
                .thenReturn(Optional.empty());
        when(teamInvitationRepository.save(any(TeamInvitation.class))).thenAnswer(invocation -> {
            TeamInvitation saved = invocation.getArgument(0);
            saved.setId(500L);
            return saved;
        });

        TeamInvitationRequest request = new TeamInvitationRequest("newdeveloper@acme.com", "MEMBER", "Welcome!");
        TeamInvitationResponse response = teamInvitationService.inviteMember(100L, request, testAdmin);

        assertNotNull(response);
        assertEquals("newdeveloper@acme.com", response.getEmail());
        assertEquals("Frontend Engineering", response.getTeamName());
        verify(notificationService).sendTeamInvitationNotification(
                eq("newdeveloper@acme.com"),
                eq("Alice Admin"),
                eq("Frontend Engineering"),
                eq("Acme Corp"),
                eq("MEMBER"),
                anyString(),
                eq("Welcome!"),
                eq(500L)
        );
    }

    @Test
    @DisplayName("Validate invitation token returns valid info for pending invite")
    void testValidateInvitationToken_Valid() {
        TeamInvitation invite = new TeamInvitation(
                "token-abc",
                "bob@acme.com",
                testTeam,
                testOrg,
                testAdmin,
                "MEMBER",
                "Hello",
                LocalDateTime.now().plusDays(5)
        );

        when(teamInvitationRepository.findByToken("token-abc")).thenReturn(Optional.of(invite));

        ValidateTokenResponse response = teamInvitationService.validateInvitationToken("token-abc");

        assertTrue(response.isValid());
        assertEquals("bob@acme.com", response.getEmail());
        assertEquals("Frontend Engineering", response.getTeamName());
    }

    @Test
    @DisplayName("Accept invitation assigns member to team and marks invitation accepted")
    void testAcceptInvitation_Success() {
        TeamInvitation invite = new TeamInvitation(
                "token-abc",
                "bob@acme.com",
                testTeam,
                testOrg,
                testAdmin,
                "MEMBER",
                "Hello",
                LocalDateTime.now().plusDays(5)
        );

        when(teamInvitationRepository.findByToken("token-abc")).thenReturn(Optional.of(invite));
        when(teamInvitationRepository.save(any(TeamInvitation.class))).thenReturn(invite);

        teamInvitationService.acceptInvitation("token-abc", testMember);

        assertEquals(testTeam, testMember.getTeam());
        assertEquals("ACCEPTED", invite.getStatus());
        verify(userRepository).save(testMember);
        verify(teamInvitationRepository).save(invite);
    }
}
