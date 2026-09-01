import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  FolderKanban,
  Search,
  ArrowUpDown,
  MoreVertical,
  Maximize2,
  Table,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { ProjectAnalyticsItem } from '../../types';

interface TopProjectsCardProps {
  projects: ProjectAnalyticsItem[];
  onProjectClick: (projectId: number | null, projectName: string) => void;
  onViewDetails: () => void;
  onExpand: () => void;
  onExportCsv: () => void;
}

export const TopProjectsCard: React.FC<TopProjectsCardProps> = ({
  projects,
  onProjectClick,
  onViewDetails,
  onExpand,
  onExportCsv,
}) => {
  const [limit, setLimit] = useState<'5' | '10' | '20' | 'ALL'>('10');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [unit, setUnit] = useState<'count' | 'percentage'>('count');
  const [showMenu, setShowMenu] = useState(false);

  // Smart Aggregation with "Other Projects"
  const chartData = useMemo(() => {
    let filtered = [...projects];

    if (searchTerm.trim()) {
      filtered = filtered.filter((p) =>
        p.projectName.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    filtered.sort((a, b) =>
      sortOrder === 'desc' ? b.workCount - a.workCount : a.workCount - b.workCount
    );

    if (limit === 'ALL' || filtered.length <= Number(limit)) {
      return filtered.map((p) => ({
        ...p,
        displayValue: unit === 'count' ? p.workCount : p.percentage,
      }));
    }

    const n = Number(limit);
    const topN = filtered.slice(0, n);
    const otherItems = filtered.slice(n);

    const otherWorkCount = otherItems.reduce((acc, curr) => acc + curr.workCount, 0);
    const otherCompleted = otherItems.reduce((acc, curr) => acc + curr.completedCount, 0);
    const otherInProgress = otherItems.reduce((acc, curr) => acc + curr.inProgressCount, 0);
    const otherPercentage = Math.round(
      otherItems.reduce((acc, curr) => acc + curr.percentage, 0) * 10
    ) / 10;

    const result = topN.map((p) => ({
      ...p,
      displayValue: unit === 'count' ? p.workCount : p.percentage,
    }));

    if (otherItems.length > 0) {
      result.push({
        projectId: null,
        projectName: `Other Projects (${otherItems.length})`,
        workCount: otherWorkCount,
        completedCount: otherCompleted,
        inProgressCount: otherInProgress,
        percentage: otherPercentage,
        displayValue: unit === 'count' ? otherWorkCount : otherPercentage,
      });
    }

    return result;
  }, [projects, limit, searchTerm, sortOrder, unit]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between">
      <div>
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                Top Projects by Work Volume
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any bar to filter entire dashboard by that project
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {/* Limit Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              {(['5', '10', '20', 'ALL'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLimit(l)}
                  className={`px-2 py-0.5 font-semibold rounded-md transition-all cursor-pointer ${
                    limit === l
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {l === 'ALL' ? 'All' : `Top ${l}`}
                </button>
              ))}
            </div>

            {/* Unit Toggle */}
            <button
              onClick={() => setUnit(unit === 'count' ? 'percentage' : 'count')}
              className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="Toggle Count or Percentage"
            >
              {unit === 'count' ? '#' : '%'}
            </button>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Toggle Sort Direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs text-slate-700 dark:text-slate-200 animate-fadeIn"
                  onClick={() => setShowMenu(false)}
                >
                  <button
                    onClick={onViewDetails}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Table className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    View Details Table
                  </button>
                  <button
                    onClick={onExpand}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    Expand Chart
                  </button>
                  <button
                    onClick={onExportCsv}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    Export CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Chart Canvas */}
        {chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            No projects matched your criteria.
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#64748b', opacity: 0.25 }}
                  unit={unit === 'percentage' ? '%' : ''}
                />
                <YAxis
                  type="category"
                  dataKey="projectName"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  width={150}
                  tickFormatter={(val: string) =>
                    val.length > 20 ? `${val.substring(0, 18)}...` : val
                  }
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                  wrapperStyle={{ outline: 'none', zIndex: 50 }}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const item = payload[0].payload as ProjectAnalyticsItem;
                    return (
                      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xl text-xs space-y-1.5 max-w-xs pointer-events-none">
                        <div className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                          {item.projectName}
                        </div>
                        <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                          <span>Total Work Entries:</span>
                          <strong className="font-bold text-indigo-600 dark:text-indigo-400">{item.workCount}</strong>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                          <span>Share of Work:</span>
                          <strong className="text-slate-800 dark:text-slate-200">{item.percentage}%</strong>
                        </div>
                        <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                          <span>Completed:</span>
                          <strong>{item.completedCount}</strong>
                        </div>
                        <div className="flex justify-between gap-4 text-amber-600 dark:text-amber-400">
                          <span>In Progress:</span>
                          <strong>{item.inProgressCount}</strong>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="displayValue"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                  onClick={(data: any) => onProjectClick(data.projectId, data.projectName)}
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.projectName.startsWith('Other')
                          ? '#94a3b8'
                          : index === 0
                          ? '#4f46e5'
                          : '#6366f1'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer Details Button */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Showing {chartData.length} of {projects.length} total projects
        </span>
        <button
          onClick={onViewDetails}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          View All Projects
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
