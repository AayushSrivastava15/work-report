package work_report_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import work_report_backend.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}