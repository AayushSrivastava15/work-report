import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { dashboardApi } from '../api/dashboardApi';
import { projectApi } from '../api/projectApi';
import { userApi } from '../api/userApi';
import type {
  DashboardAnalyticsResponse,
  AnalyticsFilterParams,
  ProjectResponse,
  UserResponse,
  WorkEntryResponse,
  ProjectAnalyticsItem,
  CategoryAnalyticsItem,
  TechnologyAnalyticsItem,
  StatusAnalyticsItem,
} from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';
import { WorkEntryDetailsModal } from '../components/work-entries/WorkEntryDetailsModal';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardKpiCards } from '../components/dashboard/DashboardKpiCards';
import { WorkActivityTrendCard } from '../components/dashboard/WorkActivityTrendCard';
import { TopProjectsCard } from '../components/dashboard/TopProjectsCard';
import { TopCategoriesCard } from '../components/dashboard/TopCategoriesCard';
import { TopTechnologiesCard } from '../components/dashboard/TopTechnologiesCard';
import { LifecycleStatusCard } from '../components/dashboard/LifecycleStatusCard';
import { WorkDistributionCard } from '../components/dashboard/WorkDistributionCard';
import { NeedsAttentionCard } from '../components/dashboard/NeedsAttentionCard';
import { AnalyticsDetailsDrawer } from '../components/dashboard/AnalyticsDetailsDrawer';
import { ChartExpandModal } from '../components/dashboard/ChartExpandModal';
import { reportApi } from '../api/reportApi';
import { downloadBlob } from '../utils/downloadHelper';
import { useToast } from '../context/ToastContext';
import {
  Clock,
  Eye,
  History,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUserId, currentUser } = useUser();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Analytics Response Data
  const [analytics, setAnalytics] = useState<DashboardAnalyticsResponse | null>(null);

  // Filter & Drilldown State
  const [filters, setFilters] = useState<AnalyticsFilterParams>({
    aggregation: 'DAY',
  });
  const [drilldown, setDrilldown] = useState<{ key: string; value: string } | null>(null);

  // Dropdown Reference Data
  const [projectsList, setProjectsList] = useState<ProjectResponse[]>([]);
  const [teamMembersList, setTeamMembersList] = useState<UserResponse[]>([]);

  // Drawer & Modal States
  const [drawerType, setDrawerType] = useState<
    'PROJECTS' | 'CATEGORIES' | 'TECHNOLOGIES' | 'STATUSES' | 'ACTIVITY' | 'RECENT' | null
  >(null);
  const [expandModal, setExpandModal] = useState<{
    title: string;
    subtitle?: string;
    type: 'ACTIVITY' | 'PROJECTS' | 'CATEGORIES' | 'TECHNOLOGIES' | 'STATUS' | 'DISTRIBUTION';
  } | null>(null);

  // Selected Entry for Details Modal
  const [selectedEntry, setSelectedEntry] = useState<WorkEntryResponse | null>(null);

  const isManagerOrAdmin =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'MANAGER';

  // Load Projects and Team Members for selectors
  useEffect(() => {
    if (!currentUserId) return;
    projectApi
      .getProjectsByUser(currentUserId, 0, 100)
      .then((res) => setProjectsList(res.content))
      .catch(() => {});

    if (isManagerOrAdmin) {
      userApi
        .getAllUsers()
        .then((users) => {
          const list = users.filter((u) => u.id !== currentUserId);
          setTeamMembersList(list);
        })
        .catch(() => {});
    }
  }, [currentUserId, isManagerOrAdmin]);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: AnalyticsFilterParams = {
        ...filters,
      };

      // Apply drill-down if active
      if (drilldown) {
        if (drilldown.key === 'Project') {
          const matchedProj = projectsList.find(
            (p) => p.name.toLowerCase() === drilldown.value.toLowerCase()
          );
          if (matchedProj) combinedFilters.projectId = matchedProj.id;
        } else if (drilldown.key === 'Category') {
          combinedFilters.category = drilldown.value;
        } else if (drilldown.key === 'Technology') {
          combinedFilters.technology = drilldown.value;
        } else if (drilldown.key === 'Status') {
          combinedFilters.status = drilldown.value;
        }
      }

      const data = await dashboardApi.getAnalytics(currentUserId, combinedFilters);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics statistics');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, filters, drilldown, projectsList]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Filter change handlers
  const handleFilterChange = (newFilters: Partial<AnalyticsFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({ aggregation: 'DAY' });
    setDrilldown(null);
  };

  // Drilldown handlers
  const handleDrilldownProject = (_projectId: number | null, projectName: string) => {
    if (projectName.startsWith('Other')) {
      setDrawerType('PROJECTS');
      return;
    }
    setDrilldown({ key: 'Project', value: projectName });
  };

  const handleDrilldownCategory = (categoryName: string) => {
    if (categoryName.startsWith('Other')) {
      setDrawerType('CATEGORIES');
      return;
    }
    setDrilldown({ key: 'Category', value: categoryName });
  };

  const handleDrilldownTech = (techName: string) => {
    if (techName.startsWith('Other')) {
      setDrawerType('TECHNOLOGIES');
      return;
    }
    setDrilldown({ key: 'Technology', value: techName });
  };

  const handleDrilldownStatus = (statusKey: string) => {
    setDrilldown({ key: 'Status', value: statusKey });
  };

  // Extract distinct category & tech names from analytics for dropdown options
  const categoryOptions = useMemo(() => {
    return (analytics?.categories || []).map((c) => c.category);
  }, [analytics]);

  const technologyOptions = useMemo(() => {
    return (analytics?.technologies || []).map((t) => t.technology);
  }, [analytics]);

  // CSV Exporter for general analytics
  const exportFullCsv = () => {
    if (!analytics || !analytics.recentEntries) return;
    const headers = ['ID', 'Date', 'Project', 'Title', 'Category', 'Technology', 'Status'];
    const rows = analytics.recentEntries.map((e) => [
      e.id,
      `"${e.date}"`,
      `"${(e.projectName || '').replace(/"/g, '""')}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      `"${(e.technology || '').replace(/"/g, '""')}"`,
      `"${e.status}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `work-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Report Download Shortcuts
  const handleExportPdf = async () => {
    if (!currentUserId) return;
    try {
      setIsExporting(true);
      showInfo('Generating PDF work report...', 'Export Started');
      const { blob, filename } = await reportApi.exportPdf(currentUserId, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        projectId: filters.projectId,
        category: filters.category,
        technology: filters.technology,
        status: filters.status,
      });
      const finalName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      downloadBlob(blob, finalName);
      showSuccess(`Report downloaded: ${finalName}`, 'Export Complete');
    } catch (err: any) {
      showError(err.message || 'Unable to export PDF report. Please try again.', 'Export Failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!currentUserId) return;
    try {
      setIsExporting(true);
      showInfo('Generating Excel spreadsheet...', 'Export Started');
      const { blob, filename } = await reportApi.exportExcel(currentUserId, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        projectId: filters.projectId,
        category: filters.category,
        technology: filters.technology,
        status: filters.status,
      });
      const finalName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
      downloadBlob(blob, finalName);
      showSuccess(`Report downloaded: ${finalName}`, 'Export Complete');
    } catch (err: any) {
      showError(err.message || 'Unable to export Excel report. Please try again.', 'Export Failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDocx = async () => {
    if (!currentUserId) return;
    try {
      setIsExporting(true);
      showInfo('Generating Word document...', 'Export Started');
      const { blob, filename } = await reportApi.exportDocx(currentUserId, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        projectId: filters.projectId,
        category: filters.category,
        technology: filters.technology,
        status: filters.status,
      });
      const finalName = filename.endsWith('.docx') ? filename : `${filename}.docx`;
      downloadBlob(blob, finalName);
      showSuccess(`Report downloaded: ${finalName}`, 'Export Complete');
    } catch (err: any) {
      showError(err.message || 'Unable to export Word report. Please try again.', 'Export Failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading && !analytics) {
    return <LoadingSpinner message="Calculating high-density work analytics..." className="py-24" />;
  }

  if (error && !analytics) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={error} onRetry={fetchAnalytics} />
      </div>
    );
  }

  const kpis = analytics?.kpis || {
    totalWorkEntries: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedWork: 0,
    completedPercentage: 0,
    inProgressWork: 0,
    inProgressPercentage: 0,
    draftWork: 0,
    rejectedWork: 0,
    technologiesUsed: 0,
    previousPeriodEntries: 0,
    growthPercentage: 0,
  };

  const hasData = kpis.totalWorkEntries > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dashboard Header: Unified Command Center & Direct Report Shortcuts */}
      <DashboardHeader
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        projects={projectsList}
        categories={categoryOptions}
        technologies={technologyOptions}
        teamMembers={teamMembersList}
        drilldownKey={drilldown?.key || null}
        drilldownValue={drilldown?.value || null}
        onClearDrilldown={() => setDrilldown(null)}
        userName={currentUser?.name}
        isManagerOrAdmin={isManagerOrAdmin}
        draftCount={kpis.draftWork}
        pendingCount={kpis.inProgressWork}
        onCreateReport={() => navigate('/work-entries?new=1')}
        onNavigateDrafts={() => navigate('/work-entries?status=DRAFT')}
        onNavigatePending={() => navigate('/work-entries?status=PENDING')}
        onNavigateReports={() => navigate('/reports')}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
        onExportDocx={handleExportDocx}
        onExportCsv={exportFullCsv}
        isExporting={isExporting}
      />

      {/* 2. KPI Summary Cards (with Sparklines, Engagement, & Progress) */}
      <DashboardKpiCards
        kpis={kpis}
        activityTrends={analytics?.activityTrends || []}
        onCardClick={(type) => {
          if (type === 'projects' || type === 'active_projects') setDrawerType('PROJECTS');
          if (type === 'technologies') setDrawerType('TECHNOLOGIES');
          if (type === 'completed') handleDrilldownStatus('APPROVED');
          if (type === 'in_progress') handleDrilldownStatus('PENDING');
          if (type === 'entries') setDrawerType('RECENT');
        }}
      />

      {/* Zero Data State */}
      {!hasData ? (
        <EmptyState
          title="No Work Reports Recorded In This Range"
          description="Try selecting 'All Time' or adjusting your filters to view project breakdowns, status lifecycle distributions, and weekly metrics."
          actionLabel="+ Create Work Report"
          onAction={() => navigate('/work-entries?new=1')}
        />
      ) : (
        <>
          {/* 3. Primary Analytics: Work Activity Over Time (8 cols) + Work Status (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <WorkActivityTrendCard
                trends={analytics?.activityTrends || []}
                currentAggregation={filters.aggregation || 'DAY'}
                onAggregationChange={(agg) => handleFilterChange({ aggregation: agg })}
                onViewDetails={() => setDrawerType('ACTIVITY')}
                onExpand={() =>
                  setExpandModal({
                    title: 'Work Activity Over Time',
                    subtitle: 'Throughput velocity and delivery trends over selected period',
                    type: 'ACTIVITY',
                  })
                }
                onExportCsv={exportFullCsv}
              />
            </div>

            <div className="lg:col-span-4">
              <LifecycleStatusCard
                statuses={analytics?.statuses || []}
                totalEntries={kpis.totalWorkEntries}
                onStatusClick={handleDrilldownStatus}
                onViewDetails={() => setDrawerType('STATUSES')}
                onExpand={() =>
                  setExpandModal({
                    title: 'Lifecycle Status Breakdown',
                    subtitle: 'Work delivery pipeline and review distribution',
                    type: 'STATUS',
                  })
                }
              />
            </div>
          </div>

          {/* 4. Secondary Analytics: Project Performance (Ranked Rows) + Work by Category (Donut) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopProjectsCard
              projects={analytics?.projects || []}
              recentEntries={analytics?.recentEntries || []}
              onProjectClick={handleDrilldownProject}
              onViewDetails={() => setDrawerType('PROJECTS')}
              onExpand={() =>
                setExpandModal({
                  title: 'Project Performance Breakdown',
                  subtitle: 'Volume distribution, completion rate, and latest activity per project',
                  type: 'PROJECTS',
                })
              }
              onExportCsv={exportFullCsv}
            />

            <TopCategoriesCard
              categories={analytics?.categories || []}
              onCategoryClick={handleDrilldownCategory}
              onViewDetails={() => setDrawerType('CATEGORIES')}
              onExpand={() =>
                setExpandModal({
                  title: 'Work Categories Allocation',
                  subtitle: 'Effort allocation across functional domains',
                  type: 'CATEGORIES',
                })
              }
              onExportCsv={exportFullCsv}
            />
          </div>

          {/* 5. Work Breakdown: Project × Category Matrix Heatmap + Technology Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WorkDistributionCard
              distribution={analytics?.workDistribution || []}
              onProjectClick={handleDrilldownProject}
              onViewDetails={() => setDrawerType('PROJECTS')}
              onExpand={() =>
                setExpandModal({
                  title: 'Work Distribution Matrix Heatmap',
                  subtitle: 'Functional domain heatmap across top projects',
                  type: 'DISTRIBUTION',
                })
              }
              onExportCsv={exportFullCsv}
            />

            <TopTechnologiesCard
              technologies={analytics?.technologies || []}
              onTechClick={handleDrilldownTech}
              onViewDetails={() => setDrawerType('TECHNOLOGIES')}
              onExpand={() =>
                setExpandModal({
                  title: 'Technology Stack Directory',
                  subtitle: 'Adoption and project usage breakdown across tech stacks',
                  type: 'TECHNOLOGIES',
                })
              }
              onExportCsv={exportFullCsv}
            />
          </div>

          {/* 6. Needs Attention Area (Pending, Drafts, Action items from real data) */}
          <NeedsAttentionCard
            kpis={kpis}
            recentEntries={analytics?.recentEntries || []}
            onSelectEntry={(entry) => setSelectedEntry(entry)}
            onNavigateDrafts={() => navigate('/work-entries?status=DRAFT')}
            onNavigatePending={() => navigate('/work-entries?status=PENDING')}
            onNavigateWorkEntries={() => navigate('/work-entries')}
          />

          {/* 7. Recent Filtered Deliverables Feed & Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden transition-all">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      Recent Deliverables
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {analytics?.recentEntries?.length || 0} matching
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Latest work logs matching active filter and drilldown criteria
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerType('RECENT')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer"
              >
                View Full Table
              </button>
            </div>

            {(!analytics?.recentEntries || analytics.recentEntries.length === 0) ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No work logs found for current filter selection.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Project</th>
                      <th className="px-6 py-3">Deliverable & Summary</th>
                      <th className="px-6 py-3">Domain</th>
                      <th className="px-6 py-3">Technology</th>
                      <th className="px-6 py-3">Lifecycle Status</th>
                      <th className="px-6 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {analytics.recentEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-3.5 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {entry.date}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDrilldownProject(entry.projectId || null, entry.projectName);
                            }}
                            className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            title={`Filter by ${entry.projectName}`}
                          >
                            <FolderKanban className="w-3 h-3" />
                            {entry.projectName}
                          </button>
                        </td>
                        <td className="px-6 py-3.5 max-w-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          <div className="truncate" title={entry.title}>
                            {entry.title}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDrilldownCategory(entry.category);
                            }}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                            title={`Filter by ${entry.category}`}
                          >
                            {entry.category}
                          </button>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDrilldownTech(entry.technology);
                            }}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800 hover:bg-purple-100 transition-colors cursor-pointer"
                            title={`Filter by ${entry.technology}`}
                          >
                            {entry.technology}
                          </button>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDrilldownStatus(entry.status);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-all hover:scale-105 ${
                              entry.status === 'Approved' || entry.status === 'Completed' || entry.status === 'APPROVED' || entry.status === 'COMPLETED'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : entry.status === 'Pending' || entry.status === 'Submitted' || entry.status === 'In Progress' || entry.status === 'PENDING' || entry.status === 'IN PROGRESS'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : entry.status === 'Rejected' || entry.status === 'REJECTED'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                            title={`Filter by ${entry.status}`}
                          >
                            {entry.status === 'Approved' || entry.status === 'Completed' || entry.status === 'APPROVED' || entry.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            ) : entry.status === 'Pending' || entry.status === 'Submitted' || entry.status === 'In Progress' || entry.status === 'PENDING' ? (
                              <Clock className="w-2.5 h-2.5 text-amber-600" />
                            ) : (
                              <AlertCircle className="w-2.5 h-2.5" />
                            )}
                            {entry.status}
                          </button>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedEntry(entry)}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                            title="View Report Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Slide-Over Drawers for Deep Exploration ───────────────────────────── */}

      {/* Projects Drawer */}
      <AnalyticsDetailsDrawer<ProjectAnalyticsItem>
        isOpen={drawerType === 'PROJECTS'}
        onClose={() => setDrawerType(null)}
        title="Project Analytics Directory"
        subtitle="Complete listing of project work distribution and completion statistics"
        data={analytics?.projects || []}
        searchKey="projectName"
        exportFileName={`projects-analytics-${new Date().toISOString().split('T')[0]}.csv`}
        onRowClick={(p) => {
          setDrawerType(null);
          handleDrilldownProject(p.projectId, p.projectName);
        }}
        columns={[
          { key: 'projectName', header: 'Project Name', sortable: true },
          { key: 'workCount', header: 'Work Entries', sortable: true, align: 'right' },
          { key: 'completedCount', header: 'Completed', sortable: true, align: 'right' },
          { key: 'inProgressCount', header: 'In Progress', sortable: true, align: 'right' },
          {
            key: 'percentage',
            header: 'Share (%)',
            sortable: true,
            align: 'right',
            render: (p) => `${p.percentage}%`,
          },
        ]}
      />

      {/* Categories Drawer */}
      <AnalyticsDetailsDrawer<CategoryAnalyticsItem>
        isOpen={drawerType === 'CATEGORIES'}
        onClose={() => setDrawerType(null)}
        title="Category Analytics Directory"
        subtitle="Work allocation and delivery metrics across all functional categories"
        data={analytics?.categories || []}
        searchKey="category"
        exportFileName={`categories-analytics-${new Date().toISOString().split('T')[0]}.csv`}
        onRowClick={(c) => {
          setDrawerType(null);
          handleDrilldownCategory(c.category);
        }}
        columns={[
          { key: 'category', header: 'Category Name', sortable: true },
          { key: 'workCount', header: 'Work Entries', sortable: true, align: 'right' },
          { key: 'completedCount', header: 'Completed', sortable: true, align: 'right' },
          { key: 'inProgressCount', header: 'In Progress', sortable: true, align: 'right' },
          {
            key: 'percentage',
            header: 'Share (%)',
            sortable: true,
            align: 'right',
            render: (c) => `${c.percentage}%`,
          },
        ]}
      />

      {/* Technologies Drawer */}
      <AnalyticsDetailsDrawer<TechnologyAnalyticsItem>
        isOpen={drawerType === 'TECHNOLOGIES'}
        onClose={() => setDrawerType(null)}
        title="Technology Directory & Adoption"
        subtitle="Full list of technologies used with project cross-references"
        data={analytics?.technologies || []}
        searchKey="technology"
        exportFileName={`technologies-analytics-${new Date().toISOString().split('T')[0]}.csv`}
        onRowClick={(t) => {
          setDrawerType(null);
          handleDrilldownTech(t.technology);
        }}
        columns={[
          { key: 'technology', header: 'Technology', sortable: true },
          { key: 'workCount', header: 'Usage Count', sortable: true, align: 'right' },
          { key: 'projectCount', header: 'Projects Count', sortable: true, align: 'right' },
          {
            key: 'projects',
            header: 'Projects Using It',
            render: (t) => (
              <span className="text-slate-500 truncate max-w-xs block">
                {t.projects?.join(', ') || 'N/A'}
              </span>
            ),
          },
          {
            key: 'percentage',
            header: 'Share (%)',
            sortable: true,
            align: 'right',
            render: (t) => `${t.percentage}%`,
          },
        ]}
      />

      {/* Statuses Drawer */}
      <AnalyticsDetailsDrawer<StatusAnalyticsItem>
        isOpen={drawerType === 'STATUSES'}
        onClose={() => setDrawerType(null)}
        title="Status Lifecycle Breakdown"
        subtitle="Work entries categorized by execution and review state"
        data={analytics?.statuses || []}
        exportFileName={`status-analytics-${new Date().toISOString().split('T')[0]}.csv`}
        onRowClick={(s) => {
          setDrawerType(null);
          handleDrilldownStatus(s.status);
        }}
        columns={[
          {
            key: 'label',
            header: 'Status Name',
            render: (s) => (
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{s.label}</span>
              </div>
            ),
          },
          { key: 'workCount', header: 'Work Entries', sortable: true, align: 'right' },
          {
            key: 'percentage',
            header: 'Share (%)',
            sortable: true,
            align: 'right',
            render: (s) => `${s.percentage}%`,
          },
        ]}
      />

      {/* Recent / Full Work Logs Drawer */}
      <AnalyticsDetailsDrawer<WorkEntryResponse>
        isOpen={drawerType === 'RECENT'}
        onClose={() => setDrawerType(null)}
        title="Filtered Work Reports"
        subtitle="Complete tabular view of all matching reports"
        data={analytics?.recentEntries || []}
        searchKey="title"
        exportFileName={`filtered-work-reports-${new Date().toISOString().split('T')[0]}.csv`}
        onRowClick={(entry) => setSelectedEntry(entry)}
        columns={[
          { key: 'date', header: 'Date', sortable: true },
          { key: 'projectName', header: 'Project', sortable: true },
          { key: 'title', header: 'Title & Summary', sortable: true },
          { key: 'category', header: 'Category', sortable: true },
          { key: 'technology', header: 'Technology' },
          {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (e) => (
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {e.status}
              </span>
            ),
          },
        ]}
      />

      {/* ── Chart Expansion Modal ────────────────────────────────────────────── */}
      <ChartExpandModal
        isOpen={!!expandModal}
        onClose={() => setExpandModal(null)}
        title={expandModal?.title || 'Chart Details'}
        subtitle={expandModal?.subtitle}
      >
        {expandModal?.type === 'ACTIVITY' && (
          <div className="w-full">
            <WorkActivityTrendCard
              trends={analytics?.activityTrends || []}
              currentAggregation={filters.aggregation || 'DAY'}
              onAggregationChange={(agg) => handleFilterChange({ aggregation: agg })}
              onViewDetails={() => {
                setExpandModal(null);
                setDrawerType('ACTIVITY');
              }}
              onExpand={() => {}}
              onExportCsv={exportFullCsv}
            />
          </div>
        )}
        {expandModal?.type === 'PROJECTS' && (
          <div className="w-full">
            <TopProjectsCard
              projects={analytics?.projects || []}
              recentEntries={analytics?.recentEntries || []}
              onProjectClick={(pId, pName) => {
                setExpandModal(null);
                handleDrilldownProject(pId, pName);
              }}
              onViewDetails={() => {
                setExpandModal(null);
                setDrawerType('PROJECTS');
              }}
              onExpand={() => {}}
              onExportCsv={exportFullCsv}
            />
          </div>
        )}
        {expandModal?.type === 'CATEGORIES' && (
          <div className="w-full">
            <TopCategoriesCard
              categories={analytics?.categories || []}
              onCategoryClick={(cat) => {
                setExpandModal(null);
                handleDrilldownCategory(cat);
              }}
              onViewDetails={() => {
                setExpandModal(null);
                setDrawerType('CATEGORIES');
              }}
              onExpand={() => {}}
              onExportCsv={exportFullCsv}
            />
          </div>
        )}
        {expandModal?.type === 'TECHNOLOGIES' && (
          <div className="w-full">
            <TopTechnologiesCard
              technologies={analytics?.technologies || []}
              onTechClick={(tech) => {
                setExpandModal(null);
                handleDrilldownTech(tech);
              }}
              onViewDetails={() => {
                setExpandModal(null);
                setDrawerType('TECHNOLOGIES');
              }}
              onExpand={() => {}}
              onExportCsv={exportFullCsv}
            />
          </div>
        )}
        {expandModal?.type === 'STATUS' && (
          <div className="w-full">
            <LifecycleStatusCard
              statuses={analytics?.statuses || []}
              totalEntries={kpis.totalWorkEntries}
              onStatusClick={(status) => {
                setExpandModal(null);
                handleDrilldownStatus(status);
              }}
              onViewDetails={() => {
                setExpandModal(null);
                setDrawerType('STATUSES');
              }}
              onExpand={() => {}}
            />
          </div>
        )}
        {expandModal?.type === 'DISTRIBUTION' && (
          <div className="w-full">
            <WorkDistributionCard
              distribution={analytics?.workDistribution || []}
              onProjectClick={(pId, pName) => {
                setExpandModal(null);
                handleDrilldownProject(pId, pName);
              }}
              onViewDetails={() => {
                setExpandModal(null);
                setDrawerType('PROJECTS');
              }}
              onExpand={() => {}}
              onExportCsv={exportFullCsv}
            />
          </div>
        )}
      </ChartExpandModal>

      {/* ── Entry Details Modal ──────────────────────────────────────────────── */}
      <WorkEntryDetailsModal
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onEdit={(entry) => {
          setSelectedEntry(null);
          navigate(`/work-entries?edit=${entry.id}`);
        }}
      />
    </div>
  );
};
