package work_report_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import work_report_backend.entity.Team;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findByOrganizationId(Long organizationId);

    Optional<Team> findByIdAndOrganizationId(Long id, Long organizationId);

    boolean existsByNameAndOrganizationId(String name, Long organizationId);

    List<Team> findByOrganizationIdAndManagerId(Long organizationId, Long managerId);

    List<Team> findByManagerId(Long managerId);
}
