package work_report_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import work_report_backend.entity.Project;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByUserId(Long userId);

    Page<Project> findByUserId(Long userId, Pageable pageable);

    long countByUserId(Long userId);

    // Multi-tenant scoped queries
    Page<Project> findByOrganizationId(Long organizationId, Pageable pageable);

    long countByOrganizationId(Long organizationId);

    Page<Project> findByUserIdAndOrganizationId(Long userId, Long organizationId, Pageable pageable);

    List<Project> findByUserIdAndOrganizationId(Long userId, Long organizationId);

    Optional<Project> findByIdAndOrganizationId(Long id, Long organizationId);

    long countByUserIdAndOrganizationId(Long userId, Long organizationId);
}