package work_report_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import work_report_backend.entity.TeamInvitation;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {

    Optional<TeamInvitation> findByToken(String token);

    List<TeamInvitation> findByTeamIdOrderByCreatedAtDesc(Long teamId);

    List<TeamInvitation> findByTeamIdAndStatusOrderByCreatedAtDesc(Long teamId, String status);

    List<TeamInvitation> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

    Optional<TeamInvitation> findByEmailAndTeamIdAndStatus(String email, Long teamId, String status);

    @Query("SELECT ti FROM TeamInvitation ti WHERE LOWER(ti.email) = LOWER(:email) AND ti.status = 'PENDING'")
    List<TeamInvitation> findPendingByEmail(String email);
}
