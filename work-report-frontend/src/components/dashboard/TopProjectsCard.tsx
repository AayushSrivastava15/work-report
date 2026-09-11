import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Search,
  ArrowUpDown,
  MoreVertical,
  Maximize2,
  Table,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Calendar,
} from 'lucide-react';
import type { ProjectAnalyticsItem, WorkEntryResponse } from '../../types';

interface TopProjectsCardProps {
  projects: ProjectAnalyticsItem[];
  onProjectClick: (projectId: number | null, projectName: string) => void;
  onViewDetails: () => void;
  onExpand: () => void;
  onExportCsv: () => void;
  recentEntries?: WorkEntryResponse[];
}

export const TopProjectsCard: React.FC<TopProjectsCardProps> = ({
  projects,
  onProjectClick,
  onViewDetails,
  onExpand,
  onExportCsv,
  recentEntries = [],
}) => {
  const [limit, setLimit] = useState<'5' | '10' | 'ALL'>('5');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'completion'>('volume');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showMenu, setShowMenu] = useState(false);

  // Map project metadata (latest category, last activity date) from real recent entries
  const projectMetadataMap = useMemo(() => {
    const map = new Map<string, { category: string; lastDate: string }>();
    recentEntries.forEach((entry) => {
      const key = entry.projectName?.toLowerCase().trim();
      if (!key) return;
      const existing = map.get(key);
      if (!existing || (entry.date && entry.date > existing.lastDate)) {
        map.set(key, {
          category: entry.category || 'General',
          lastDate: entry.date || '',
        });
      }
    });
    return map;
  }, [recentEntries]);

  // Format relative date safely
  const formatActivityDate = (dateStr: string) => {
    if (!dateStr) return 'In selected period';
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';

    return dateStr;
  };

  // Filtered & Sorted Projects
  const displayProjects = useMemo(() => {
    let list = projects.map((p) => {
      const meta = projectMetadataMap.get(p.projectName.toLowerCase().trim());
      const completionRate =
        p.workCount > 0 ? Math.round((p.completedCount / p.workCount) * 100) : 0;
      return {
        ...p,
        category: meta?.category || 'Development',
        lastActivity: meta?.lastDate ? formatActivityDate(meta.lastDate) : 'Logged recently',
        completionRate,
      };
    });

    if (searchTerm.trim()) {
      list = list.filter(
        (p) =>
          p.projectName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'volume') {
        return sortOrder === 'desc' ? b.workCount - a.workCount : a.workCount - b.workCount;
      }
      return sortOrder === 'desc'
        ? b.completionRate - a.completionRate
        : a.completionRate - b.completionRate;
    });

    if (limit === 'ALL') return list;
    return list.slice(0, Number(limit));
  }, [projects, projectMetadataMap, searchTerm, sortBy, sortOrder, limit]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between transition-all">
      <div>
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Project Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Workload volume, completion rate, and latest activity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {/* Limit Selector */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              {(['5', '10', 'ALL'] as const).map((l) => (
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

            {/* Sort Criteria Toggle */}
            <button
              onClick={() => setSortBy(sortBy === 'volume' ? 'completion' : 'volume')}
              className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={sortBy === 'volume' ? 'Sorted by Volume' : 'Sorted by Completion %'}
            >
              {sortBy === 'volume' ? 'Vol' : 'Rate %'}
            </button>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            {/* More Menu */}
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
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Table className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    View Details Table
                  </button>
                  <button
                    onClick={onExpand}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    Expand View
                  </button>
                  <button
                    onClick={onExportCsv}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
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
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search projects by name or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Compact Project Performance Rows */}
        {displayProjects.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            No projects matched your criteria.
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayProjects.map((p, idx) => {
              const isOther = p.projectName.startsWith('Other');
              return (
                <div
                  key={p.projectId || p.projectName}
                  onClick={() => onProjectClick(p.projectId, p.projectName)}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700/70 transition-all cursor-pointer group"
                >
                  {/* Top Row: Name, Category, Status Tag, Total Count */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 w-4 shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {p.projectName}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                        {p.category}
                      </span>
                      {!isOther && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {p.workCount} {p.workCount === 1 ? 'entry' : 'entries'}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                        ({p.percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Segmented Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden flex my-1.5">
                    {p.completedCount > 0 && (
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${(p.completedCount / p.workCount) * 100}%` }}
                        title={`${p.completedCount} completed`}
                      />
                    )}
                    {p.inProgressCount > 0 && (
                      <div
                        className="bg-amber-400 h-full transition-all duration-500"
                        style={{ width: `${(p.inProgressCount / p.workCount) * 100}%` }}
                        title={`${p.inProgressCount} in progress`}
                      />
                    )}
                  </div>

                  {/* Bottom Row: Completion Rate, Sub-counts, Last Activity */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {p.completionRate}% complete
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {p.inProgressCount} in progress
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                      <Calendar className="w-2.5 h-2.5" />
                      {p.lastActivity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Showing {displayProjects.length} of {projects.length} projects
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
