import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { projectApi } from '../api/projectApi';
import { reportApi } from '../api/reportApi';
import { downloadBlob } from '../utils/downloadHelper';
import type { ProjectResponse, ReportFilterParams, ReportPreviewResponse } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
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
} from 'lucide-react';

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

export const ReportsPage: React.FC = () => {
  const { currentUserId, currentUser } = useUser();

  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [report, setReport] = useState<ReportPreviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Load user projects on mount
  useEffect(() => {
    const init = async () => {
      if (!currentUserId) return;
      try {
        setInitialLoading(true);
        const userProjects = await projectApi.getProjectsByUser(currentUserId);
        setProjects(userProjects);

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
      const { blob, filename } = await reportApi.exportPdf(currentUserId, appliedFilters);
      downloadBlob(blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    } catch (err: any) {
      setError(err.message || 'Unable to export PDF report. Please try again.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    if (!currentUserId || !report || report.totalEntries === 0 || exportingDocx) return;
    try {
      setExportingDocx(true);
      setError(null);
      const { blob, filename } = await reportApi.exportDocx(currentUserId, appliedFilters);
      downloadBlob(blob, filename.endsWith('.docx') ? filename : `${filename}.docx`);
    } catch (err: any) {
      setError(err.message || 'Unable to export Word report. Please try again.');
    } finally {
      setExportingDocx(false);
    }
  };

  const handleExportExcel = async () => {
    if (!currentUserId || !report || report.totalEntries === 0 || exportingExcel) return;
    try {
      setExportingExcel(true);
      setError(null);
      const { blob, filename } = await reportApi.exportExcel(currentUserId, appliedFilters);
      downloadBlob(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
    } catch (err: any) {
      setError(err.message || 'Unable to export Excel report. Please try again.');
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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <FileBarChart className="w-7 h-7 text-blue-600" />
          Work Reports
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Generate, preview and export your personalized work report in PDF, Word, and Excel formats.
        </p>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onRetry={handleGeneratePreview} />}

      {/* 1. REPORT FILTERS CARD */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-slate-100">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-slate-800">Filter Criteria</h2>
        </div>

        <form onSubmit={handleGeneratePreview} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div>
              <label
                htmlFor="report-date-from"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Date From
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  id="report-date-from"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label
                htmlFor="report-date-to"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Date To
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  id="report-date-to"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                />
              </div>
            </div>

            {/* Project */}
            <div>
              <label
                htmlFor="report-project"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Project
              </label>
              <select
                id="report-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="report-category"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Category
              </label>
              <select
                id="report-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white cursor-pointer"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Technology */}
            <div>
              <label
                htmlFor="report-tech"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Technology
              </label>
              <input
                id="report-tech"
                type="text"
                placeholder="e.g. React, Spring Boot"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="report-status"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Status
              </label>
              <select
                id="report-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white cursor-pointer"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <div className="sm:col-span-2">
              <label
                htmlFor="report-keyword"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Keyword Search
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  id="report-keyword"
                  type="text"
                  placeholder="Search in title, description, category, technology..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 mr-1.5 text-slate-500" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Report For</div>
                <div className="text-sm font-bold text-slate-800 truncate">{report.userName || currentUser?.name}</div>
                <div className="text-xs text-slate-500 font-mono truncate">{report.userEmail || currentUser?.email}</div>
              </div>
            </div>

            {/* Total Work Entries */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Entries</div>
                <div className="text-xl font-bold text-slate-800">{report.totalEntries}</div>
              </div>
            </div>

            {/* Total Projects */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projects</div>
                <div className="text-xl font-bold text-slate-800">{report.totalProjects}</div>
              </div>
            </div>

            {/* Period */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date Period</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {report.startDate || 'Start'} &rarr; {report.endDate || 'End'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Preview Header & Export Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Report Preview
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact dataset that will be generated in all export formats
              </p>
            </div>

            {/* EXPORT BUTTONS */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* PDF Button */}
              <button
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
              </button>

              {/* Word (DOCX) Button */}
              <button
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
              </button>

              {/* Excel (XLSX) Button */}
              <button
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
              </button>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 whitespace-nowrap">Date</th>
                    <th className="px-5 py-3 whitespace-nowrap">Project</th>
                    <th className="px-5 py-3 whitespace-nowrap">Title</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3 whitespace-nowrap">Category</th>
                    <th className="px-5 py-3 whitespace-nowrap">Technology</th>
                    <th className="px-5 py-3 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report?.entries?.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-800">
                        {entry.date}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-blue-600">
                        {entry.projectName || '—'}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-xs truncate">
                        {entry.title}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-sm line-clamp-2 text-xs">
                        {entry.description || <span className="italic text-slate-400">No description</span>}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600">
                        {entry.technology || '—'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : entry.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700'
                              : entry.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
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
      </div>
    </div>
  );
};
