import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { projectApi } from '../api/projectApi';
import { reportApi } from '../api/reportApi';
import { downloadBlob } from '../utils/downloadHelper';
import type { ProjectResponse, ReportFilterParams, ReportPreviewResponse, WorkEntryResponse } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { Pagination } from '../components/common/Pagination';
import { WorkEntryDetailsModal } from '../components/work-entries/WorkEntryDetailsModal';
import {
  FileBarChart,
  Filter,
  RotateCcw,
  Calendar,
  FolderKanban,
  FileText,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  User,
  Loader2,
  Eye,
} from 'lucide-react';
import { motion } from 'motion/react';
import { staggerContainerVariants, cardItemVariants } from '../motion';
import { AnimatedNumber } from '../components/common/AnimatedNumber';

const CATEGORIES = [
  'Development',
  'Bug Fix',
  'Testing',
  'Documentation',
  'Code Review',
  'DevOps',
  'Research',
];

const STATUSES = ['Completed', 'In Progress', 'Pending', 'Blocked'];

const getCategoryBadgeClass = (category?: string): string => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('dev') || cat.includes('feature')) {
    return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  }
  if (cat.includes('bug') || cat.includes('fix')) {
    return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  }
  if (cat.includes('test') || cat.includes('qa')) {
    return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
  if (cat.includes('arch') || cat.includes('system') || cat.includes('design')) {
    return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
  }
  if (cat.includes('doc') || cat.includes('ui') || cat.includes('ux')) {
    return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
  }
  if (cat.includes('ops') || cat.includes('infra') || cat.includes('cloud')) {
    return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
  }
  if (cat.includes('review') || cat.includes('audit')) {
    return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
  }
  return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
};

const renderStatusBadge = (status?: string) => {
  const s = (status || '').toUpperCase();
  if (s === 'APPROVED' || s === 'COMPLETED') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
        {status}
      </span>
    );
  }
  if (s === 'PENDING' || s === 'SUBMITTED' || s === 'IN PROGRESS') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 shrink-0" />
        {status}
      </span>
    );
  }
  if (s === 'REJECTED' || s === 'BLOCKED') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 shrink-0" />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5 shrink-0" />
      {status || 'Draft'}
    </span>
  );
};

