import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { projectApi } from '../api/projectApi';
import type { ProjectRequest, ProjectResponse } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Plus, Edit2, Trash2, FolderPlus, FolderKanban, Calendar } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { currentUserId, currentUser } = useUser();

  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectResponse | null>(null);

  // Form States
  const [formData, setFormData] = useState<ProjectRequest>({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await projectApi.getProjectsByUser(currentUserId);
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentUserId]);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
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

  const handleOpenEdit = (proj: ProjectResponse) => {
    setEditingProject(proj);
    setFormData({ name: proj.name, description: proj.description || '' });
    setFormErrors({});
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const created = await projectApi.createProject(currentUserId, formData);
      setProjects((prev) => [...prev, created]);
      setIsCreateOpen(false);
      showNotification(`Project "${created.name}" created successfully!`);
    } catch (err: any) {
      setFormErrors({ name: err.message || 'Failed to create project' });
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
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingProject(null);
      showNotification(`Project "${updated.name}" updated successfully!`);
    } catch (err: any) {
      setFormErrors({ name: err.message || 'Failed to update project' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;

    try {
      setSubmitting(true);
      await projectApi.deleteProject(deletingProject.id);
      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      showNotification(`Project "${deletingProject.name}" deleted successfully.`);
      setDeletingProject(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
      setDeletingProject(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage projects for <span className="font-semibold text-slate-700">{currentUser?.name}</span>
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Project
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm font-medium shadow-xs animate-fade-in">
          {successMessage}
        </div>
      )}

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
          icon={<FolderPlus className="w-6 h-6 text-blue-600" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 tracking-tight">
                        {project.name}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center mt-0.5">
                        <Calendar className="w-3 h-3 mr-1" />
                        Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mt-4 line-clamp-3">
                  {project.description || (
                    <span className="italic text-slate-400">No description provided</span>
                  )}
                </p>
              </div>

              {/* Action buttons */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleOpenEdit(project)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => setDeletingProject(project)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. DPWS Application"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                formErrors.name ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-blue-300'
              } focus:outline-none focus:ring-2`}
              autoFocus
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of the project goals..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
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
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title={`Edit Project: ${editingProject?.name || ''}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2 text-sm rounded-lg border ${
                formErrors.name ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-blue-300'
              } focus:outline-none focus:ring-2`}
              autoFocus
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingProject(null)}
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
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        title="Confirm Delete Project"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete project{' '}
            <span className="font-bold text-slate-800">"{deletingProject?.name}"</span>?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            ⚠️ Warning: Any associated work entries might also be deleted or orphaned depending on database rules.
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeletingProject(null)}
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
              {submitting ? 'Deleting...' : 'Yes, Delete Project'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
