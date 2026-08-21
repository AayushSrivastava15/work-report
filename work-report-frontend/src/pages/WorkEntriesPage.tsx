import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { workEntryApi } from '../api/workEntryApi';
import { projectApi } from '../api/projectApi';
import type { ProjectResponse, WorkEntryRequest, WorkEntryResponse } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import {
  Plus,
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  Calendar,
  RotateCcw,
} from 'lucide-react';

const CATEGORIES = ['Development', 'Bug Fix', 'Testing', 'Documentation', 'Code Review', 'DevOps', 'Research'];
const STATUSES = ['Completed', 'In Progress', 'Pending', 'Blocked'];

export const WorkEntriesPage: React.FC = () => {
  const { currentUserId, currentUser } = useUser();

  const [entries, setEntries] = useState<WorkEntryResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterProjectId, setFilterProjectId] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterTechnology, setFilterTechnology] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);
  const [activeFilterSummary, setActiveFilterSummary] = useState<string | null>(null);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntryResponse | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<WorkEntryResponse | null>(null);

  // Form States
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [formData, setFormData] = useState<WorkEntryRequest>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    category: 'Development',
    technology: '',
    status: 'Completed',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load Projects and Entries
  const fetchInitialData = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      setError(null);
      const [projs, entriesData] = await Promise.all([
        projectApi.getProjectsByUser(currentUserId),
        workEntryApi.getWorkEntriesByUser(currentUserId),
      ]);
      setProjects(projs);
      setEntries(entriesData);
      setActiveFilterSummary(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load work entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [currentUserId]);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // ── SEARCH HANDLER ──────────────────────────────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      fetchInitialData();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const results = await workEntryApi.searchWorkEntries(searchKeyword.trim());
      setEntries(results);
      setActiveFilterSummary(`Search keyword: "${searchKeyword.trim()}"`);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    fetchInitialData();
  };

  // ── FILTER HANDLER ──────────────────────────────────────────────────────────
  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      let results: WorkEntryResponse[] = [];
      const summaries: string[] = [];

      // Determine which Phase 4 endpoint to call based on selected criteria
      if (filterStartDate && filterEndDate && filterProjectId) {
        // User + Project + Date range
        results = await workEntryApi.filterByUserAndProjectAndDateRange(
          currentUserId,
          Number(filterProjectId),
          filterStartDate,
          filterEndDate
        );
        const pName = projects.find((p) => p.id === Number(filterProjectId))?.name || 'Project';
        summaries.push(`Project: ${pName}`, `Date: ${filterStartDate} to ${filterEndDate}`);
      } else if (filterStartDate && filterEndDate) {
        // User + Date range
        results = await workEntryApi.filterByUserAndDateRange(
          currentUserId,
          filterStartDate,
          filterEndDate
        );
        summaries.push(`Date: ${filterStartDate} to ${filterEndDate}`);
      } else if (filterCategory) {
        // Category filter
        results = await workEntryApi.filterByCategory(filterCategory);
        summaries.push(`Category: ${filterCategory}`);
      } else if (filterTechnology) {
        // Technology filter
        results = await workEntryApi.filterByTechnology(filterTechnology);
        summaries.push(`Technology: ${filterTechnology}`);
      } else if (filterStatus) {
        // Status filter
        results = await workEntryApi.filterByStatus(filterStatus);
        summaries.push(`Status: ${filterStatus}`);
      } else {
        // No specific filter, load user's entries
        results = await workEntryApi.getWorkEntriesByUser(currentUserId);
      }

      setEntries(results);
      setActiveFilterSummary(summaries.length > 0 ? summaries.join(' | ') : null);
      setShowFilterDrawer(false);
    } catch (err: any) {
      setError(err.message || 'Filtering failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterProjectId('');
    setFilterCategory('');
    setFilterTechnology('');
    setFilterStatus('');
    fetchInitialData();
  };

  // ── FORM VALIDATION ─────────────────────────────────────────────────────────
  const validateForm = (isCreating: boolean): boolean => {
    const errors: Record<string, string> = {};
    if (isCreating && !selectedProjectId) {
      errors.projectId = 'Please select a project';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }
    if (!formData.technology.trim()) {
      errors.technology = 'Technology is required';
    }
    if (!formData.status.trim()) {
      errors.status = 'Status is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── CREATE / EDIT / DELETE ──────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      category: 'Development',
      technology: '',
      status: 'Completed',
    });
    setSelectedProjectId(projects[0]?.id || '');
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (entry: WorkEntryResponse) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      title: entry.title,
      description: entry.description,
      category: entry.category,
      technology: entry.technology,
      status: entry.status,
    });
    setFormErrors({});
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    try {
      setSubmitting(true);
      const created = await workEntryApi.createWorkEntry(
        currentUserId,
        Number(selectedProjectId),
        formData
      );
      setEntries((prev) => [created, ...prev]);
      setIsCreateOpen(false);
    } catch (err: any) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setFormErrors(err.fieldErrors);
      } else {
        setFormErrors({ form: err.message || 'Failed to create work entry' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !validateForm(false)) return;

    try {
      setSubmitting(true);
      const updated = await workEntryApi.updateWorkEntry(editingEntry.id, formData);
      setEntries((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditingEntry(null);
      showNotification(`Work entry "${updated.title}" updated successfully!`);
    } catch (err: any) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setFormErrors(err.fieldErrors);
      } else {
        setFormErrors({ form: err.message || 'Failed to update work entry' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEntry) return;

    try {
      setSubmitting(true);
      await workEntryApi.deleteWorkEntry(deletingEntry.id);
      setEntries((prev) => prev.filter((item) => item.id !== deletingEntry.id));
      showNotification(`Work entry "${deletingEntry.title}" deleted.`);
      setDeletingEntry(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete work entry');
      setDeletingEntry(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Work Entries
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Recorded daily work entries for{' '}
            <span className="font-semibold text-slate-700">{currentUser?.name}</span>
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          disabled={projects.length === 0}
          title={projects.length === 0 ? 'Create a project first before recording work' : ''}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Work Entry
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm font-medium shadow-xs">
          {successMessage}
        </div>
      )}

      {/* Warning if no projects exist */}
      {projects.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex items-center justify-between">
          <span>⚠️ You don't have any projects yet. Please create a project before adding work entries.</span>
          <button
            onClick={() => (window.location.href = '/projects')}
            className="text-xs font-bold text-amber-900 underline hover:no-underline ml-4"
          >
            Go to Projects
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Box */}
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, description, category, technology..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-20 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-12 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Trigger Button */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
              showFilterDrawer || activeFilterSummary
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-1.5 text-slate-500" />
            Filters
            {activeFilterSummary && (
              <span className="w-2 h-2 rounded-full bg-blue-600 ml-2" />
            )}
          </button>

          {activeFilterSummary && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Drawer / Panel */}
      {showFilterDrawer && (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Filter Options (Phase 4 APIs)
            </h4>
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range Start */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
              <select
                value={filterProjectId}
                onChange={(e) => setFilterProjectId(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Technology</label>
              <input
                type="text"
                placeholder="e.g. Spring Boot"
                value={filterTechnology}
                onChange={(e) => setFilterTechnology(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Pill */}
      {activeFilterSummary && (
        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-blue-50/60 border border-blue-200 px-3.5 py-2 rounded-lg">
          <span className="font-semibold text-blue-800">Active Filter:</span>
          <span>{activeFilterSummary}</span>
          <button
            onClick={handleResetFilters}
            className="ml-auto text-blue-700 hover:text-blue-900 font-bold"
          >
            Clear
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onRetry={fetchInitialData} />}

      {/* Loading state */}
      {loading ? (
        <LoadingSpinner message="Loading work entries..." className="py-20" />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No Work Entries Found"
          description={
            activeFilterSummary || searchKeyword
              ? 'No entries match your search or filter criteria. Try adjusting or clearing filters.'
              : 'You have not recorded any work entries yet. Click "Add Work Entry" to start recording your progress.'
          }
          actionLabel={projects.length > 0 ? '+ Add Work Entry' : undefined}
          onAction={projects.length > 0 ? handleOpenCreate : undefined}
        />
      ) : (
        /* Work Entries Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Title & Description</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Technology</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Date */}
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-slate-800">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{entry.date}</span>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-semibold text-blue-600">
                        {entry.projectName || `Project #${entry.projectId}`}
                      </span>
                    </td>

                    {/* Title & Description */}
                    <td className="px-5 py-4 max-w-sm">
                      <div className="font-bold text-slate-800">{entry.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {entry.description}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {entry.category}
                      </span>
                    </td>

                    {/* Technology */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                        {entry.technology}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          entry.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : entry.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(entry)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        title="Edit Entry"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingEntry(entry)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE WORK ENTRY MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Record Work Entry">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formErrors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {formErrors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  formErrors.date ? 'border-red-400' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-300`}
              />
              {formErrors.date && <p className="text-xs text-red-500 mt-1">{formErrors.date}</p>}
            </div>

            {/* Project Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  formErrors.projectId ? 'border-red-400' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-300`}
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {formErrors.projectId && (
                <p className="text-xs text-red-500 mt-1">{formErrors.projectId}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Implemented JWT authentication filter"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                formErrors.title ? 'border-red-400' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-300`}
            />
            {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description of the completed tasks and testing..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                formErrors.description ? 'border-red-400' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-300`}
            />
            {formErrors.description && (
              <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Technology */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Technology <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Spring Boot, React"
                value={formData.technology}
                onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  formErrors.technology ? 'border-red-400' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-300`}
              />
              {formErrors.technology && (
                <p className="text-xs text-red-500 mt-1">{formErrors.technology}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Work Entry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT WORK ENTRY MODAL */}
      <Modal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        title={`Edit Work Entry: ${editingEntry?.title || ''}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formErrors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {formErrors.form}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                formErrors.date ? 'border-red-400' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-300`}
            />
            {formErrors.date && <p className="text-xs text-red-500 mt-1">{formErrors.date}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                formErrors.title ? 'border-red-400' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-300`}
            />
            {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                formErrors.description ? 'border-red-400' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-300`}
            />
            {formErrors.description && (
              <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Technology <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.technology}
                onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  formErrors.technology ? 'border-red-400' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-300`}
              />
              {formErrors.technology && (
                <p className="text-xs text-red-500 mt-1">{formErrors.technology}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingEntry(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        title="Confirm Delete Work Entry"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete work entry{' '}
            <span className="font-bold text-slate-800">"{deletingEntry?.title}"</span>?
          </p>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeletingEntry(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Deleting...' : 'Yes, Delete Entry'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
