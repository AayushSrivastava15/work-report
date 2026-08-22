import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserPlus,
  Trash2,
  Edit2,
  X,
  Building2,
  UserX,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { teamApi } from '../api/teamApi';
import { adminApi } from '../api/adminApi';
import type { Team, TeamRequest, UserResponse } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminTeamsPage: React.FC = () => {
  const { currentUser, isAdmin, isManager } = useAuth();
  const { showSuccess, showError } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserResponse[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Form states
  const [formData, setFormData] = useState<TeamRequest>({
    name: '',
    description: '',
    managerId: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [addMemberUserId, setAddMemberUserId] = useState<number | ''>('');

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await teamApi.getAllTeams();
      setTeams(data);
    } catch (err: any) {
      showError(err?.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const loadUsersForAssignment = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await adminApi.getUsers({ size: 100, status: 'ACTIVE' });
      setAllUsers(res.content);
    } catch {
      // Non-blocking
    }
  }, [isAdmin]);

  useEffect(() => {
    loadTeams();
    loadUsersForAssignment();
  }, [loadTeams, loadUsersForAssignment]);

  const handleOpenCreate = () => {
    setFormData({ name: '', description: '', managerId: null });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      managerId: team.managerId || null,
    });
    setShowEditModal(true);
  };

  const handleOpenMembers = async (team: Team) => {
    setSelectedTeam(team);
    setShowMembersModal(true);
    try {
      setLoadingMembers(true);
      const members = await teamApi.getTeamMembers(team.id);
      setTeamMembers(members);
    } catch (err: any) {
      showError(err?.message || 'Failed to load team members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError('Team name is required');
      return;
    }

    try {
      setSubmitting(true);
      await teamApi.createTeam(formData);
      showSuccess('Team created successfully!');
      setShowCreateModal(false);
      loadTeams();
      loadUsersForAssignment();
    } catch (err: any) {
      showError(err?.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !formData.name.trim()) return;

    try {
      setSubmitting(true);
      await teamApi.updateTeam(selectedTeam.id, formData);
      showSuccess('Team updated successfully!');
      setShowEditModal(false);
      loadTeams();
      loadUsersForAssignment();
    } catch (err: any) {
      showError(err?.message || 'Failed to update team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!window.confirm(`Are you sure you want to delete "${team.name}"? Team members will be unassigned.`)) {
      return;
    }

    try {
      await teamApi.deleteTeam(team.id);
      showSuccess('Team deleted successfully');
      loadTeams();
    } catch (err: any) {
      showError(err?.message || 'Failed to delete team');
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !addMemberUserId) return;
    try {
      await teamApi.addMember(selectedTeam.id, Number(addMemberUserId));
      showSuccess('Member assigned to team!');
      setAddMemberUserId('');
      const updated = await teamApi.getTeamMembers(selectedTeam.id);
      setTeamMembers(updated);
      loadTeams();
    } catch (err: any) {
      showError(err?.message || 'Failed to assign member');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedTeam) return;
    try {
      await teamApi.removeMember(selectedTeam.id, userId);
      showSuccess('Member removed from team');
      const updated = await teamApi.getTeamMembers(selectedTeam.id);
      setTeamMembers(updated);
      loadTeams();
    } catch (err: any) {
      showError(err?.message || 'Failed to remove member');
    }
  };

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchKeyword.toLowerCase())) ||
    (t.managerName && t.managerName.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800/60">
              {currentUser?.organizationName || 'Organization'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Code: {currentUser?.organizationCode}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Team & Workspace Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize users into functional teams, assign designated managers, and manage team boundaries.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Teams</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{teams.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Members</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {teams.reduce((acc, t) => acc + (t.memberCount || 0), 0)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Team Managers</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {teams.filter(t => t.managerId != null).length}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search teams by name, description, or manager..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-900 dark:text-white">No teams found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchKeyword ? 'No teams matched your search criteria.' : 'Create teams like "Engineering", "Design", or "Marketing" to organize your organization.'}
          </p>
          {isAdmin && !searchKeyword && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Create First Team
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {team.name}
                  </h3>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[40px] mb-4">
                  {team.description || 'No description provided.'}
                </p>

                {/* Manager Card */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800/80 mb-4">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                    Team Manager
                  </span>
                  {team.managerName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                        {team.managerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                          {team.managerName}
                        </p>
                        <p className="text-xs text-slate-400 leading-tight">
                          {team.managerEmail}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No manager assigned</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenMembers(team)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  View Members ({team.memberCount})
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(team)}
                      title="Edit Team"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team)}
                      title="Delete Team"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Create New Team
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Engineering, Marketing, Operations"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of this team's focus..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Designated Team Manager
                </label>
                <select
                  value={formData.managerId ?? ''}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- No Manager Assigned --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) - {u.role}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Assigning a user will automatically grant them the MANAGER role over this team.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                Edit Team: {selectedTeam.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Designated Team Manager
                </label>
                <select
                  value={formData.managerId ?? ''}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- No Manager Assigned --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Members Modal */}
      {showMembersModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-xl animate-in fade-in zoom-in duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  {selectedTeam.name} — Members
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manager: {selectedTeam.managerName || 'None assigned'}
                </p>
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Member Bar */}
            {(isAdmin || (isManager && selectedTeam.managerId === currentUser?.id)) && (
              <div className="py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <select
                  value={addMemberUserId}
                  onChange={(e) => setAddMemberUserId(e.target.value ? Number(e.target.value) : '')}
                  className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Member to Add to Team --</option>
                  {allUsers
                    .filter(u => u.teamId !== selectedTeam.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) {u.teamName ? `[Currently in: ${u.teamName}]` : '[Unassigned]'}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={!addMemberUserId}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
              </div>
            )}

            {/* Member List Table */}
            <div className="flex-1 overflow-y-auto py-4">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-10">
                  <UserX className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No members in this team yet</p>
                  <p className="text-xs text-slate-400 mt-1">Use the selector above to assign active members to this team.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                              {member.name}
                            </p>
                            {selectedTeam.managerId === member.id && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800">
                                Manager
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                              {member.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-tight mt-0.5">{member.email}</p>
                        </div>
                      </div>

                      {(isAdmin || (isManager && selectedTeam.managerId === currentUser?.id)) && selectedTeam.managerId !== member.id && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          title="Remove from Team"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
