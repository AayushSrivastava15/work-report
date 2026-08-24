package work_report_backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import work_report_backend.dto.OrganizationDetailsResponse;
import work_report_backend.dto.OrganizationUpdateRequest;
import work_report_backend.entity.User;
import work_report_backend.repository.UserRepository;
import work_report_backend.service.OrganizationService;
import work_report_backend.util.SecurityUtils;

@RestController
@RequestMapping("/api/admin/organization")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final UserRepository userRepository;

    public OrganizationController(OrganizationService organizationService, UserRepository userRepository) {
        this.organizationService = organizationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<OrganizationDetailsResponse> getOrganizationDetails() {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        return ResponseEntity.ok(organizationService.getOrganizationDetails(caller));
    }

    @PutMapping
    public ResponseEntity<OrganizationDetailsResponse> updateOrganization(
            @Valid @RequestBody OrganizationUpdateRequest request
    ) {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        SecurityUtils.requireAdminRole(userRepository);
        return ResponseEntity.ok(organizationService.updateOrganization(caller, request));
    }

    @PostMapping("/rotate-code")
    public ResponseEntity<OrganizationDetailsResponse> rotateOrganizationCode() {
        User caller = SecurityUtils.getAuthenticatedUser(userRepository);
        SecurityUtils.requireAdminRole(userRepository);
        return ResponseEntity.ok(organizationService.rotateOrganizationCode(caller));
    }
}
