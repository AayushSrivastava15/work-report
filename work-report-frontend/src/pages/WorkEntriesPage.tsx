import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { workEntryApi } from '../api/workEntryApi';
import { projectApi } from '../api/projectApi';
import type { ProjectResponse, WorkEntryRequest, WorkEntryResponse } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { WorkEntryDetailsModal } from '../components/work-entries/WorkEntryDetailsModal';
import {
  Plus,
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  Calendar,
  RotateCcw,
  Eye,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileEdit,
  Check,
  FolderKanban
} from 'lucide-react';

import { useAuth } from '../auth/AuthContext';

const CATEGORIES = ['Development', 'Bug Fix', 'Testing', 'Documentation', 'Code Review', 'DevOps', 'Research'];

type StatusTab = 'ALL' | 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export const WorkEntriesPage: React.FC = () => {
  const { currentUserId } = useUser();
  const { currentUser, isManager, isAdmin, effectivePermissions } = useAuth();
  const { showSuccess, showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [entries, setEntries] = useState<WorkEntryResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Scope selection: 'MY' or 'TEAM'
  const [viewScope, setViewScope] = useState<'MY' | 'TEAM'>('MY');

  // Status Tab selection
  const [activeTab, setActiveTab] = useState<StatusTab>('ALL');

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Mode state: 'all' | 'search' | 'filter'
  const [mode, setMode] = useState<'all' | 'search' | 'filter'>('all');

  // Search & Filter state
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterProjectId, setFilterProjectId] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterTechnology, setFilterTechnology] = useState<string>('');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntryResponse | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<WorkEntryResponse | null>(null);
  const [selectedEntryForDetails, setSelectedEntryForDetails] = useState<WorkEntryResponse | null>(null);

  // Workflow Action Modals
  const [submittingEntry, setSubmittingEntry] = useState<WorkEntryResponse | null>(null);
  const [withdrawingEntry, setWithdrawingEntry] = useState<WorkEntryResponse | null>(null);
  const [approvingEntry, setApprovingEntry] = useState<WorkEntryResponse | null>(null);
  const [rejectingEntry, setRejectingEntry] = useState<WorkEntryResponse | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  // Form States
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [formData, setFormData] = useState<WorkEntryRequest>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    category: 'Development',
    technology: '',
    status: 'DRAFT',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState(false);

  // Load Projects (for dropdowns)
  const fetchProjects = async () => {
    if (!currentUserId) return;
    try {
      const projs = await projectApi.getProjectsByUser(currentUserId, 0, 100);
      setProjects(projs.content);
    } catch {
      // Ignored
    }
  };

  const fetchEntries = async (
    targetPage = page,
    targetSize = size,
    targetTab = activeTab,
    targetMode = mode,
    keyword = searchKeyword,
    targetScope = viewScope
  ) => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      setError(null);

      let data;
      if (targetScope === 'TEAM') {
        const teamId = currentUser?.teamId || effectivePermissions?.managedTeamId;
        if (teamId) {
          data = await workEntryApi.getWorkEntriesByTeam(
            teamId,
            targetTab !== 'ALL' ? targetTab : undefined,
            targetPage,
            targetSize
          );
        } else {
          data = { content: [], page: 0, size: targetSize, totalPages: 0, totalElements: 0, first: true, last: true };
        }
      } else if (targetTab !== 'ALL') {
        data = await workEntryApi.filterByStatus(targetTab, targetPage, targetSize);
      } else if (targetMode === 'search' && keyword.trim()) {
        data = await workEntryApi.searchWorkEntries(keyword.trim(), targetPage, targetSize);
      } else if (targetMode === 'filter') {
        if (filterStartDate && filterEndDate && filterProjectId) {
          data = await workEntryApi.filterByUserAndProjectAndDateRange(
            currentUserId,
            Number(filterProjectId),
            filterStartDate,
            filterEndDate,
            targetPage,
            targetSize
          );
        } else if (filterStartDate && filterEndDate) {
          data = await workEntryApi.filterByUserAndDateRange(
            currentUserId,
            filterStartDate,
            filterEndDate,
            targetPage,
            targetSize
          );
        } else if (filterCategory) {
          data = await workEntryApi.filterByCategory(filterCategory, targetPage, targetSize);
        } else if (filterTechnology) {
          data = await workEntryApi.filterByTechnology(filterTechnology, targetPage, targetSize);
        } else {
          data = await workEntryApi.getWorkEntriesByUser(currentUserId, targetPage, targetSize);
        }
      } else {
        data = await workEntryApi.getWorkEntriesByUser(currentUserId, targetPage, targetSize);
      }

      setEntries(data.content);
      setPage(data.page);
      setSize(data.size);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.message || 'Failed to load work entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentUserId]);

  useEffect(() => {
    fetchEntries(page, size, activeTab, mode, searchKeyword, viewScope);
  }, [currentUserId, page, size, activeTab, viewScope]);

  // Handle URL query triggers: ?new=1, ?projectId=..., ?edit=..., ?status=...
  useEffect(() => {
    const isNew = searchParams.get('new') === '1' || searchParams.get('new') === 'true';
    const projId = searchParams.get('projectId');
    const editId = searchParams.get('edit');
    const statusParam = searchParams.get('status');

    if (isNew) {
      handleOpenCreate(projId ? Number(projId) : undefined);
      setSearchParams({}, { replace: true });
    } else if (editId) {
      workEntryApi.getWorkEntryById(Number(editId)).then((entry) => {
        handleOpenEdit(entry);
      }).catch(() => {});
      setSearchParams({}, { replace: true });
    } else if (statusParam) {
      const upper = statusParam.toUpperCase();
      if (['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'].includes(upper)) {
        setActiveTab(upper as StatusTab);
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, projects]);

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    setPage(0);
    setSearchKeyword('');
    setMode('all');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchEntries(newPage, size, activeTab, mode, searchKeyword);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
    fetchEntries(0, newSize, activeTab, mode, searchKeyword);
  };

  // ── SEARCH & FILTER HANDLERS ───────────────────────────────────────────────
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      handleResetFilters();
      return;
    }
    setActiveTab('ALL');
    setMode('search');
    setPage(0);
    fetchEntries(0, size, 'ALL', 'search', searchKeyword);
  };

  const handleApplyFilters = () => {
    setShowFilterDrawer(false);
    setActiveTab('ALL');
    setMode('filter');
    setPage(0);
    fetchEntries(0, size, 'ALL', 'filter', searchKeyword);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterProjectId('');
    setFilterCategory('');
    setFilterTechnology('');
    setMode('all');
    setPage(0);
    fetchEntries(0, size, activeTab, 'all', '');
  };

  const validateForm = (isNew: boolean): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.date.trim()) errors.date = 'Date is required';
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.technology.trim()) errors.technology = 'Technology is required';

    if (isNew && !selectedProjectId) {
      errors.projectId = 'Project selection is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── CREATE / EDIT / DELETE ──────────────────────────────────────────────────
  const handleOpenCreate = (preselectedProjectId?: number) => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      category: 'Development',
      technology: '',
      status: 'DRAFT',
    });
    setSelectedProjectId(preselectedProjectId || projects[0]?.id || '');
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    if (formData.title.trim() || formData.description.trim() || formData.technology.trim()) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    setIsCreateOpen(false);
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

  const handleCloseEdit = () => {
    if (
      editingEntry &&
      (formData.title !== editingEntry.title ||
        formData.description !== editingEntry.description ||
        formData.technology !== editingEntry.technology ||
        formData.category !== editingEntry.category ||
        formData.date !== editingEntry.date)
    ) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    setEditingEntry(null);
  };

  const handleSaveEntry = async (statusTarget: 'DRAFT' | 'PENDING' | 'APPROVED') => {
    if (!validateForm(true)) return;

    try {
      setActionLoading(true);
      const payload: WorkEntryRequest = {
        ...formData,
        status: statusTarget,
      };

      const created = await workEntryApi.createWorkEntry(
        currentUserId,
        Number(selectedProjectId),
        payload
      );

      if (statusTarget === 'APPROVED') {
        showSuccess(isIndividual ? `Work entry "${created.title}" marked as completed!` : `Work report "${created.title}" approved!`);
      } else if (statusTarget === 'PENDING') {
        showSuccess(isIndividual ? `Work entry "${created.title}" saved as in progress!` : `Work report "${created.title}" submitted for review!`);
      } else {
        showSuccess(`Draft "${created.title}" saved successfully!`);
      }

      setIsCreateOpen(false);
      fetchEntries(0, size, activeTab, mode, searchKeyword);
    } catch (err: any) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setFormErrors(err.fieldErrors);
      } else {
        const msg = err.message || 'Failed to save work entry';
        setFormErrors({ form: msg });
        showError(msg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEntry = async (statusTarget?: 'DRAFT' | 'PENDING' | 'APPROVED') => {
    if (!editingEntry || !validateForm(false)) return;

    try {
      setActionLoading(true);
      const isRejected = (editingEntry.status || '').toUpperCase() === 'REJECTED';

      let updated: WorkEntryResponse;
      if (isRejected && statusTarget === 'PENDING') {
        updated = await workEntryApi.resubmit(editingEntry.id, formData);
        showSuccess(`Work report "${updated.title}" resubmitted for review!`);
      } else {
        const payload: WorkEntryRequest = {
          ...formData,
          status: statusTarget || formData.status,
        };
        updated = await workEntryApi.updateWorkEntry(editingEntry.id, payload);
        if (statusTarget === 'APPROVED') {
          showSuccess(isIndividual ? `Work entry "${updated.title}" marked as completed!` : `Work report "${updated.title}" approved!`);
        } else {
          showSuccess(`Work entry "${updated.title}" updated successfully!`);
        }
      }

      setEditingEntry(null);
      fetchEntries(page, size, activeTab, mode, searchKeyword);
    } catch (err: any) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setFormErrors(err.fieldErrors);
      } else {
        const msg = err.message || 'Failed to update work entry';
        setFormErrors({ form: msg });
        showError(msg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEntry) return;

    try {
      setActionLoading(true);
      await workEntryApi.deleteWorkEntry(deletingEntry.id);
      showSuccess(`Work entry "${deletingEntry.title}" deleted.`);
      setDeletingEntry(null);

      const newPage = entries.length === 1 && page > 0 ? page - 1 : page;
      fetchEntries(newPage, size, activeTab, mode, searchKeyword);
    } catch (err: any) {
      const msg = err.message || 'Failed to delete work entry';
      setError(msg);
      showError(msg);
      setDeletingEntry(null);
    } finally {
      setActionLoading(false);
    }
  };

  // ── LIFECYCLE WORKFLOW HANDLERS ───────────────────────────────────────────

  const handleSubmitConfirm = async () => {
    if (!submittingEntry) return;
    try {
      setActionLoading(true);
      await workEntryApi.submit(submittingEntry.id);
      showSuccess(`Report "${submittingEntry.title}" submitted for review.`);
      setSubmittingEntry(null);
      fetchEntries(page, size, activeTab, mode, searchKeyword);
    } catch (err: any) {
      showError(err.message || 'Failed to submit report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawConfirm = async () => {
    if (!withdrawingEntry) return;
    try {
      setActionLoading(true);
      await workEntryApi.withdraw(withdrawingEntry.id);
      showSuccess(`Report "${withdrawingEntry.title}" withdrawn to draft.`);
      setWithdrawingEntry(null);
      fetchEntries(page, size, activeTab, mode, searchKeyword);
    } catch (err: any) {
      showError(err.message || 'Failed to withdraw report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveConfirm = async () => {
    if (!approvingEntry) return;
    if (approvingEntry.userId === currentUserId) {
      showError('Anti-Self-Approval: You cannot approve your own work report.', 'Access Denied');
      setApprovingEntry(null);
      return;
    }
    try {
      setActionLoading(true);
      await workEntryApi.approve(approvingEntry.id);
      showSuccess(`Report "${approvingEntry.title}" approved.`);
      setApprovingEntry(null);
      fetchEntries(page, size, activeTab, mode, searchKeyword, viewScope);
    } catch (err: any) {
      showError(err.message || 'Failed to approve report.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingEntry) return;
    if (rejectingEntry.userId === currentUserId) {
      showError('Anti-Self-Approval: You cannot review your own work report.', 'Access Denied');
      setRejectingEntry(null);
      return;
    }
    try {
      setActionLoading(true);
      await workEntryApi.reject(rejectingEntry.id, rejectionReasonInput.trim());
      showSuccess(`Report "${rejectingEntry.title}" rejected with feedback.`);
      setRejectingEntry(null);
      setRejectionReasonInput('');
      fetchEntries(page, size, activeTab, mode, searchKeyword, viewScope);
    } catch (err: any) {
      showError(err.message || 'Failed to reject report.');
    } finally {
      setActionLoading(false);
    }
  };

  const isIndividual = currentUser?.organizationType === 'INDIVIDUAL';

  const getStatusBadge = (status: string) => {
    const upper = (status || 'DRAFT').toUpperCase();
    switch (upper) {
      case 'APPROVED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {isIndividual ? 'Completed' : 'Approved'}
          </span>
        );
      case 'PENDING':
      case 'SUBMITTED':
      case 'IN PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            {isIndividual ? 'In Progress' : 'Pending Review'}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <FileEdit className="w-3 h-3 mr-1" />
            Draft
          </span>
        );
    }
  };

  const hasActiveFilters =
    mode !== 'all' ||
    !!searchKeyword.trim() ||
    !!filterStartDate ||
    !!filterEndDate ||
    !!filterProjectId ||
    !!filterCategory ||
    !!filterTechnology;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Work Reports & Entries
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isIndividual
              ? 'Track daily work, log deliverables, and manage your projects.'
              : `Track daily tasks, submit reports for review, and inspect approval lifecycle for `}
            {!isIndividual && (
              <span className="font-semibold text-slate-700">{currentUser?.name || 'User'}</span>
            )}
          </p>
        </div>

        <button
          onClick={() => handleOpenCreate()}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Work Report
        </button>
      </div>

      {/* SCOPE TOGGLE (For Corporate Managers & Admins only) */}
      {!isIndividual && (isAdmin || isManager) && (
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl max-w-fit">
          <button
            onClick={() => setViewScope('MY')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewScope === 'MY'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Work Entries
          </button>
          <button
            onClick={() => setViewScope('TEAM')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewScope === 'TEAM'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <span>Team Review Submissions</span>
            {currentUser?.teamName && (
              <span className="px-1.5 py-0.5 bg-indigo-800 text-[10px] text-white rounded">
                {currentUser.teamName}
              </span>
            )}
          </button>
        </div>
      )}

      {/* STATUS LIFECYCLE TABS */}
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => handleTabChange('ALL')}
          className={`flex items-center px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-white text-blue-600 border-t-2 border-l border-r border-t-blue-600 border-l-slate-200 border-r-slate-200 -mb-px'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5 mr-1.5" />
          {isIndividual ? 'All Tasks & Work' : 'All Reports'}
        </button>

        <button
          onClick={() => handleTabChange('DRAFT')}
          className={`flex items-center px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'DRAFT'
              ? 'bg-white text-slate-900 border-t-2 border-l border-r border-t-slate-600 border-l-slate-200 border-r-slate-200 -mb-px'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileEdit className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
          {isIndividual ? 'Drafts' : 'My Drafts'}
        </button>

        <button
          onClick={() => handleTabChange('PENDING')}
          className={`flex items-center px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'PENDING'
              ? 'bg-white text-amber-700 border-t-2 border-l border-r border-t-amber-600 border-l-slate-200 border-r-slate-200 -mb-px'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
          {isIndividual ? 'In Progress' : 'Pending Review'}
        </button>

        <button
          onClick={() => handleTabChange('APPROVED')}
          className={`flex items-center px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'APPROVED'
              ? 'bg-white text-emerald-700 border-t-2 border-l border-r border-t-emerald-600 border-l-slate-200 border-r-slate-200 -mb-px'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
          {isIndividual ? 'Completed' : 'Approved'}
        </button>

        {!isIndividual && (
          <button
            onClick={() => handleTabChange('REJECTED')}
            className={`flex items-center px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'REJECTED'
                ? 'bg-white text-rose-700 border-t-2 border-l border-r border-t-rose-600 border-l-slate-200 border-r-slate-200 -mb-px'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
            Rejected Feedback
          </button>
        )}
      </div>

      {/* SEARCH AND FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports by keyword..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-20 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Trigger Button */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
              showFilterDrawer || hasActiveFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-1.5 text-slate-500" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600 ml-2" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
              Advanced Filter Options
            </h4>
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Start */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Project</label>
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
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Category</label>
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
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <ErrorAlert
          message={error}
          onRetry={() => fetchEntries(page, size, activeTab, mode, searchKeyword)}
        />
      )}

      {/* Loading / Empty / Table State */}
      {loading ? (
        <LoadingSpinner message="Loading work entries..." className="py-20" />
      ) : entries.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'DRAFT'
              ? 'No Draft Reports'
              : activeTab === 'PENDING'
              ? 'No Reports Pending Review'
              : activeTab === 'APPROVED'
              ? 'No Approved Reports Yet'
              : activeTab === 'REJECTED'
              ? 'No Rejected Reports'
              : 'No Work Entries Found'
          }
          description={
            activeTab === 'DRAFT'
              ? 'You do not have any saved working drafts. Click "Create Work Report" to begin a draft.'
              : activeTab === 'PENDING'
              ? 'You do not have any work reports currently awaiting manager review.'
              : activeTab === 'APPROVED'
              ? 'Submitted reports will appear here once approved by your manager or administrator.'
              : activeTab === 'REJECTED'
              ? 'Great news! None of your submitted work reports have been returned for correction.'
              : hasActiveFilters
              ? 'No reports match your filters. Try clearing search keywords or date criteria.'
              : 'No work entries recorded yet. Click "Create Work Report" to get started.'
          }
          actionLabel={projects.length > 0 ? '+ Create Work Report' : undefined}
          onAction={projects.length > 0 ? () => handleOpenCreate() : undefined}
        />
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Report Title & Summary</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Technology</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => {
                  const upperStatus = (entry.status || 'DRAFT').toUpperCase();
                  const isDraft = upperStatus === 'DRAFT';
                  const isPending = upperStatus === 'PENDING' || upperStatus === 'SUBMITTED';
                  const isApproved = upperStatus === 'APPROVED' || upperStatus === 'COMPLETED';
                  const isRejected = upperStatus === 'REJECTED';

                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedEntryForDetails(entry)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
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
                        <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {entry.title}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {entry.description}
                        </div>
                        {isRejected && entry.rejectionReason && (
                          <div className="mt-1.5 text-xs text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200">
                            <strong>Feedback:</strong> {entry.rejectionReason}
                          </div>
                        )}
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
                          {entry.technology || 'N/A'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(entry.status)}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-5 py-4 whitespace-nowrap text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* SOLO FREELANCER ACTIONS */}
                        {isIndividual && (
                          <>
                            {/* Mark Completed (if Draft or In Progress) */}
                            {(isDraft || isPending) && (
                              <button
                                onClick={() => setApprovingEntry(entry)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                                title="Mark as Completed"
                              >
                                <Check className="w-4 h-4 text-emerald-600" />
                              </button>
                            )}

                            {/* Reopen as Draft (if In Progress or Completed) */}
                            {(isPending || isApproved) && (
                              <button
                                onClick={() => setWithdrawingEntry(entry)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                                title="Reopen as Draft"
                              >
                                <RotateCcw className="w-4 h-4 text-amber-600" />
                              </button>
                            )}

                            {/* Edit Entry */}
                            <button
                              onClick={() => handleOpenEdit(entry)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              title="Edit Entry"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete Entry */}
                            <button
                              onClick={() => setDeletingEntry(entry)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* CORPORATE / COMPANY WORKFLOW ACTIONS */}
                        {!isIndividual && (
                          <>
                            {/* Draft: Submit */}
                            {isDraft && (
                              <button
                                onClick={() => setSubmittingEntry(entry)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                title="Submit for Review"
                              >
                                <Send className="w-4 h-4 text-blue-600" />
                              </button>
                            )}

                            {/* Pending: Withdraw (Allowed for entry author) */}
                            {isPending && entry.userId === currentUserId && (
                              <button
                                onClick={() => setWithdrawingEntry(entry)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                                title="Withdraw to Draft"
                              >
                                <RotateCcw className="w-4 h-4 text-amber-600" />
                              </button>
                            )}

                            {/* Pending: Admin & Manager Approve / Reject */}
                            {isPending && (isAdmin || isManager) && (
                              <>
                                {entry.userId === currentUserId ? (
                                  <span
                                    title="Anti-Self-Approval: You cannot approve your own work report."
                                    className="inline-block p-1.5 text-slate-300 cursor-not-allowed"
                                  >
                                    <Check className="w-4 h-4 text-slate-300" />
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setApprovingEntry(entry)}
                                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                                      title="Approve Report"
                                    >
                                      <Check className="w-4 h-4 text-emerald-600" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setRejectingEntry(entry);
                                        setRejectionReasonInput('');
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                      title="Reject Report"
                                    >
                                      <X className="w-4 h-4 text-rose-600" />
                                    </button>
                                  </>
                                )}
                              </>
                            )}

                            {/* Edit: Allowed on Draft, Rejected, or by Admin */}
                            {(isDraft || isRejected || isAdmin) && (
                              <button
                                onClick={() => handleOpenEdit(entry)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                title={isRejected ? 'Edit & Resubmit' : 'Edit Entry'}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete: Allowed on Draft or by Admin */}
                            {(isDraft || isAdmin) && !isApproved && (
                              <button
                                onClick={() => setDeletingEntry(entry)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                title="Delete Entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => setSelectedEntryForDetails(entry)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && !error && entries.length > 0 && (
            <div className="border-t border-slate-100 px-4">
              <Pagination
                page={page}
                size={size}
                totalElements={totalElements}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onSizeChange={handleSizeChange}
                disabled={loading}
              />
            </div>
          )}
        </div>
      )}

      {/* CREATE WORK REPORT MODAL */}
      <Modal isOpen={isCreateOpen} onClose={handleCloseCreate} title="Create Work Report">
        <div className="space-y-4">
          {formErrors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {formErrors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Report Date <span className="text-red-500">*</span>
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
                Project Assignment <span className="text-red-500">*</span>
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Report Title <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {formData.title.length}/100
              </span>
            </div>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g. Implemented OAuth token refresh and validation"
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Detailed Work Description <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {formData.description.length}/1000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="Provide a clear description of tasks completed, features delivered, and test coverage..."
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Technology / Tools <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder="e.g. Spring Boot, PostgreSQL"
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseCreate}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleSaveEntry('DRAFT')}
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5 inline mr-1.5 text-slate-500" />
                Save as Draft
              </button>
              {isIndividual ? (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleSaveEntry('PENDING')}
                    className="px-3.5 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 inline mr-1.5 text-amber-600" />
                    Save as In Progress
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleSaveEntry('APPROVED')}
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 inline mr-1.5" />
                    {actionLoading ? 'Saving...' : 'Mark as Completed'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleSaveEntry('PENDING')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 inline mr-1.5" />
                  {actionLoading ? 'Submitting...' : 'Submit for Review'}
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* EDIT / RESUBMIT WORK REPORT MODAL */}
      <Modal
        isOpen={!!editingEntry}
        onClose={handleCloseEdit}
        title={
          editingEntry?.status?.toUpperCase() === 'REJECTED'
            ? `Correction & Resubmission: ${editingEntry?.title || ''}`
            : `Edit Work Report: ${editingEntry?.title || ''}`
        }
      >
        <div className="space-y-4">
          {/* Rejection Alert Header if Rejected */}
          {editingEntry?.status?.toUpperCase() === 'REJECTED' && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Reviewer Feedback:</span>{' '}
                {editingEntry.rejectionReason || 'Please review and correct the details before resubmitting.'}
              </div>
            </div>
          )}

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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Title <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {formData.title.length}/100
              </span>
            </div>
            <input
              type="text"
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                formErrors.title ? 'border-red-400' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-300`}
            />
            {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Description <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {formData.description.length}/1000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                maxLength={50}
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
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseEdit}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateEntry()}
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                Save Changes
              </button>
              {isIndividual && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateEntry('APPROVED')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 inline mr-1.5" />
                  {actionLoading ? 'Saving...' : 'Save & Mark Completed'}
                </button>
              )}
              {!isIndividual && editingEntry?.status?.toUpperCase() === 'REJECTED' && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateEntry('PENDING')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 inline mr-1.5" />
                  {actionLoading ? 'Resubmitting...' : 'Resubmit for Review'}
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* SUBMIT CONFIRMATION MODAL */}
      <Modal
        isOpen={!!submittingEntry}
        onClose={() => setSubmittingEntry(null)}
        title={isIndividual ? "Complete Work Report" : "Submit Work Report for Review"}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {isIndividual ? (
              <>Are you sure you want to mark this work report as <strong className="text-emerald-700">Completed</strong>?</>
            ) : (
              <>
                Are you sure you want to submit this work report? After submission, it will be marked as{' '}
                <strong className="text-amber-700">Pending Review</strong> and sent to your administrator for verification.
              </>
            )}
          </p>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800">{submittingEntry?.title}</div>
            <div className="text-xs text-slate-500 mt-1">
              Project: {submittingEntry?.projectName || `#${submittingEntry?.projectId}`} &bull; Date: {submittingEntry?.date}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSubmittingEntry(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleSubmitConfirm}
              className={`px-4 py-2 text-sm font-semibold text-white ${
                isIndividual ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
              } rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer`}
            >
              {isIndividual ? (
                <>
                  <Check className="w-3.5 h-3.5 inline mr-1.5" />
                  {actionLoading ? 'Saving...' : 'Mark as Completed'}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 inline mr-1.5" />
                  {actionLoading ? 'Submitting...' : 'Confirm Submission'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* WITHDRAW CONFIRMATION MODAL */}
      <Modal
        isOpen={!!withdrawingEntry}
        onClose={() => setWithdrawingEntry(null)}
        title={isIndividual ? "Reopen as Draft" : "Withdraw Submission to Draft"}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {isIndividual
              ? "Reopen this entry as a Draft? You will be able to edit and update details."
              : "Are you sure you want to withdraw this report? It will be moved back to Draft status so you can edit and improve it."}
          </p>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800">{withdrawingEntry?.title}</div>
            <div className="text-xs text-slate-500 mt-1">
              Project: {withdrawingEntry?.projectName || `#${withdrawingEntry?.projectId}`} &bull; Date: {withdrawingEntry?.date}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWithdrawingEntry(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleWithdrawConfirm}
              className="px-4 py-2 text-sm font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" />
              {actionLoading ? 'Reopening...' : (isIndividual ? 'Reopen as Draft' : 'Withdraw to Draft')}
            </button>
          </div>
        </div>
      </Modal>

      {/* ADMIN APPROVE MODAL */}
      <Modal
        isOpen={!!approvingEntry}
        onClose={() => setApprovingEntry(null)}
        title={isIndividual ? "Mark Work as Completed" : "Approve Work Report"}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {isIndividual
              ? "Mark this work entry as Completed? You can reopen it as a draft or edit it anytime."
              : "Approve this submitted work report? Approved reports are locked and verified for official reports."}
          </p>
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="font-bold text-emerald-900">{approvingEntry?.title}</div>
            <div className="text-xs text-emerald-700 mt-1">
              Project: {approvingEntry?.projectName || `#${approvingEntry?.projectId}`} &bull; Date: {approvingEntry?.date}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setApprovingEntry(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleApproveConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 inline mr-1.5" />
              {actionLoading ? 'Saving...' : (isIndividual ? 'Mark as Completed' : 'Approve Report')}
            </button>
          </div>
        </div>
      </Modal>

      {/* ADMIN REJECT MODAL */}
      <Modal
        isOpen={!!rejectingEntry}
        onClose={() => setRejectingEntry(null)}
        title="Reject Work Report with Feedback"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Explain what needs correction before this work report can be accepted:
          </p>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800">{rejectingEntry?.title}</div>
            <div className="text-xs text-slate-500 mt-1">
              Project: {rejectingEntry?.projectName || `#${rejectingEntry?.projectId}`} &bull; Date: {rejectingEntry?.date}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Rejection Comments & Required Changes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Please clarify test coverage and specific endpoints delivered."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectingEntry(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleRejectConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 inline mr-1.5" />
              {actionLoading ? 'Rejecting...' : 'Reject Report'}
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        title="Delete Work Entry"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete this work entry?
          </p>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-800">{deletingEntry?.title}</div>
            <div className="text-xs text-slate-500 mt-1">
              Project: {deletingEntry?.projectName || `#${deletingEntry?.projectId}`} &bull; Date: {deletingEntry?.date}
            </div>
          </div>

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
              disabled={actionLoading}
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Deleting...' : 'Delete Entry'}
            </button>
          </div>
        </div>
      </Modal>

      {/* DETAILS VIEW MODAL */}
      <WorkEntryDetailsModal
        entry={selectedEntryForDetails}
        isOpen={!!selectedEntryForDetails}
        onClose={() => setSelectedEntryForDetails(null)}
        isAdmin={isAdmin}
        isManager={isManager}
        isIndividual={isIndividual}
        currentUserId={currentUserId}
        onEdit={(entry) => {
          setSelectedEntryForDetails(null);
          handleOpenEdit(entry);
        }}
        onDelete={(entry) => {
          setSelectedEntryForDetails(null);
          setDeletingEntry(entry);
        }}
        onSubmit={(entry) => {
          setSelectedEntryForDetails(null);
          setSubmittingEntry(entry);
        }}
        onWithdraw={(entry) => {
          setSelectedEntryForDetails(null);
          setWithdrawingEntry(entry);
        }}
        onApprove={(entry) => {
          setSelectedEntryForDetails(null);
          setApprovingEntry(entry);
        }}
        onReject={(entry) => {
          setSelectedEntryForDetails(null);
          setRejectingEntry(entry);
          setRejectionReasonInput('');
        }}
      />
    </div>
  );
};
