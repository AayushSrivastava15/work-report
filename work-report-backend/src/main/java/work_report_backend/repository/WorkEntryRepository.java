package work_report_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import work_report_backend.dto.DashboardCategoryResponse;
import work_report_backend.dto.DashboardProjectResponse;
import work_report_backend.dto.DashboardStatusResponse;
import work_report_backend.dto.DashboardTechnologyResponse;
import work_report_backend.entity.WorkEntry;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkEntryRepository extends JpaRepository<WorkEntry, Long> {

    // ── Phase 3 — existing methods (DO NOT REMOVE) ────────────────────────────

    List<WorkEntry> findByUserId(Long userId);

    List<WorkEntry> findByProjectId(Long projectId);

    List<WorkEntry> findByUserIdOrderByDateDesc(Long userId);

    // Multi-Tenant Scoped Queries
    Page<WorkEntry> findByOrganizationId(Long organizationId, Pageable pageable);

    Optional<WorkEntry> findByIdAndOrganizationId(Long id, Long organizationId);

    List<WorkEntry> findByOrganizationId(Long organizationId);

    // Team Scoped Queries
    @Query("""
        SELECT w FROM WorkEntry w
        WHERE w.user.team.id = :teamId
          AND w.organization.id = :organizationId
        ORDER BY w.date DESC, w.id DESC
    """)
    Page<WorkEntry> findByTeamIdAndOrg(
            @Param("teamId") Long teamId,
            @Param("organizationId") Long organizationId,
            Pageable pageable
    );

    @Query("""
        SELECT w FROM WorkEntry w
        WHERE w.user.team.id = :teamId
          AND w.organization.id = :organizationId
          AND w.status = :status
        ORDER BY w.date DESC, w.id DESC
    """)
    Page<WorkEntry> findByTeamIdAndOrgAndStatus(
            @Param("teamId") Long teamId,
            @Param("organizationId") Long organizationId,
            @Param("status") String status,
            Pageable pageable
    );

    // ── Phase 4 — Filtering & Search (List versions) ─────────────────────────

    // 1. Filter by date range (inclusive)
    List<WorkEntry> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);

    // 2. Filter by user + date range
    List<WorkEntry> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    // 3. Filter by project + date range
    List<WorkEntry> findByProjectIdAndDateBetweenOrderByDateDesc(Long projectId, LocalDate startDate, LocalDate endDate);

    // 4. Filter by user + project + date range
    List<WorkEntry> findByUserIdAndProjectIdAndDateBetweenOrderByDateDesc(
            Long userId, Long projectId, LocalDate startDate, LocalDate endDate);

    // 5. Filter by category (case-insensitive)
    @Query("SELECT w FROM WorkEntry w WHERE LOWER(w.category) = LOWER(:category) ORDER BY w.date DESC")
    List<WorkEntry> findByCategoryIgnoreCaseOrderByDateDesc(@Param("category") String category);

    // 6. Filter by technology (case-insensitive)
    @Query("SELECT w FROM WorkEntry w WHERE LOWER(w.technology) = LOWER(:technology) ORDER BY w.date DESC")
    List<WorkEntry> findByTechnologyIgnoreCaseOrderByDateDesc(@Param("technology") String technology);

    // 7. Filter by status (case-insensitive)
    @Query("SELECT w FROM WorkEntry w WHERE LOWER(w.status) = LOWER(:status) ORDER BY w.date DESC")
    List<WorkEntry> findByStatusIgnoreCaseOrderByDateDesc(@Param("status") String status);

    // 8. Keyword search across title, description, category, technology (case-insensitive)
    @Query("""
            SELECT w FROM WorkEntry w
            WHERE LOWER(w.title)       LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(w.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(w.category)    LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(w.technology)  LIKE LOWER(CONCAT('%', :keyword, '%'))
            ORDER BY w.date DESC
            """)
    List<WorkEntry> searchByKeyword(@Param("keyword") String keyword);

    // ── Phase 10 — Pagination (Pageable versions) ─────────────────────────────

    Page<WorkEntry> findByUserId(Long userId, Pageable pageable);

    Page<WorkEntry> findByProjectId(Long projectId, Pageable pageable);

    Page<WorkEntry> findByDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<WorkEntry> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<WorkEntry> findByProjectIdAndDateBetween(Long projectId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<WorkEntry> findByUserIdAndProjectIdAndDateBetween(
            Long userId, Long projectId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    @Query("SELECT w FROM WorkEntry w WHERE LOWER(w.category) = LOWER(:category)")
    Page<WorkEntry> findByCategoryIgnoreCase(@Param("category") String category, Pageable pageable);

    @Query("SELECT w FROM WorkEntry w WHERE LOWER(w.technology) = LOWER(:technology)")
    Page<WorkEntry> findByTechnologyIgnoreCase(@Param("technology") String technology, Pageable pageable);

    @Query("SELECT w FROM WorkEntry w WHERE LOWER(w.status) = LOWER(:status)")
    Page<WorkEntry> findByStatusIgnoreCase(@Param("status") String status, Pageable pageable);

    @Query("""
            SELECT w FROM WorkEntry w
            WHERE LOWER(w.title)       LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(w.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(w.category)    LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(w.technology)  LIKE LOWER(CONCAT('%', :keyword, '%'))
            """)
    Page<WorkEntry> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // ── Phase 5 — Dashboard Aggregation ───────────────────────────────────────

    long countByUserId(Long userId);

    @Query("""
            SELECT new work_report_backend.dto.DashboardProjectResponse(w.project.id, w.project.name, COUNT(w))
            FROM WorkEntry w
            WHERE w.user.id = :userId
            GROUP BY w.project.id, w.project.name
            ORDER BY COUNT(w) DESC
            """)
    List<DashboardProjectResponse> countWorkEntriesByProjectForUser(@Param("userId") Long userId);

    @Query("""
            SELECT new work_report_backend.dto.DashboardCategoryResponse(w.category, COUNT(w))
            FROM WorkEntry w
            WHERE w.user.id = :userId
            GROUP BY w.category
            ORDER BY COUNT(w) DESC
            """)
    List<DashboardCategoryResponse> countWorkEntriesByCategoryForUser(@Param("userId") Long userId);

    @Query("""
            SELECT new work_report_backend.dto.DashboardTechnologyResponse(w.technology, COUNT(w))
            FROM WorkEntry w
            WHERE w.user.id = :userId
            GROUP BY w.technology
            ORDER BY COUNT(w) DESC
            """)
    List<DashboardTechnologyResponse> countWorkEntriesByTechnologyForUser(@Param("userId") Long userId);

    @Query("""
            SELECT new work_report_backend.dto.DashboardStatusResponse(w.status, COUNT(w))
            FROM WorkEntry w
            WHERE w.user.id = :userId
            GROUP BY w.status
            ORDER BY COUNT(w) DESC
            """)
    List<DashboardStatusResponse> countWorkEntriesByStatusForUser(@Param("userId") Long userId);

    // ── Phase 8 — Report Multi-Criteria Filtering ─────────────────────────────

    @Query("""
            SELECT w FROM WorkEntry w
            WHERE w.user.id = :userId
              AND (CAST(:startDate AS LocalDate) IS NULL OR w.date >= :startDate)
              AND (CAST(:endDate AS LocalDate) IS NULL OR w.date <= :endDate)
              AND (:projectId IS NULL OR w.project.id = :projectId)
              AND (CAST(:category AS string) IS NULL OR LOWER(w.category) = LOWER(CAST(:category AS string)))
              AND (CAST(:technology AS string) IS NULL OR LOWER(w.technology) = LOWER(CAST(:technology AS string)))
              AND (CAST(:status AS string) IS NULL OR LOWER(w.status) = LOWER(CAST(:status AS string)))
              AND (CAST(:keyword AS string) IS NULL OR (
                    LOWER(w.title)       LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                 OR LOWER(w.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                 OR LOWER(w.category)    LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                 OR LOWER(w.technology)  LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
              ))
            ORDER BY w.date DESC, w.id DESC
            """)
    List<WorkEntry> filterReportEntries(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("projectId") Long projectId,
            @Param("category") String category,
            @Param("technology") String technology,
            @Param("status") String status,
            @Param("keyword") String keyword
    );
}