import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectApi } from '../api/projectApi';
import { workEntryApi } from '../api/workEntryApi';
import type { ProjectRequest, ProjectResponse, WorkEntryRequest } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import {
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  FolderKanban,
  Calendar,
  FilePlus2,
  FileEdit,
  Clock,
  Check,
  Send,
} from 'lucide-react';
import { motion } from 'motion/react';
import { staggerContainerVariants, cardItemVariants } from '../motion';

const CATEGORIES = ['Development', 'Bug Fix', 'Testing', 'Documentation', 'Code Review', 'DevOps', 'Research'];

export const ProjectsPage: React.FC = () => {
  const { currentUserId } = useUser();
  const { currentUser, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const isIndividual = currentUser?.organizationType === 'INDIVIDUAL';

  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectResponse | null>(null);

  // Work Entry Modal State (Directly within Project Page)
  const [selectedProjectForWork, setSelectedProjectForWork] = useState<ProjectResponse | null>(null);
  const [workFormData, setWorkFormData] = useState<WorkEntryRequest>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    category: 'Development',
    technology: '',
    status: 'DRAFT',
  });
  const [workFormErrors, setWorkFormErrors] = useState<Record<string, string>>({});
  const [workSubmitting, setWorkSubmitting] = useState(false);

  // Form States for Project
  const [formData, setFormData] = useState<ProjectRequest>({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async (pageToFetch = page, sizeToFetch = size) => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await projectApi.getProjectsByUser(currentUserId, pageToFetch, sizeToFetch);
      setProjects(data.content);
      setPage(data.page);
      setSize(data.size);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(page, size);
  }, [currentUserId, page, size]);

  // Handle URL query trigger ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      handleOpenCreate();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
  };

  const validateForm = (): boolean => {
    const errors: { name?: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    if (formData.name.trim() || formData.description?.trim()) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    setIsCreateOpen(false);
  };

  const handleOpenEdit = (proj: ProjectResponse) => {
    setEditingProject(proj);
    setFormData({ name: proj.name, description: proj.description || '' });
    setFormErrors({});
  };

  const handleCloseEdit = () => {
    if (
      editingProject &&
      (formData.name !== editingProject.name ||
        formData.description !== (editingProject.description || ''))
    ) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    setEditingProject(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const created = await projectApi.createProject(currentUserId, formData);
      setIsCreateOpen(false);
      showSuccess(`Project "${created.name}" created successfully!`);
      fetchProjects(0, size);
    } catch (err: any) {
      const errorMsg = err.fieldErrors?.name || err.message || 'Failed to create project';
      setFormErrors({ name: errorMsg });
      showError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !validateForm()) return;

    try {
      setSubmitting(true);
      const updated = await projectApi.updateProject(editingProject.id, formData);
      setEditingProject(null);
      showSuccess(`Project "${updated.name}" updated successfully!`);
      fetchProjects(page, size);
    } catch (err: any) {
      const errorMsg = err.fieldErrors?.name || err.message || 'Failed to update project';
      setFormErrors({ name: errorMsg });
      showError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;

    try {
      setSubmitting(true);
      await projectApi.deleteProject(deletingProject.id);
      showSuccess(`Project "${deletingProject.name}" deleted successfully.`);
      setDeletingProject(null);
      const newPage = projects.length === 1 && page > 0 ? page - 1 : page;
      fetchProjects(newPage, size);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete project';
      setError(errorMsg);
      showError(errorMsg);
      setDeletingProject(null);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Work Entry Handlers (Within Project Page) ──────────────────────────────
  const handleOpenAddWork = (proj: ProjectResponse) => {
    setSelectedProjectForWork(proj);
    setWorkFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      category: 'Development',
      technology: '',
      status: 'DRAFT',
    });
    setWorkFormErrors({});
  };

  const handleCloseAddWork = () => {
    if (
      workFormData.title.trim() ||
      workFormData.description.trim() ||
      workFormData.technology.trim()
    ) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    setSelectedProjectForWork(null);
  };

  const validateWorkForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!workFormData.date.trim()) errors.date = 'Date is required';
    if (!workFormData.title.trim()) errors.title = 'Title is required';
    if (!workFormData.description.trim()) errors.description = 'Description is required';
    if (!workFormData.technology.trim()) errors.technology = 'Technology is required';

    setWorkFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveWorkEntry = async (statusTarget: 'DRAFT' | 'PENDING' | 'APPROVED') => {
    if (!selectedProjectForWork || !validateWorkForm()) return;

    try {
      setWorkSubmitting(true);
      const payload: WorkEntryRequest = {
        ...workFormData,
        status: statusTarget,
      };

      const created = await workEntryApi.createWorkEntry(
        currentUserId,
        selectedProjectForWork.id,
        payload
      );

      if (statusTarget === 'APPROVED') {
        showSuccess(isIndividual ? `Work entry "${created.title}" marked as completed!` : `Work report "${created.title}" approved!`);
      } else if (statusTarget === 'PENDING') {
        showSuccess(isIndividual ? `Work entry "${created.title}" saved as in progress!` : `Work report "${created.title}" submitted for review!`);
      } else {
        showSuccess(`Draft "${created.title}" saved successfully!`);
      }

      setSelectedProjectForWork(null);
    } catch (err: any) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setWorkFormErrors(err.fieldErrors);
      } else {
        const msg = err.message || 'Failed to create work entry';
        setWorkFormErrors({ form: msg });
        showError(msg);
      }
    } finally {
      setWorkSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage projects for <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUser?.name}</span>
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Project
        </motion.button>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onRetry={fetchProjects} />}

      {/* Loading state */}
      {loading ? (
        <LoadingSpinner message="Loading projects..." className="py-20" />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No Projects Found"
          description="You haven't created any projects yet. Create your first project to start tracking work entries."
          actionLabel="+ New Project"
          onAction={handleOpenCreate}
          icon={<FolderPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        />
      ) : (
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardItemVariants}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight">
                        {project.name}
                      </h3>
                      <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center mt-0.5">
                        <Calendar className="w-3 h-3 mr-1" />
                        Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 line-clamp-3">
                  {project.description || (
                    <span className="italic text-slate-400 dark:text-slate-500">No description provided</span>
                  )}
                </p>
              </div>

              {/* Action buttons */}
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleOpenAddWork(project)}
                  className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors cursor-pointer"
                  title="Add work entry for this project"
                >
                  <FilePlus2 className="w-3.5 h-3.5 mr-1" />
                  + Add Work
                </motion.button>

                <div className="flex items-center space-x-1.5">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleOpenEdit(project)}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setDeletingProject(project)}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && projects.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs px-4">
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

      {/* ADD WORK ENTRY MODAL (DIRECTLY FROM PROJECT) */}
      <Modal
        isOpen={!!selectedProjectForWork}
        onClose={handleCloseAddWork}
        title={isIndividual ? `Add Work Entry` : `Create Work Report`}
      >
        <div className="space-y-4">
          {/* Project Indicator Banner */}
          {selectedProjectForWork && (
            <div className="p-3 bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Project</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">{selectedProjectForWork.name}</div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                ID: #{selectedProjectForWork.id}
              </span>
            </div>
          )}

          {workFormErrors.form && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300">
              {workFormErrors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Report Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={workFormData.date}
                onChange={(e) => setWorkFormData({ ...workFormData, date: e.target.value })}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  workFormErrors.date ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
              />
              {workFormErrors.date && <p className="text-xs text-red-500 mt-1">{workFormErrors.date}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={workFormData.category}
                onChange={(e) => setWorkFormData({ ...workFormData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="dark:bg-slate-800">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Report Title <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {workFormData.title.length}/100
              </span>
            </div>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g. Implemented OAuth token refresh and validation"
              value={workFormData.title}
              onChange={(e) => setWorkFormData({ ...workFormData, title: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                workFormErrors.title ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
              autoFocus
            />
            {workFormErrors.title && <p className="text-xs text-red-500 mt-1">{workFormErrors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Detailed Work Description <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {workFormData.description.length}/1000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="Provide a clear description of tasks completed, features delivered, and test coverage..."
              value={workFormData.description}
              onChange={(e) => setWorkFormData({ ...workFormData, description: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                workFormErrors.description ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
            />
            {workFormErrors.description && (
              <p className="text-xs text-red-500 mt-1">{workFormErrors.description}</p>
            )}
          </div>

          {/* Technology */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Technology / Tools <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {workFormData.technology.length}/50
              </span>
            </div>
            <input
              type="text"
              maxLength={50}
              placeholder="e.g. Spring Boot, PostgreSQL"
              value={workFormData.technology}
              onChange={(e) => setWorkFormData({ ...workFormData, technology: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                workFormErrors.technology ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
            />
            {workFormErrors.technology && (
              <p className="text-xs text-red-500 mt-1">{workFormErrors.technology}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCloseAddWork}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                disabled={workSubmitting}
                onClick={() => handleSaveWorkEntry('DRAFT')}
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5 inline mr-1.5 text-slate-500 dark:text-slate-400" />
                Save as Draft
              </button>
              {isIndividual || isAdmin ? (
                <>
                  <button
                    type="button"
                    disabled={workSubmitting}
                    onClick={() => handleSaveWorkEntry('PENDING')}
                    className="px-3.5 py-2 text-sm font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-800 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 inline mr-1.5 text-amber-600 dark:text-amber-400" />
                    Save as In Progress
                  </button>
                  <button
                    type="button"
                    disabled={workSubmitting}
                    onClick={() => handleSaveWorkEntry('APPROVED')}
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 inline mr-1.5" />
                    {workSubmitting ? 'Saving...' : (isAdmin ? 'Publish & Approve' : 'Mark as Completed')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={workSubmitting}
                  onClick={() => handleSaveWorkEntry('PENDING')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 inline mr-1.5" />
                  {workSubmitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* CREATE PROJECT MODAL */}
      <Modal isOpen={isCreateOpen} onClose={handleCloseCreate} title="Create New Project">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Project Name <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {formData.name.length}/100
              </span>
            </div>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g. DPWS Application"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                formErrors.name ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2`}
              autoFocus
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Description
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {(formData.description || '').length}/500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Brief summary of the project goals..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCloseCreate}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PROJECT MODAL */}
      <Modal
        isOpen={!!editingProject}
        onClose={handleCloseEdit}
        title={`Edit Project: ${editingProject?.name || ''}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Project Name <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {formData.name.length}/100
              </span>
            </div>
            <input
              type="text"
              maxLength={100}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                formErrors.name ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2`}
              autoFocus
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Description
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {(formData.description || '').length}/500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCloseEdit}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
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
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        title="Confirm Delete Project"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete project{' '}
            <span className="font-bold text-slate-800 dark:text-white">"{deletingProject?.name}"</span>?
          </p>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
            ⚠️ Warning: Any associated work entries might also be deleted or orphaned depending on database rules.
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setDeletingProject(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Deleting...' : 'Yes, Delete Project'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

