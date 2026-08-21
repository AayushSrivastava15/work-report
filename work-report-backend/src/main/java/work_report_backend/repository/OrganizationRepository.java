package work_report_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import work_report_backend.entity.Organization;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    Optional<Organization> findByCode(String code);

    boolean existsByCode(String code);

    Optional<Organization> findByName(String name);
}
