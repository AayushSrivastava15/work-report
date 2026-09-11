import React, { useState } from 'react';
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
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  Plus,
  FileEdit,
  Clock,
  ExternalLink,
  Loader2,
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
  draftCount?: number;
  pendingCount?: number;
  onCreateReport?: () => void;
  onNavigateDrafts?: () => void;
  onNavigatePending?: () => void;
  onNavigateReports?: () => void;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
  onExportDocx?: () => void;
  onExportCsv?: () => void;
  isExporting?: boolean;
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
  isManagerOrAdmin = false,
  draftCount = 0,
  pendingCount = 0,
  onCreateReport,
  onNavigateDrafts,
  onNavigatePending,
  onNavigateReports,
  onExportPdf,
  onExportExcel,
  onExportDocx,
  onExportCsv,
  isExporting = false,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  // Count active non-date filters
  const activeFilterCount = [
    Boolean(filters.projectId),
    Boolean(filters.category),
    Boolean(filters.technology),
    Boolean(filters.status),
    Boolean(filters.teamMemberId),
    Boolean(drilldownValue),
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0 || activePreset !== 'ALL';

  const selectedProjectName = projects.find((p) => p.id === filters.projectId)?.name;
  const selectedMemberName = teamMembers.find((m) => m.id === filters.teamMemberId)?.name;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-4 sm:p-5 space-y-3 transition-all">
      {/* ── Top Row: Header & Primary Shortcuts ────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3.5">
        {/* Left: Title & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Work Analytics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-velocity tracking, throughput analytics & report delivery
            </p>
          </div>
        </div>

        {/* Right: Actions, Date Presets, Filter Toggle & Download Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Presets Toolbar */}
          <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {[
              { id: '7D', label: '7D' },
              { id: '30D', label: '30D' },
              { id: '3M', label: '3M' },
              { id: 'YEAR', label: 'Year' },
              { id: 'ALL', label: 'All' },
            ].map((preset) => {
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  className={`relative px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer select-none ${
                    isActive
                      ? 'text-blue-700 dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={`Show data for ${preset.label}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="datePresetActiveCompact"
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-2xs -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Toggle Filter Panel Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Report Download Shortcuts Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Report download shortcuts"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              )}
              <span>Download Report</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-40 text-xs text-slate-700 dark:text-slate-200 animate-fadeIn"
                onClick={() => setShowExportMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                  Instant Report Downloads
                </div>

                <button
                  onClick={onExportPdf}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-500" />
                    <span>PDF Report</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400">
                    .pdf
                  </span>
                </button>

                <button
                  onClick={onExportExcel}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    <span>Excel Spreadsheet</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    .xlsx
                  </span>
                </button>

                <button
                  onClick={onExportDocx}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-blue-500" />
                    <span>Word Document</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    .docx
                  </span>
                </button>

                <button
                  onClick={onExportCsv}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-500" />
                    <span>Tabular CSV</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    .csv
                  </span>
                </button>

                {onNavigateReports && (
                  <>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <button
                      onClick={onNavigateReports}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between font-semibold text-blue-600 dark:text-blue-400 cursor-pointer"
                    >
                      <span>Custom Report Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick Action: Create Work Report */}
          {onCreateReport && (
            <button
              onClick={onCreateReport}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Report
            </button>
          )}

          {/* Quick Action: Drafts */}
          {onNavigateDrafts && draftCount > 0 && (
            <button
              onClick={onNavigateDrafts}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="View my drafts"
            >
              <FileEdit className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Drafts ({draftCount})
            </button>
          )}

          {/* Quick Action: Pending */}
          {onNavigatePending && pendingCount > 0 && (
            <button
              onClick={onNavigatePending}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
              title="View pending reviews"
            >
              <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Pending ({pendingCount})
            </button>
          )}
        </div>
      </div>

      {/* ── Collapsible Modern Filter Tray ─────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 py-1">
              {/* Project Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <FolderKanban className="w-3 h-3 text-indigo-500" />
                  Project
                </label>
                <select
                  value={filters.projectId || ''}
                  onChange={(e) =>
                    onFilterChange({ projectId: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-emerald-500" />
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) =>
                    onFilterChange({ category: e.target.value ? e.target.value : undefined })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Technology Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-purple-500" />
                  Technology
                </label>
                <select
                  value={filters.technology || ''}
                  onChange={(e) =>
                    onFilterChange({ technology: e.target.value ? e.target.value : undefined })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="">All Technologies</option>
                  {technologies.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-amber-500" />
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) =>
                    onFilterChange({ status: e.target.value ? e.target.value : undefined })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="">All Statuses</option>
                  <option value="APPROVED">Completed / Approved</option>
                  <option value="PENDING">In Progress / Pending</option>
                  <option value="DRAFT">Draft</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Team Member or Reset */}
              <div>
                {isManagerOrAdmin && teamMembers.length > 0 ? (
                  <>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3 text-cyan-500" />
                      Team Member
                    </label>
                    <select
                      value={filters.teamMemberId || ''}
                      onChange={(e) =>
                        onFilterChange({
                          teamMemberId: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <option value="">My Analytics</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Actions
                    </label>
                    <button
                      onClick={onResetFilters}
                      disabled={!hasActiveFilters}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Filters
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Filter Chips (Clean, Dismissible Badges) ──────────────────── */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1">
            Active:
          </span>

          {/* Drilldown Pill */}
          {drilldownValue && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
              <span>{drilldownKey}: <strong>{drilldownValue}</strong></span>
              <button
                onClick={onClearDrilldown}
                className="hover:text-blue-900 dark:hover:text-blue-100 cursor-pointer ml-0.5"
                title="Remove drilldown"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Project Pill */}
          {filters.projectId && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
              <span>Project: <strong>{selectedProjectName || filters.projectId}</strong></span>
              <button
                onClick={() => onFilterChange({ projectId: undefined })}
                className="hover:text-indigo-900 dark:hover:text-indigo-100 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Category Pill */}
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <span>Category: <strong>{filters.category}</strong></span>
              <button
                onClick={() => onFilterChange({ category: undefined })}
                className="hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Technology Pill */}
          {filters.technology && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
              <span>Tech: <strong>{filters.technology}</strong></span>
              <button
                onClick={() => onFilterChange({ technology: undefined })}
                className="hover:text-purple-900 dark:hover:text-purple-100 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Status Pill */}
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs">
              <span>Status: <strong>{filters.status}</strong></span>
              <button
                onClick={() => onFilterChange({ status: undefined })}
                className="hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Team Member Pill */}
          {filters.teamMemberId && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shadow-2xs">
              <span>Member: <strong>{selectedMemberName || filters.teamMemberId}</strong></span>
              <button
                onClick={() => onFilterChange({ teamMemberId: undefined })}
                className="hover:text-cyan-900 dark:hover:text-cyan-100 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Clear All Reset */}
          <button
            onClick={onResetFilters}
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
