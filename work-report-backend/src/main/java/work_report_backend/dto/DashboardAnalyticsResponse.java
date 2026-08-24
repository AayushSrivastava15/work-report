package work_report_backend.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class DashboardAnalyticsResponse {

    private KpiMetrics kpis;
    private List<ActivityTrendItem> activityTrends = new ArrayList<>();
    private List<ProjectAnalyticsItem> projects = new ArrayList<>();
    private List<CategoryAnalyticsItem> categories = new ArrayList<>();
    private List<TechnologyAnalyticsItem> technologies = new ArrayList<>();
    private List<StatusAnalyticsItem> statuses = new ArrayList<>();
    private List<WorkDistributionItem> workDistribution = new ArrayList<>();
    private List<WorkEntryResponse> recentEntries = new ArrayList<>();

    public DashboardAnalyticsResponse() {
    }

    public KpiMetrics getKpis() {
        return kpis;
    }

    public void setKpis(KpiMetrics kpis) {
        this.kpis = kpis;
    }

    public List<ActivityTrendItem> getActivityTrends() {
        return activityTrends;
    }

    public void setActivityTrends(List<ActivityTrendItem> activityTrends) {
        this.activityTrends = activityTrends;
    }

    public List<ProjectAnalyticsItem> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectAnalyticsItem> projects) {
        this.projects = projects;
    }

    public List<CategoryAnalyticsItem> getCategories() {
        return categories;
    }

    public void setCategories(List<CategoryAnalyticsItem> categories) {
        this.categories = categories;
    }

    public List<TechnologyAnalyticsItem> getTechnologies() {
        return technologies;
    }

    public void setTechnologies(List<TechnologyAnalyticsItem> technologies) {
        this.technologies = technologies;
    }

    public List<StatusAnalyticsItem> getStatuses() {
        return statuses;
    }

    public void setStatuses(List<StatusAnalyticsItem> statuses) {
        this.statuses = statuses;
    }

    public List<WorkDistributionItem> getWorkDistribution() {
        return workDistribution;
    }

    public void setWorkDistribution(List<WorkDistributionItem> workDistribution) {
        this.workDistribution = workDistribution;
    }

    public List<WorkEntryResponse> getRecentEntries() {
        return recentEntries;
    }

    public void setRecentEntries(List<WorkEntryResponse> recentEntries) {
        this.recentEntries = recentEntries;
    }

    // ── Nested DTO Classes ──────────────────────────────────────────────────

    public static class KpiMetrics {
        private long totalWorkEntries;
        private long totalProjects;
        private long activeProjects;
        private long completedWork;
        private double completedPercentage;
        private long inProgressWork;
        private double inProgressPercentage;
        private long draftWork;
        private long rejectedWork;
        private long technologiesUsed;
        private long previousPeriodEntries;
        private double growthPercentage;

        public KpiMetrics() {
        }

        public long getTotalWorkEntries() {
            return totalWorkEntries;
        }

        public void setTotalWorkEntries(long totalWorkEntries) {
            this.totalWorkEntries = totalWorkEntries;
        }

        public long getTotalProjects() {
            return totalProjects;
        }

        public void setTotalProjects(long totalProjects) {
            this.totalProjects = totalProjects;
        }

        public long getActiveProjects() {
            return activeProjects;
        }

        public void setActiveProjects(long activeProjects) {
            this.activeProjects = activeProjects;
        }

        public long getCompletedWork() {
            return completedWork;
        }

        public void setCompletedWork(long completedWork) {
            this.completedWork = completedWork;
        }

        public double getCompletedPercentage() {
            return completedPercentage;
        }

        public void setCompletedPercentage(double completedPercentage) {
            this.completedPercentage = completedPercentage;
        }

        public long getInProgressWork() {
            return inProgressWork;
        }

        public void setInProgressWork(long inProgressWork) {
            this.inProgressWork = inProgressWork;
        }

        public double getInProgressPercentage() {
            return inProgressPercentage;
        }

        public void setInProgressPercentage(double inProgressPercentage) {
            this.inProgressPercentage = inProgressPercentage;
        }

        public long getDraftWork() {
            return draftWork;
        }

        public void setDraftWork(long draftWork) {
            this.draftWork = draftWork;
        }

        public long getRejectedWork() {
            return rejectedWork;
        }

        public void setRejectedWork(long rejectedWork) {
            this.rejectedWork = rejectedWork;
        }

        public long getTechnologiesUsed() {
            return technologiesUsed;
        }

        public void setTechnologiesUsed(long technologiesUsed) {
            this.technologiesUsed = technologiesUsed;
        }

        public long getPreviousPeriodEntries() {
            return previousPeriodEntries;
        }

        public void setPreviousPeriodEntries(long previousPeriodEntries) {
            this.previousPeriodEntries = previousPeriodEntries;
        }

        public double getGrowthPercentage() {
            return growthPercentage;
        }

        public void setGrowthPercentage(double growthPercentage) {
            this.growthPercentage = growthPercentage;
        }
    }

    public static class ActivityTrendItem {
        private String period; // e.g. '2026-08-20', 'Week 33', 'Aug 2026'
        private String date;   // raw ISO date
        private long totalEntries;
        private long completedEntries;
        private long inProgressEntries;
        private long draftEntries;

        public ActivityTrendItem() {
        }

        public ActivityTrendItem(String period, String date, long totalEntries, long completedEntries, long inProgressEntries, long draftEntries) {
            this.period = period;
            this.date = date;
            this.totalEntries = totalEntries;
            this.completedEntries = completedEntries;
            this.inProgressEntries = inProgressEntries;
            this.draftEntries = draftEntries;
        }

        public String getPeriod() {
            return period;
        }

        public void setPeriod(String period) {
            this.period = period;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public long getTotalEntries() {
            return totalEntries;
        }

        public void setTotalEntries(long totalEntries) {
            this.totalEntries = totalEntries;
        }

        public long getCompletedEntries() {
            return completedEntries;
        }

        public void setCompletedEntries(long completedEntries) {
            this.completedEntries = completedEntries;
        }

        public long getInProgressEntries() {
            return inProgressEntries;
        }

        public void setInProgressEntries(long inProgressEntries) {
            this.inProgressEntries = inProgressEntries;
        }

        public long getDraftEntries() {
            return draftEntries;
        }

        public void setDraftEntries(long draftEntries) {
            this.draftEntries = draftEntries;
        }
    }

    public static class ProjectAnalyticsItem {
        private Long projectId;
        private String projectName;
        private long workCount;
        private long completedCount;
        private long inProgressCount;
        private double percentage;

        public ProjectAnalyticsItem() {
        }

        public ProjectAnalyticsItem(Long projectId, String projectName, long workCount, long completedCount, long inProgressCount, double percentage) {
            this.projectId = projectId;
            this.projectName = projectName;
            this.workCount = workCount;
            this.completedCount = completedCount;
            this.inProgressCount = inProgressCount;
            this.percentage = percentage;
        }

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }

        public String getProjectName() {
            return projectName;
        }

        public void setProjectName(String projectName) {
            this.projectName = projectName;
        }

        public long getWorkCount() {
            return workCount;
        }

        public void setWorkCount(long workCount) {
            this.workCount = workCount;
        }

        public long getCompletedCount() {
            return completedCount;
        }

        public void setCompletedCount(long completedCount) {
            this.completedCount = completedCount;
        }

        public long getInProgressCount() {
            return inProgressCount;
        }

        public void setInProgressCount(long inProgressCount) {
            this.inProgressCount = inProgressCount;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }
    }

    public static class CategoryAnalyticsItem {
        private String category;
        private long workCount;
        private long completedCount;
        private long inProgressCount;
        private double percentage;

        public CategoryAnalyticsItem() {
        }

        public CategoryAnalyticsItem(String category, long workCount, long completedCount, long inProgressCount, double percentage) {
            this.category = category;
            this.workCount = workCount;
            this.completedCount = completedCount;
            this.inProgressCount = inProgressCount;
            this.percentage = percentage;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public long getWorkCount() {
            return workCount;
        }

        public void setWorkCount(long workCount) {
            this.workCount = workCount;
        }

        public long getCompletedCount() {
            return completedCount;
        }

        public void setCompletedCount(long completedCount) {
            this.completedCount = completedCount;
        }

        public long getInProgressCount() {
            return inProgressCount;
        }

        public void setInProgressCount(long inProgressCount) {
            this.inProgressCount = inProgressCount;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }
    }

    public static class TechnologyAnalyticsItem {
        private String technology;
        private long workCount;
        private long projectCount;
        private List<String> projects = new ArrayList<>();
        private double percentage;

        public TechnologyAnalyticsItem() {
        }

        public TechnologyAnalyticsItem(String technology, long workCount, long projectCount, List<String> projects, double percentage) {
            this.technology = technology;
            this.workCount = workCount;
            this.projectCount = projectCount;
            this.projects = projects;
            this.percentage = percentage;
        }

        public String getTechnology() {
            return technology;
        }

        public void setTechnology(String technology) {
            this.technology = technology;
        }

        public long getWorkCount() {
            return workCount;
        }

        public void setWorkCount(long workCount) {
            this.workCount = workCount;
        }

        public long getProjectCount() {
            return projectCount;
        }

        public void setProjectCount(long projectCount) {
            this.projectCount = projectCount;
        }

        public List<String> getProjects() {
            return projects;
        }

        public void setProjects(List<String> projects) {
            this.projects = projects;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }
    }

    public static class StatusAnalyticsItem {
        private String status;
        private String label;
        private long workCount;
        private double percentage;
        private String color;

        public StatusAnalyticsItem() {
        }

        public StatusAnalyticsItem(String status, String label, long workCount, double percentage, String color) {
            this.status = status;
            this.label = label;
            this.workCount = workCount;
            this.percentage = percentage;
            this.color = color;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public long getWorkCount() {
            return workCount;
        }

        public void setWorkCount(long workCount) {
            this.workCount = workCount;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }
    }

    public static class WorkDistributionItem {
        private Long projectId;
        private String projectName;
        private long totalCount;
        private Map<String, Long> categoryCounts;

        public WorkDistributionItem() {
        }

        public WorkDistributionItem(Long projectId, String projectName, long totalCount, Map<String, Long> categoryCounts) {
            this.projectId = projectId;
            this.projectName = projectName;
            this.totalCount = totalCount;
            this.categoryCounts = categoryCounts;
        }

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }

        public String getProjectName() {
            return projectName;
        }

        public void setProjectName(String projectName) {
            this.projectName = projectName;
        }

        public long getTotalCount() {
            return totalCount;
        }

        public void setTotalCount(long totalCount) {
            this.totalCount = totalCount;
        }

        public Map<String, Long> getCategoryCounts() {
            return categoryCounts;
        }

        public void setCategoryCounts(Map<String, Long> categoryCounts) {
            this.categoryCounts = categoryCounts;
        }
    }
}
