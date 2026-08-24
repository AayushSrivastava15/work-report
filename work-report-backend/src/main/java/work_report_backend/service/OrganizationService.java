package work_report_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import work_report_backend.dto.OrganizationDetailsResponse;
import work_report_backend.dto.OrganizationUpdateRequest;
import work_report_backend.entity.Organization;
import work_report_backend.entity.User;
import work_report_backend.exception.ResourceNotFoundException;
import work_report_backend.repository.OrganizationRepository;
import work_report_backend.repository.ProjectRepository;
import work_report_backend.repository.TeamRepository;
import work_report_backend.repository.UserRepository;
import work_report_backend.repository.WorkEntryRepository;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;
    private final WorkEntryRepository workEntryRepository;
    private final UserService userService;
    private final SecurityAuditService securityAuditService;

    public OrganizationService(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            TeamRepository teamRepository,
            ProjectRepository projectRepository,
            WorkEntryRepository workEntryRepository,
            UserService userService,
            SecurityAuditService securityAuditService
    ) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.projectRepository = projectRepository;
        this.workEntryRepository = workEntryRepository;
        this.userService = userService;
        this.securityAuditService = securityAuditService;
    }

    public OrganizationDetailsResponse getOrganizationDetails(User caller) {
        if (caller == null || caller.getOrganization() == null) {
            throw new ResourceNotFoundException("No organization associated with current user");
        }

        Organization org = caller.getOrganization();
        long totalMembers = userRepository.countByOrganizationId(org.getId());
        long totalTeams = teamRepository.countByOrganizationId(org.getId());
        long totalProjects = projectRepository.countByOrganizationId(org.getId());
        long totalReports = workEntryRepository.countByOrganizationId(org.getId());

        User owner = org.getOwnerId() != null
                ? userRepository.findById(org.getOwnerId()).orElse(null)
                : null;

        String ownerName = owner != null ? owner.getName() : caller.getName();
        String ownerEmail = owner != null ? owner.getEmail() : caller.getEmail();
        String plan = "INDIVIDUAL".equalsIgnoreCase(org.getType()) ? "Solo Freelancer (Free Tier)" : "Enterprise Workspaces (Pro Tier)";

        return new OrganizationDetailsResponse(
                org.getId(),
                org.getName(),
                org.getCode(),
                org.getType(),
                org.getOwnerId(),
                ownerName,
                ownerEmail,
                totalMembers,
                totalTeams,
                totalProjects,
                totalReports,
                plan,
                org.getCreatedAt()
        );
    }

    @Transactional
    public OrganizationDetailsResponse updateOrganization(User caller, OrganizationUpdateRequest request) {
        if (caller == null || caller.getOrganization() == null) {
            throw new ResourceNotFoundException("No organization associated with current user");
        }

        Organization org = organizationRepository.findById(caller.getOrganization().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            org.setName(request.getName().trim());
        }

        organizationRepository.save(org);
        securityAuditService.logConfigChange("ORGANIZATION_NAME", org.getName(), caller.getEmail());

        return getOrganizationDetails(caller);
    }

    @Transactional
    public OrganizationDetailsResponse rotateOrganizationCode(User caller) {
        if (caller == null || caller.getOrganization() == null) {
            throw new ResourceNotFoundException("No organization associated with current user");
        }

        Organization org = organizationRepository.findById(caller.getOrganization().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        String oldCode = org.getCode();
        String newCode = userService.generateUniqueOrgCode(org.getName());
        org.setCode(newCode);

        organizationRepository.save(org);
        securityAuditService.logConfigChange("ORGANIZATION_CODE_ROTATION", "From " + oldCode + " to " + newCode, caller.getEmail());

        return getOrganizationDetails(caller);
    }
}