export const ReportsPage: React.FC = () => {
  const { currentUserId, currentUser } = useUser();
  const { showSuccess, showError, showInfo } = useToast();

  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [report, setReport] = useState<ReportPreviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter form state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [technology, setTechnology] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');

  // Active filters applied for current preview (and exports)
  const [appliedFilters, setAppliedFilters] = useState<ReportFilterParams>({});

  // Export loading states
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Selected entry for Details Modal
  const [selectedEntry, setSelectedEntry] = useState<WorkEntryResponse | null>(null);

  const totalEntries = report?.entries?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));

  const paginatedEntries = React.useMemo(() => {
    if (!report?.entries) return [];
    const start = page * pageSize;
    return report.entries.slice(start, start + pageSize);
  }, [report?.entries, page, pageSize]);

  // Load user projects on mount
  useEffect(() => {
    const init = async () => {
      if (!currentUserId) return;
      try {
        setInitialLoading(true);
        const userProjects = await projectApi.getProjectsByUser(currentUserId, 0, 100);
        setProjects(userProjects.content);

        // Fetch initial report preview (all entries)
        const initialReport = await reportApi.getReportPreview(currentUserId, {});
        setReport(initialReport);
        setAppliedFilters({});
      } catch (err: any) {
        setError(err.message || 'Failed to initialize reports.');
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, [currentUserId]);

  const handleGeneratePreview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUserId) return;

    // Date Validation
    if (startDate && endDate && startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }

    const filters: ReportFilterParams = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      projectId: projectId ? Number(projectId) : undefined,
      category: category || undefined,
      technology: technology.trim() || undefined,
      status: status || undefined,
      keyword: keyword.trim() || undefined,
    };

    try {
      setLoading(true);
      setError(null);
      const data = await reportApi.getReportPreview(currentUserId, filters);
      setReport(data);
      setAppliedFilters(filters);
      setPage(0);
    } catch (err: any) {
      setError(err.message || 'Unable to generate the report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = async () => {
    setStartDate('');
    setEndDate('');
    setProjectId('');
    setCategory('');
    setTechnology('');
    setStatus('');
    setKeyword('');
    setError(null);

    if (!currentUserId) return;
    try {
      setLoading(true);
      const data = await reportApi.getReportPreview(currentUserId, {});
      setReport(data);
      setAppliedFilters({});
      setPage(0);
    } catch (err: any) {
      setError(err.message || 'Failed to reset report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!currentUserId || !report || report.totalEntries === 0 || exportingPdf) return;
    try {
      setExportingPdf(true);
      setError(null);
      showInfo('Generating PDF work report...', 'Export Started');
      const { blob, filename } = await reportApi.exportPdf(currentUserId, appliedFilters);
      const finalName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      downloadBlob(blob, finalName);
      showSuccess(`Report downloaded: ${finalName}`, 'Export Complete');
    } catch (err: any) {
      const msg = err.message || 'Unable to export PDF report. Please try again.';
      setError(msg);
      showError(msg, 'Export Failed');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    if (!currentUserId || !report || report.totalEntries === 0 || exportingDocx) return;
    try {
      setExportingDocx(true);
      setError(null);
      showInfo('Generating Word (.docx) work report...', 'Export Started');
      const { blob, filename } = await reportApi.exportDocx(currentUserId, appliedFilters);
      const finalName = filename.endsWith('.docx') ? filename : `${filename}.docx`;
      downloadBlob(blob, finalName);
      showSuccess(`Report downloaded: ${finalName}`, 'Export Complete');
    } catch (err: any) {
      const msg = err.message || 'Unable to export Word report. Please try again.';
      setError(msg);
      showError(msg, 'Export Failed');
    } finally {
      setExportingDocx(false);
    }
  };

  const handleExportExcel = async () => {
    if (!currentUserId || !report || report.totalEntries === 0 || exportingExcel) return;
    try {
      setExportingExcel(true);
      setError(null);
      showInfo('Generating Excel (.xlsx) work report...', 'Export Started');
      const { blob, filename } = await reportApi.exportExcel(currentUserId, appliedFilters);
      const finalName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
      downloadBlob(blob, finalName);
      showSuccess(`Report downloaded: ${finalName}`, 'Export Complete');
    } catch (err: any) {
      const msg = err.message || 'Unable to export Excel report. Please try again.';
      setError(msg);
      showError(msg, 'Export Failed');
    } finally {
      setExportingExcel(false);
    }
  };

  const hasEntries = (report?.totalEntries || 0) > 0;
  const isAnyExporting = exportingPdf || exportingDocx || exportingExcel;

  if (initialLoading) {
    return <LoadingSpinner message="Loading work report preview..." className="py-24" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
          <FileBarChart className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          Work Reports
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Generate, preview and export your personalized work report in PDF, Word, and Excel formats.
        </p>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onRetry={handleGeneratePreview} />}

      {/* 1. REPORT FILTERS CARD */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
          <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Filter Criteria</h2>
        </div>

        <form onSubmit={handleGeneratePreview} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div>
              <label
                htmlFor="report-date-from"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Date From
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  id="report-date-from"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label
                htmlFor="report-date-to"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Date To
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  id="report-date-to"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Project */}
            <div>
              <label
                htmlFor="report-project"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Project
              </label>
              <select
                id="report-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="" className="dark:bg-slate-800">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-800">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="report-category"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Category
              </label>
              <select
                id="report-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="" className="dark:bg-slate-800">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="dark:bg-slate-800">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Technology */}
            <div>
              <label
                htmlFor="report-tech"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Technology
              </label>
              <input
                id="report-tech"
                type="text"
                placeholder="e.g. React, Spring Boot"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="report-status"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Status
              </label>
              <select
                id="report-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="" className="dark:bg-slate-800">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="dark:bg-slate-800">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <div className="sm:col-span-2">
              <label
                htmlFor="report-keyword"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Keyword Search
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  id="report-keyword"
                  type="text"
                  placeholder="Search in title, description, category, technology..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleClearFilters}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mr-1.5 text-slate-500 dark:text-slate-400" />
              Clear Filters
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Preview...
                </>
              ) : (
                <>
                  <FileBarChart className="w-4 h-4 mr-2" />
                  Generate Preview
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. REPORT PREVIEW SECTION */}
      <div className="space-y-4">
        {/* Report Summary Cards */}
        {report && (
          <motion.div
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* User */}
            <motion.div
              variants={cardItemVariants}
              whileHover={{ y: -1, transition: { duration: 0.15 } }}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-3.5"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Report For</div>
                <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{report.userName || currentUser?.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{report.userEmail || currentUser?.email}</div>
              </div>
            </motion.div>

            {/* Total Work Entries */}
            <motion.div
              variants={cardItemVariants}
              whileHover={{ y: -1, transition: { duration: 0.15 } }}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-3.5"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Entries</div>
                <div className="text-xl font-bold text-slate-800 dark:text-white">
                  <AnimatedNumber value={report.totalEntries} />
                </div>
              </div>
            </motion.div>

            {/* Total Projects */}
            <motion.div
              variants={cardItemVariants}
              whileHover={{ y: -1, transition: { duration: 0.15 } }}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-3.5"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Projects</div>
                <div className="text-xl font-bold text-slate-800 dark:text-white">
                  <AnimatedNumber value={report.totalProjects} />
                </div>
              </div>
            </motion.div>

            {/* Period */}
            <motion.div
              variants={cardItemVariants}
              whileHover={{ y: -1, transition: { duration: 0.15 } }}
              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-3.5"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date Period</div>
                <div className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">
                  {report.startDate || 'Start'} &rarr; {report.endDate || 'End'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Report Preview Header & Export Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800/60 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    Report Preview
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Exact dataset formatted for PDF, Word, and Excel exports
                </p>
              </div>
            </div>

            {/* EXPORT BUTTONS */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* PDF Button */}
              <motion.button
                whileTap={hasEntries && !isAnyExporting ? { scale: 0.94 } : undefined}
                type="button"
                onClick={handleExportPdf}
                disabled={!hasEntries || isAnyExporting}
                title={!hasEntries ? 'No data available to export' : 'Export report as PDF'}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {exportingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                )}
                {exportingPdf ? 'Exporting PDF...' : 'Export PDF'}
              </motion.button>

              {/* Word (DOCX) Button */}
              <motion.button
                whileTap={hasEntries && !isAnyExporting ? { scale: 0.94 } : undefined}
                type="button"
                onClick={handleExportDocx}
                disabled={!hasEntries || isAnyExporting}
                title={!hasEntries ? 'No data available to export' : 'Export report as Word (.docx)'}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {exportingDocx ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                )}
                {exportingDocx ? 'Exporting Word...' : 'Export Word (.docx)'}
              </motion.button>

              {/* Excel (XLSX) Button */}
              <motion.button
                whileTap={hasEntries && !isAnyExporting ? { scale: 0.94 } : undefined}
                type="button"
                onClick={handleExportExcel}
                disabled={!hasEntries || isAnyExporting}
                title={!hasEntries ? 'No data available to export' : 'Export report as Excel (.xlsx)'}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {exportingExcel ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                )}
                {exportingExcel ? 'Exporting Excel...' : 'Export Excel (.xlsx)'}
              </motion.button>
            </div>
          </div>

          {/* Table or Empty State */}
          {!hasEntries ? (
            <div className="p-8">
              <EmptyState
                title="No Work Entries Found"
                description="No work entries match your selected filter criteria. Adjust your filters or click Clear Filters to preview all entries."
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5 whitespace-nowrap">Date</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Project</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Work Title</th>
                      <th className="px-5 py-3.5 min-w-[240px]">Deliverables & Description</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Category</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Tech Stack</th>
                      <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                      <th className="px-5 py-3.5 whitespace-nowrap text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {paginatedEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className="hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer group"
                      >
                        {/* Date */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span>{entry.date}</span>
                          </div>
                        </td>

                        {/* Project */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/80 shadow-2xs">
                            <FolderKanban className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{entry.projectName || '—'}</span>
                          </span>
                        </td>

                        {/* Title */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 max-w-[200px]">
                            {entry.title}
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-5 py-4">
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed max-w-sm font-normal">
                            {entry.description || <span className="italic text-slate-400 dark:text-slate-500">No description provided</span>}
                          </p>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs ${getCategoryBadgeClass(entry.category)}`}>
                            {entry.category}
                          </span>
                        </td>

                        {/* Technology */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {entry.technology ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                              {entry.technology}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {renderStatusBadge(entry.status)}
                        </td>

                        {/* Action View */}
                        <td className="px-5 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedEntry(entry)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer shadow-2xs"
                            title="View full work entry details"
                            aria-label="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION FOOTER */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  Showing{' '}
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {totalEntries === 0 ? 0 : page * pageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {Math.min((page + 1) * pageSize, totalEntries)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-800 dark:text-white">{totalEntries}</span> work entries
                </div>

                <Pagination
                  page={page}
                  size={pageSize}
                  totalElements={totalEntries}
                  totalPages={totalPages}
                  onPageChange={(newPage) => setPage(newPage)}
                  onSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setPage(0);
                  }}
                  sizeOptions={[10, 20, 50, 100]}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details View Modal */}
      <WorkEntryDetailsModal
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
};
