package work_report_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import work_report_backend.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByStatus(String status);

    Page<User> findByStatus(String status, Pageable pageable);

    // Multi-tenant scoped queries
    long countByOrganizationId(Long organizationId);

    long countByOrganizationIdAndStatus(Long organizationId, String status);

    List<User> findByOrganizationId(Long organizationId);

    Optional<User> findByIdAndOrganizationId(Long id, Long organizationId);

    List<User> findByTeamId(Long teamId);

    List<User> findByOrganizationIdAndTeamId(Long organizationId, Long teamId);

    long countByTeamId(Long teamId);

    @Query("""
        SELECT u FROM User u
        WHERE u.organization.id = :organizationId
          AND (:keyword IS NULL OR :keyword = ''
               OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.employeeId) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.department) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:status IS NULL OR :status = '' OR u.status = :status)
          AND (:role IS NULL OR :role = '' OR u.role = :role)
          AND (:department IS NULL OR :department = '' OR LOWER(u.department) = LOWER(:department))
          AND (:teamId IS NULL OR (u.team IS NOT NULL AND u.team.id = :teamId))
    """)
    Page<User> searchUsersByOrg(
            @Param("organizationId") Long organizationId,
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("role") String role,
            @Param("department") String department,
            @Param("teamId") Long teamId,
            Pageable pageable
    );

    @Query("""
        SELECT u FROM User u
        WHERE (:keyword IS NULL OR :keyword = ''
               OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.employeeId) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.department) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:status IS NULL OR :status = '' OR u.status = :status)
          AND (:role IS NULL OR :role = '' OR u.role = :role)
          AND (:department IS NULL OR :department = '' OR LOWER(u.department) = LOWER(:department))
    """)
    Page<User> searchUsers(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("role") String role,
            @Param("department") String department,
            Pageable pageable
    );
}