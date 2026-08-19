import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { dashboardApi } from '../api/dashboardApi';
import type {
  DashboardCategoryResponse,
  DashboardProjectCountResponse,
  DashboardProjectResponse,
  DashboardStatusResponse,
  DashboardTechnologyResponse,
  DashboardWorkCountResponse,
  WorkEntryResponse,
} from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import {
  FileText,
  FolderKanban,
  Calendar,
  Clock,
  Layers,
  Cpu,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  Completed: '#10b981', // green-500
  'In Progress': '#3b82f6', // blue-500
  Pending: '#f59e0b', // amber-500
  Blocked: '#ef4444', // red-500
};

const PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const DashboardPage: React.FC = () => {
  const { currentUserId, currentUser } = useUser();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [workCount, setWorkCount] = useState<DashboardWorkCountResponse | null>(null);
  const [projectCount, setProjectCount] = useState<DashboardProjectCountResponse | null>(null);
  const [monthEntries, setMonthEntries] = useState<WorkEntryResponse[]>([]);
  const [weekEntries, setWeekEntries] = useState<WorkEntryResponse[]>([]);
  const [projectStats, setProjectStats] = useState<DashboardProjectResponse[]>([]);
  const [categoryStats, setCategoryStats] = useState<DashboardCategoryResponse[]>([]);
  const [techStats, setTechStats] = useState<DashboardTechnologyResponse[]>([]);
  const [statusStats, setStatusStats] = useState<DashboardStatusResponse[]>([]);

  const fetchDashboardData = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      setError(null);

      const [
        wcData,
        pcData,
        monthData,
        weekData,
        projectsData,
        categoriesData,
        techData,
        statusData,
      ] = await Promise.all([
        dashboardApi.getWorkCount(currentUserId),
        dashboardApi.getProjectCount(currentUserId),
        dashboardApi.getCurrentMonthWork(currentUserId),
        dashboardApi.getCurrentWeekWork(currentUserId),
        dashboardApi.getWorkByProject(currentUserId),
        dashboardApi.getWorkByCategory(currentUserId),
        dashboardApi.getWorkByTechnology(currentUserId),
        dashboardApi.getWorkByStatus(currentUserId),
      ]);

      setWorkCount(wcData);
      setProjectCount(pcData);
      setMonthEntries(monthData);
      setWeekEntries(weekData);
      setProjectStats(projectsData);
      setCategoryStats(categoriesData);
      setTechStats(techData);
      setStatusStats(statusData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUserId]);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard statistics..." className="py-24" />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  const hasData = (workCount?.workCount || 0) > 0;

  return (
    <div className="space-y-8">
      {/* Welcome & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of work progress and distribution for{' '}
            <span className="font-semibold text-slate-700">{currentUser?.name || 'User'}</span>
          </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Work Entries */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Work Entries
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">
              {workCount?.workCount ?? 0}
            </div>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Projects
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">
              {projectCount?.projectCount ?? 0}
            </div>
          </div>
        </div>

        {/* Current Month */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              This Month
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">
              {monthEntries.length}
            </div>
          </div>
        </div>

        {/* Current Week */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              This Week
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-0.5">
              {weekEntries.length}
            </div>
          </div>
        </div>
      </div>

      {/* If zero entries, show friendly empty state */}
      {!hasData ? (
        <EmptyState
          title="No Work Entries Recorded Yet"
          description="Start recording daily work entries to view project distributions, category breakdowns, and activity charts."
          actionLabel="+ Record Work Entry"
          onAction={() => (window.location.href = '/work-entries')}
        />
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Work by Project */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold text-slate-800">Work by Project</h3>
              </div>
              {projectStats.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                  No project data available
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="projectName" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(value: any) => [`${value} entries`, 'Work Count']}
                      />
                      <Bar dataKey="workCount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 2: Work by Category */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 mb-4">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-semibold text-slate-800">Work by Category</h3>
              </div>
              {categoryStats.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                  No category data available
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        dataKey="workCount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      >
                        {categoryStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(value: any) => [`${value} entries`, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 3: Work by Technology */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 mb-4">
                <Cpu className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-semibold text-slate-800">Work by Technology</h3>
              </div>
              {techStats.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                  No technology data available
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={techStats} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="technology" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(value: any) => [`${value} entries`, 'Count']}
                      />
                      <Bar dataKey="workCount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Chart 4: Work by Status */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-semibold text-slate-800">Work by Status</h3>
              </div>
              {statusStats.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                  No status data available
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusStats}
                        dataKey="workCount"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {statusStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.status] || PALETTE[index % PALETTE.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(value: any) => [`${value} entries`, 'Count']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Current Week Activity Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800">This Week's Activity</h3>
                <p className="text-xs text-slate-500">Entries recorded from Monday to Sunday this week</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {weekEntries.length} entries
              </span>
            </div>

            {weekEntries.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No work entries recorded for the current week.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Project</th>
                      <th className="px-6 py-3">Title</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weekEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 whitespace-nowrap font-medium text-slate-800">
                          {entry.date}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap font-medium text-blue-600">
                          {entry.projectName}
                        </td>
                        <td className="px-6 py-3.5 max-w-md truncate text-slate-700 font-medium">
                          {entry.title}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              entry.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : entry.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {entry.status}
                          </span>
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
    </div>
  );
};
