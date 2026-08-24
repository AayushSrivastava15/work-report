import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Filter,
  RotateCcw,
  X,
  Layers,
  Cpu,
  FolderKanban,
  CheckCircle2,
  Users,
} from 'lucide-react';
import type { AnalyticsFilterParams, ProjectResponse, UserResponse } from '../../types';

interface DashboardHeaderProps {
  filters: AnalyticsFilterParams;
  onFilterChange: (newFilters: Partial<AnalyticsFilterParams>) => void;
  onResetFilters: () => void;
  projects: ProjectResponse[];
  categories: string[];
  technologies: string[];
  teamMembers?: UserResponse[];
  drilldownKey: string | null;
  drilldownValue: string | null;
  onClearDrilldown: () => void;
  userName?: string;
  isManagerOrAdmin?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  projects,
  categories,
  technologies,
  teamMembers = [],
  drilldownKey,
  drilldownValue,
  onClearDrilldown,
  userName = 'User',
  isManagerOrAdmin = false,
}) => {
  // Preset calculations
  const applyPreset = (preset: string) => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    let start = '';
    let end = formatDate(today);

    switch (preset) {
      case '7D': {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = formatDate(d);
        break;
      }
      case '30D': {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        start = formatDate(d);
        break;
      }
      case '3M': {
        const d = new Date();
        d.setMonth(d.getMonth() - 3);
        start = formatDate(d);
        break;
      }
      case 'YEAR': {
        const d = new Date(today.getFullYear(), 0, 1);
        start = formatDate(d);
        break;
      }
      case 'ALL':
      default:
        start = '';
        end = '';
        break;
    }

    onFilterChange({ startDate: start, endDate: end });
  };

  const getActivePreset = () => {
    if (!filters.startDate && !filters.endDate) return 'ALL';
    const today = new Date().toISOString().split('T')[0];
    if (filters.endDate !== today) return 'CUSTOM';

    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    if (filters.startDate === d7.toISOString().split('T')[0]) return '7D';

    const d30 = new Date();
    d30.setDate(d30.getDate() - 30);
    if (filters.startDate === d30.toISOString().split('T')[0]) return '30D';

    const d3m = new Date();
    d3m.setMonth(d3m.getMonth() - 3);
    if (filters.startDate === d3m.toISOString().split('T')[0]) return '3M';

    const dYear = new Date(new Date().getFullYear(), 0, 1);
    if (filters.startDate === dYear.toISOString().split('T')[0]) return 'YEAR';

    return 'CUSTOM';
  };

  const activePreset = getActivePreset();
  const hasActiveFilters = Boolean(
    filters.startDate ||
      filters.endDate ||
      filters.projectId ||
      filters.category ||
      filters.technology ||
      filters.status ||
      filters.teamMemberId ||
      drilldownValue
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 sm:p-6 space-y-4 transition-all">
      {/* Title & Subtitle + Date Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Work Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Understand where your team's time and effort are going.
              </p>
            </div>
          </div>
        </div>

        {/* Date Presets Toolbar with Shared Layout Active Pill */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100/90 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start lg:self-center">
          {[
            { id: '7D', label: 'Last 7 Days' },
            { id: '30D', label: 'Last 30 Days' },
            { id: '3M', label: 'Last 3 Months' },
            { id: 'YEAR', label: 'This Year' },
            { id: 'ALL', label: 'All Time' },
          ].map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer select-none ${
                  isActive
                    ? 'text-blue-700 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="datePresetActive"
                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-2xs -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Selectors Row */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Project Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <FolderKanban className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            Project
          </label>
          <select
            value={filters.projectId || ''}
            onChange={(e) =>
              onFilterChange({ projectId: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) =>
              onFilterChange({ category: e.target.value ? e.target.value : undefined })
            }
            className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Technology Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            Technology
          </label>
          <select
            value={filters.technology || ''}
            onChange={(e) =>
              onFilterChange({ technology: e.target.value ? e.target.value : undefined })
            }
            className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">All Technologies</option>
            {technologies.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) =>
              onFilterChange({ status: e.target.value ? e.target.value : undefined })
            }
            className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Completed / Approved</option>
            <option value="PENDING">In Progress / Pending</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Team Member Selector (if Admin/Manager) or Reset Button */}
        <div>
          {isManagerOrAdmin && teamMembers.length > 0 ? (
            <>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                Team Member
              </label>
              <select
                value={filters.teamMemberId || ''}
                onChange={(e) =>
                  onFilterChange({ teamMemberId: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">My Personal Analytics ({userName})</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Reset</span>
              </label>
              <motion.button
                whileTap={hasActiveFilters ? { scale: 0.96 } : undefined}
                onClick={onResetFilters}
                disabled={!hasActiveFilters}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Active Drilldown Banner */}
      <AnimatePresence>
        {drilldownValue && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2 text-xs text-blue-900 dark:text-blue-200 shadow-2xs">
              <div className="flex items-center space-x-2">
                <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  Active Drilldown Filter:{' '}
                  <strong className="font-semibold text-blue-700 dark:text-blue-400">
                    {drilldownKey}: {drilldownValue}
                  </strong>
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onClearDrilldown}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-md border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                Clear Drilldown
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
