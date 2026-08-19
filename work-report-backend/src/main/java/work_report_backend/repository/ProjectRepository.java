package work_report_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import work_report_backend.entity.Project;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByUserId(Long userId);

    long countByUserId(Long userId);
}