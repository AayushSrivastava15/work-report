package work_report_backend.service;

import org.springframework.stereotype.Service;
import work_report_backend.dto.ProjectRequest;
import work_report_backend.dto.ProjectResponse;
import work_report_backend.entity.Project;
import work_report_backend.entity.User;
import work_report_backend.exception.ResourceNotFoundException;
import work_report_backend.repository.ProjectRepository;
import work_report_backend.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository
    ) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    // Create Project
    public ProjectResponse createProject(Long userId, ProjectRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Project project = new Project(
                request.getName(),
                request.getDescription(),
                user
        );

        Project saved = projectRepository.save(project);
        return convertToResponse(saved);
    }

    // Get All Projects
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get Project by ID
    public ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return convertToResponse(project);
    }

    // Update Project
    public ProjectResponse updateProject(Long id, ProjectRequest request) {

        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        existingProject.setName(request.getName());
        existingProject.setDescription(request.getDescription());

        Project saved = projectRepository.save(existingProject);
        return convertToResponse(saved);
    }

    // Delete Project
    public void deleteProject(Long id) {

        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found with id: " + id);
        }

        projectRepository.deleteById(id);
    }

    // Get Projects by User
    public List<ProjectResponse> getProjectsByUser(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        return projectRepository.findByUserId(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Convert Entity -> Response DTO
    public ProjectResponse convertToResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getUser() != null ? project.getUser().getId() : null,
                project.getCreatedAt()
        );
    }
}