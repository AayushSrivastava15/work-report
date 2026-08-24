package work_report_backend.service;

import org.springframework.stereotype.Service;
import work_report_backend.dto.*;
import work_report_backend.dto.DashboardAnalyticsResponse.*;
import work_report_backend.entity.User;
import work_report_backend.entity.WorkEntry;
import work_report_backend.exception.ResourceNotFoundException;
import work_report_backend.repository.ProjectRepository;
import work_report_backend.repository.UserRepository;
import work_report_backend.repository.WorkEntryRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final WorkEntryRepository workEntryRepository;

    public DashboardService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            WorkEntryRepository workEntryRepository
    ) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.workEntryRepository = workEntryRepository;
    }

    // ── High-Density Analytics Endpoint ───────────────────────────────────────

    public DashboardAnalyticsResponse getAnalyticsData(Long userId, AnalyticsFilterRequest filter) {
        verifyUserExists(userId);

        Long effectiveUserId = filter.getTeamMemberId() != null ? filter.getTeamMemberId() : userId;

        // 1. Fetch matching work entries using existing repository filter query
        List<WorkEntry> entries = workEntryRepository.filterReportEntries(
                effectiveUserId,
                filter.getStartDate(),
                filter.getEndDate(),
                filter.getProjectId(),
                filter.getCategory(),
                filter.getTechnology(),
                filter.getStatus(),
                filter.getKeyword()
        );

        DashboardAnalyticsResponse response = new DashboardAnalyticsResponse();

        long totalEntries = entries.size();

        // 2. Compute KPI Metrics
        KpiMetrics kpis = new KpiMetrics();
        kpis.setTotalWorkEntries(totalEntries);

        Set<Long> projectIds = entries.stream()
                .map(w -> w.getProject() != null ? w.getProject().getId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        kpis.setTotalProjects(projectIds.size());
        kpis.setActiveProjects(projectIds.size());

        long completed = entries.stream().filter(this::isCompleted).count();
        long inProgress = entries.stream().filter(this::isInProgress).count();
        long draft = entries.stream().filter(w -> isStatusMatch(w.getStatus(), "DRAFT")).count();
        long rejected = entries.stream().filter(w -> isStatusMatch(w.getStatus(), "REJECTED")).count();

        kpis.setCompletedWork(completed);
        kpis.setCompletedPercentage(totalEntries > 0 ? Math.round((completed * 1000.0) / totalEntries) / 10.0 : 0.0);
        kpis.setInProgressWork(inProgress);
        kpis.setInProgressPercentage(totalEntries > 0 ? Math.round((inProgress * 1000.0) / totalEntries) / 10.0 : 0.0);
        kpis.setDraftWork(draft);
        kpis.setRejectedWork(rejected);

        Set<String> distinctTechs = entries.stream()
                .map(WorkEntry::getTechnology)
                .filter(t -> t != null && !t.isBlank())
                .flatMap(t -> Arrays.stream(t.split("[,;/]")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
        kpis.setTechnologiesUsed(distinctTechs.size());

        // Previous period growth comparison
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            long days = ChronoUnit.DAYS.between(filter.getStartDate(), filter.getEndDate()) + 1;
            LocalDate prevStart = filter.getStartDate().minusDays(days);
            LocalDate prevEnd = filter.getStartDate().minusDays(1);

            List<WorkEntry> prevEntries = workEntryRepository.filterReportEntries(
                    effectiveUserId,
                    prevStart,
                    prevEnd,
                    filter.getProjectId(),
                    filter.getCategory(),
                    filter.getTechnology(),
                    filter.getStatus(),
                    filter.getKeyword()
            );

            long prevCount = prevEntries.size();
            kpis.setPreviousPeriodEntries(prevCount);
            if (prevCount > 0) {
                double growth = ((double) (totalEntries - prevCount) / prevCount) * 100.0;
                kpis.setGrowthPercentage(Math.round(growth * 10.0) / 10.0);
            } else {
                kpis.setGrowthPercentage(totalEntries > 0 ? 100.0 : 0.0);
            }
        } else {
            kpis.setPreviousPeriodEntries(0);
            kpis.setGrowthPercentage(0.0);
        }

        response.setKpis(kpis);

        // 3. Activity Trends (Day, Week, Month)
        response.setActivityTrends(buildActivityTrends(entries, filter.getAggregation()));

        // 4. Projects Breakdown
        response.setProjects(buildProjectAnalytics(entries, totalEntries));

        // 5. Categories Breakdown
        response.setCategories(buildCategoryAnalytics(entries, totalEntries));

        // 6. Technologies Breakdown
        response.setTechnologies(buildTechnologyAnalytics(entries, totalEntries));

        // 7. Statuses Breakdown
        response.setStatuses(buildStatusAnalytics(entries, totalEntries));

        // 8. Work Distribution (Project x Category)
        response.setWorkDistribution(buildWorkDistribution(entries));

        // 9. Recent Entries (Top 10)
        response.setRecentEntries(
                entries.stream()
                        .sorted(Comparator.comparing(WorkEntry::getDate, Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(WorkEntry::getId, Comparator.reverseOrder()))
                        .limit(10)
                        .map(this::convertToResponse)
                        .collect(Collectors.toList())
        );

        return response;
    }

    private List<ActivityTrendItem> buildActivityTrends(List<WorkEntry> entries, String aggregation) {
        if (entries.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, List<WorkEntry>> grouped = new TreeMap<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("MMM dd");
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        WeekFields weekFields = WeekFields.of(Locale.getDefault());

        for (WorkEntry entry : entries) {
            LocalDate d = entry.getDate() != null ? entry.getDate() : LocalDate.now();
            String key;
            if ("MONTH".equalsIgnoreCase(aggregation)) {
                key = d.withDayOfMonth(1).format(DateTimeFormatter.ISO_DATE);
            } else if ("WEEK".equalsIgnoreCase(aggregation)) {
                LocalDate startOfWeek = d.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                key = startOfWeek.format(DateTimeFormatter.ISO_DATE);
            } else {
                key = d.format(DateTimeFormatter.ISO_DATE);
            }
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(entry);
        }

        List<ActivityTrendItem> result = new ArrayList<>();
        for (Map.Entry<String, List<WorkEntry>> e : grouped.entrySet()) {
            LocalDate date = LocalDate.parse(e.getKey());
            String periodLabel;
            if ("MONTH".equalsIgnoreCase(aggregation)) {
                periodLabel = date.format(monthFormatter);
            } else if ("WEEK".equalsIgnoreCase(aggregation)) {
                periodLabel = "W" + date.get(weekFields.weekOfYear()) + " (" + date.format(dayFormatter) + ")";
            } else {
                periodLabel = date.format(dayFormatter);
            }

            List<WorkEntry> bucket = e.getValue();
            long total = bucket.size();
            long comp = bucket.stream().filter(this::isCompleted).count();
            long inProg = bucket.stream().filter(this::isInProgress).count();
            long dr = bucket.stream().filter(w -> isStatusMatch(w.getStatus(), "DRAFT")).count();

            result.add(new ActivityTrendItem(periodLabel, e.getKey(), total, comp, inProg, dr));
        }

        return result;
    }

    private List<ProjectAnalyticsItem> buildProjectAnalytics(List<WorkEntry> entries, long totalEntries) {
        Map<String, List<WorkEntry>> byProject = entries.stream()
                .collect(Collectors.groupingBy(w -> w.getProject() != null ? w.getProject().getName() : "Unassigned Project"));

        List<ProjectAnalyticsItem> items = new ArrayList<>();
        for (Map.Entry<String, List<WorkEntry>> entry : byProject.entrySet()) {
            List<WorkEntry> pEntries = entry.getValue();
            Long projectId = pEntries.get(0).getProject() != null ? pEntries.get(0).getProject().getId() : null;
            long count = pEntries.size();
            long comp = pEntries.stream().filter(this::isCompleted).count();
            long inProg = pEntries.stream().filter(this::isInProgress).count();
            double pct = totalEntries > 0 ? Math.round((count * 1000.0) / totalEntries) / 10.0 : 0.0;

            items.add(new ProjectAnalyticsItem(projectId, entry.getKey(), count, comp, inProg, pct));
        }

        items.sort((a, b) -> Long.compare(b.getWorkCount(), a.getWorkCount()));
        return items;
    }

    private List<CategoryAnalyticsItem> buildCategoryAnalytics(List<WorkEntry> entries, long totalEntries) {
        Map<String, List<WorkEntry>> byCat = entries.stream()
                .collect(Collectors.groupingBy(w -> w.getCategory() != null && !w.getCategory().isBlank() ? w.getCategory().trim() : "General"));

        List<CategoryAnalyticsItem> items = new ArrayList<>();
        for (Map.Entry<String, List<WorkEntry>> entry : byCat.entrySet()) {
            List<WorkEntry> cEntries = entry.getValue();
            long count = cEntries.size();
            long comp = cEntries.stream().filter(this::isCompleted).count();
            long inProg = cEntries.stream().filter(this::isInProgress).count();
            double pct = totalEntries > 0 ? Math.round((count * 1000.0) / totalEntries) / 10.0 : 0.0;

            items.add(new CategoryAnalyticsItem(entry.getKey(), count, comp, inProg, pct));
        }

        items.sort((a, b) -> Long.compare(b.getWorkCount(), a.getWorkCount()));
        return items;
    }

    private List<TechnologyAnalyticsItem> buildTechnologyAnalytics(List<WorkEntry> entries, long totalEntries) {
        Map<String, List<WorkEntry>> byTech = new HashMap<>();

        for (WorkEntry entry : entries) {
            String rawTech = entry.getTechnology();
            if (rawTech == null || rawTech.isBlank()) {
                byTech.computeIfAbsent("General / Other", k -> new ArrayList<>()).add(entry);
            } else {
                String[] parts = rawTech.split("[,;/]");
                for (String part : parts) {
                    String clean = part.trim();
                    if (!clean.isEmpty()) {
                        byTech.computeIfAbsent(clean, k -> new ArrayList<>()).add(entry);
                    }
                }
            }
        }

        List<TechnologyAnalyticsItem> items = new ArrayList<>();
        for (Map.Entry<String, List<WorkEntry>> entry : byTech.entrySet()) {
            List<WorkEntry> tEntries = entry.getValue();
            long count = tEntries.size();
            List<String> pNames = tEntries.stream()
                    .map(w -> w.getProject() != null ? w.getProject().getName() : null)
                    .filter(Objects::nonNull)
                    .distinct()
                    .limit(5)
                    .collect(Collectors.toList());

            long pCount = tEntries.stream()
                    .map(w -> w.getProject() != null ? w.getProject().getId() : null)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();

            double pct = totalEntries > 0 ? Math.round((count * 1000.0) / totalEntries) / 10.0 : 0.0;
            items.add(new TechnologyAnalyticsItem(entry.getKey(), count, pCount, pNames, pct));
        }

        items.sort((a, b) -> Long.compare(b.getWorkCount(), a.getWorkCount()));
        return items;
    }

    private List<StatusAnalyticsItem> buildStatusAnalytics(List<WorkEntry> entries, long totalEntries) {
        long completed = entries.stream().filter(this::isCompleted).count();
        long inProgress = entries.stream().filter(this::isInProgress).count();
        long draft = entries.stream().filter(w -> isStatusMatch(w.getStatus(), "DRAFT")).count();
        long rejected = entries.stream().filter(w -> isStatusMatch(w.getStatus(), "REJECTED")).count();

        List<StatusAnalyticsItem> items = new ArrayList<>();
        if (completed > 0) {
            double pct = totalEntries > 0 ? Math.round((completed * 1000.0) / totalEntries) / 10.0 : 0.0;
            items.add(new StatusAnalyticsItem("COMPLETED", "Completed / Approved", completed, pct, "#10b981"));
        }
        if (inProgress > 0) {
            double pct = totalEntries > 0 ? Math.round((inProgress * 1000.0) / totalEntries) / 10.0 : 0.0;
            items.add(new StatusAnalyticsItem("IN_PROGRESS", "In Progress / Pending", inProgress, pct, "#f59e0b"));
        }
        if (draft > 0) {
            double pct = totalEntries > 0 ? Math.round((draft * 1000.0) / totalEntries) / 10.0 : 0.0;
            items.add(new StatusAnalyticsItem("DRAFT", "Draft", draft, pct, "#94a3b8"));
        }
        if (rejected > 0) {
            double pct = totalEntries > 0 ? Math.round((rejected * 1000.0) / totalEntries) / 10.0 : 0.0;
            items.add(new StatusAnalyticsItem("REJECTED", "Rejected", rejected, pct, "#f43f5e"));
        }

        return items;
    }

    private List<WorkDistributionItem> buildWorkDistribution(List<WorkEntry> entries) {
        Map<String, List<WorkEntry>> byProject = entries.stream()
                .collect(Collectors.groupingBy(w -> w.getProject() != null ? w.getProject().getName() : "Unassigned"));

        List<WorkDistributionItem> items = new ArrayList<>();
        for (Map.Entry<String, List<WorkEntry>> entry : byProject.entrySet()) {
            List<WorkEntry> pEntries = entry.getValue();
            Long projectId = pEntries.get(0).getProject() != null ? pEntries.get(0).getProject().getId() : null;
            long total = pEntries.size();

            Map<String, Long> catCounts = pEntries.stream()
                    .collect(Collectors.groupingBy(
                            w -> w.getCategory() != null && !w.getCategory().isBlank() ? w.getCategory().trim() : "General",
                            Collectors.counting()
                    ));

            items.add(new WorkDistributionItem(projectId, entry.getKey(), total, catCounts));
        }

        items.sort((a, b) -> Long.compare(b.getTotalCount(), a.getTotalCount()));
        return items.stream().limit(8).collect(Collectors.toList());
    }

    private boolean isCompleted(WorkEntry w) {
        if (w.getStatus() == null) return false;
        String s = w.getStatus().trim().toUpperCase();
        return s.equals("APPROVED") || s.equals("COMPLETED");
    }

    private boolean isInProgress(WorkEntry w) {
        if (w.getStatus() == null) return false;
        String s = w.getStatus().trim().toUpperCase();
        return s.equals("PENDING") || s.equals("SUBMITTED") || s.equals("IN PROGRESS") || s.equals("IN_PROGRESS");
    }

    private boolean isStatusMatch(String actual, String target) {
        if (actual == null) return false;
        return actual.trim().equalsIgnoreCase(target);
    }

    // ── Legacy Endpoints (Preserved for 100% Backward Compatibility) ───────────

    public DashboardWorkCountResponse getWorkCount(Long userId) {
        verifyUserExists(userId);
        long count = workEntryRepository.countByUserId(userId);
        return new DashboardWorkCountResponse(userId, count);
    }

    public DashboardProjectCountResponse getProjectCount(Long userId) {
        verifyUserExists(userId);
        long count = projectRepository.countByUserId(userId);
        return new DashboardProjectCountResponse(userId, count);
    }

    public List<WorkEntryResponse> getCurrentMonthWork(Long userId) {
        verifyUserExists(userId);
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        return workEntryRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(userId, startOfMonth, endOfMonth)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<WorkEntryResponse> getCurrentWeekWork(Long userId) {
        verifyUserExists(userId);
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        return workEntryRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(userId, startOfWeek, endOfWeek)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<DashboardProjectResponse> getWorkByProject(Long userId) {
        verifyUserExists(userId);
        return workEntryRepository.countWorkEntriesByProjectForUser(userId);
    }

    public List<DashboardCategoryResponse> getWorkByCategory(Long userId) {
        verifyUserExists(userId);
        return workEntryRepository.countWorkEntriesByCategoryForUser(userId);
    }

    public List<DashboardTechnologyResponse> getWorkByTechnology(Long userId) {
        verifyUserExists(userId);
        return workEntryRepository.countWorkEntriesByTechnologyForUser(userId);
    }

    public List<DashboardStatusResponse> getWorkByStatus(Long userId) {
        verifyUserExists(userId);
        return workEntryRepository.countWorkEntriesByStatusForUser(userId);
    }

    private void verifyUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
    }

    private WorkEntryResponse convertToResponse(WorkEntry workEntry) {
        return new WorkEntryResponse(
                workEntry.getId(),
                workEntry.getDate(),
                workEntry.getTitle(),
                workEntry.getDescription(),
                workEntry.getCategory(),
                workEntry.getTechnology(),
                workEntry.getStatus(),
                workEntry.getProject() != null ? workEntry.getProject().getId() : null,
                workEntry.getProject() != null ? workEntry.getProject().getName() : null
        );
    }
}
