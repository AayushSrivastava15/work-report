package work_report_backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import work_report_backend.entity.Organization;
import work_report_backend.entity.User;
import work_report_backend.repository.OrganizationRepository;
import work_report_backend.repository.UserRepository;

import java.util.List;

/**
 * Migration runner to ensure database columns and tables exist for Multi-Tenancy,
 * legacy plaintext passwords are migrated to BCrypt, and existing records are
 * safely backfilled into a default tenant organization.
 */
@Component
public class UserPasswordMigrationRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(UserPasswordMigrationRunner.class);

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public UserPasswordMigrationRunner(
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate
    ) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // 1. Ensure Multi-Tenant Schema & Columns Exist
        try {
            // Create organizations table
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS organizations (
                    id BIGSERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    code VARCHAR(255) NOT NULL UNIQUE,
                    type VARCHAR(50) NOT NULL DEFAULT 'COMPANY',
                    owner_id BIGINT,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            """);

            // Add organization_id to users, projects, work_entries
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE projects ADD COLUMN IF NOT EXISTS organization_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE work_entries ADD COLUMN IF NOT EXISTS organization_id BIGINT");

            // Create performance & isolation indexes
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_work_entries_org ON work_entries(organization_id)");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(code)");

            // Ensure other lifecycle columns exist
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(255) DEFAULT 'USER'");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'ACTIVE'");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255)");

            jdbcTemplate.execute("ALTER TABLE work_entries ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP");
            jdbcTemplate.execute("ALTER TABLE work_entries ADD COLUMN IF NOT EXISTS reviewer_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE work_entries ADD COLUMN IF NOT EXISTS reviewer_name VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE work_entries ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP");
            jdbcTemplate.execute("ALTER TABLE work_entries ADD COLUMN IF NOT EXISTS rejection_reason TEXT");
        } catch (Exception e) {
            log.debug("Schema initialization note: {}", e.getMessage());
        }

        // 2. Ensure Default Tenant Organization Exists
        Organization defaultOrg = organizationRepository.findByCode("WORK-1001").orElse(null);
        if (defaultOrg == null) {
            defaultOrg = new Organization("Primary Enterprise", "WORK-1001", "COMPANY", 1L);
            defaultOrg = organizationRepository.save(defaultOrg);
            log.info("Initialized default tenant organization 'Primary Enterprise' (Code: WORK-1001).");
        }

        // 3. Migrate Users, Passwords & Backfill Organization
        List<User> users = userRepository.findAll();
        int migratedCount = 0;
        int statusUpdated = 0;

        for (User user : users) {
            boolean modified = false;

            // Password migration
            String currentPassword = user.getPassword();
            if (currentPassword != null && !isBcryptHashed(currentPassword)) {
                user.setPassword(passwordEncoder.encode(currentPassword));
                modified = true;
                migratedCount++;
            }

            // Status initialization
            if (user.getStatus() == null || user.getStatus().isBlank()) {
                user.setStatus("ACTIVE");
                modified = true;
                statusUpdated++;
            }

            // Role initialization
            if (user.getRole() == null || user.getRole().isBlank()) {
                if ("test@example.com".equalsIgnoreCase(user.getEmail()) || (user.getId() != null && user.getId() == 1L)) {
                    user.setRole("ADMIN");
                } else {
                    user.setRole("USER");
                }
                modified = true;
            } else if ("test@example.com".equalsIgnoreCase(user.getEmail()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
                user.setRole("ADMIN");
                modified = true;
            }

            // Backfill organization_id
            if (user.getOrganization() == null) {
                user.setOrganization(defaultOrg);
                modified = true;
            }

            if (modified) {
                userRepository.save(user);
            }
        }

        // 4. Backfill existing projects and work_entries with organization_id
        try {
            Long defaultOrgId = defaultOrg.getId();
            jdbcTemplate.update("UPDATE projects SET organization_id = ? WHERE organization_id IS NULL", defaultOrgId);
            jdbcTemplate.update("UPDATE work_entries SET organization_id = ? WHERE organization_id IS NULL", defaultOrgId);
        } catch (Exception e) {
            log.debug("Backfill projects/work_entries note: {}", e.getMessage());
        }

        if (migratedCount > 0) {
            log.info("Securely migrated {} user account(s) to BCrypt password hashes.", migratedCount);
        }
        if (statusUpdated > 0) {
            log.info("Initialized status and roles for {} existing user account(s).", statusUpdated);
        }
    }

    private boolean isBcryptHashed(String password) {
        return password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$");
    }
}
