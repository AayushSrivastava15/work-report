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
  Mail,
  Send,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { teamApi } from '../api/teamApi';
import { adminApi } from '../api/adminApi';
import type { Team, TeamRequest, UserResponse, TeamInvitationResponse, TeamInvitationRequest } from '../types';
import { useToast } from '../context/ToastContext';
import { motion } from 'motion/react';
import { staggerContainerVariants, cardItemVariants } from '../motion';
import { AnimatedNumber } from '../components/common/AnimatedNumber';

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
  const [invitations, setInvitations] = useState<TeamInvitationResponse[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersTab, setMembersTab] = useState<'members' | 'invitations'>('members');

  // Invite by email states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'MANAGER'>('MEMBER');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

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
      const paged = await adminApi.getUsers({ page: 0, size: 200, status: 'ACTIVE' });
      setAllUsers(paged.content);
    } catch (err: any) {
      console.error('Failed to load users for assignment', err);
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
    setMembersTab('members');
    await refreshTeamMembersAndInvites(team.id);
  };

  const refreshTeamMembersAndInvites = async (teamId: number) => {
    try {
      setLoadingMembers(true);
      const [members, invites] = await Promise.all([
        teamApi.getTeamMembers(teamId),
        teamApi.getTeamInvitations(teamId).catch(() => []),
      ]);
      setTeamMembers(members);
      setInvitations(invites);
    } catch (err: any) {
      showError(err?.message || 'Failed to load team data');
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
      refreshTeamMembersAndInvites(selectedTeam.id);
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
      refreshTeamMembersAndInvites(selectedTeam.id);
      loadTeams();
    } catch (err: any) {
      showError(err?.message || 'Failed to remove member');
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !inviteEmail.trim()) {
      showError('Please enter a valid email address');
      return;
    }

    try {
      setInviting(true);
      const req: TeamInvitationRequest = {
        email: inviteEmail.trim(),
        role: inviteRole,
        message: inviteMessage.trim() || undefined,
      };
      await teamApi.inviteMember(selectedTeam.id, req);
      showSuccess(`Invitation dispatched via Resend to ${inviteEmail}!`);
      setInviteEmail('');
      setInviteMessage('');
      setShowInviteModal(false);
      refreshTeamMembersAndInvites(selectedTeam.id);
    } catch (err: any) {
      showError(err?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (invitationId: number) => {
    if (!selectedTeam) return;
    try {
      await teamApi.cancelInvitation(invitationId);
      showSuccess('Invitation cancelled');
      refreshTeamMembersAndInvites(selectedTeam.id);
    } catch (err: any) {
      showError(err?.message || 'Failed to cancel invitation');
    }
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (t.managerName && t.managerName.toLowerCase().includes(searchKeyword.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Team Administration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize engineering groups, assign managers, and invite team members.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Teams</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              <AnimatedNumber value={teams.length} />
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Assigned Members</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              <AnimatedNumber value={teams.reduce((acc, t) => acc + (t.memberCount || 0), 0)} />
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Managed Teams</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              <AnimatedNumber value={teams.filter((t) => !!t.managerId).length} />
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams by name, description, or manager..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200/60 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No teams found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            {searchKeyword ? 'No teams match your search keyword.' : 'Get started by creating your first organizational team.'}
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTeams.map((team) => (
            <motion.div
              key={team.id}
              variants={cardItemVariants}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate" title={team.name}>
                    {team.name}
                  </h3>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900 flex-shrink-0">
                    {team.memberCount || 0} members
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                  {team.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Team Manager:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {team.managerName || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
                <button
                  onClick={() => handleOpenMembers(team)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  Members & Invites
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(team)}
                      title="Edit Team"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team)}
                      title="Delete Team"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
                  placeholder="e.g. Frontend Engineering"
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
                  placeholder="Describe the team's engineering scope or deliverables..."
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
                  <option value="">-- Assign Later --</option>
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
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
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

      {/* Team Members & Invitations Modal */}
      {showMembersModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-xl animate-in fade-in zoom-in duration-150 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  {selectedTeam.name}
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

            {/* Tabs & Actions */}
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMembersTab('members')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    membersTab === 'members'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Active Members ({teamMembers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMembersTab('invitations')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    membersTab === 'invitations'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Pending Invites ({invitations.filter((i) => i.status === 'PENDING').length})
                </button>
              </div>

              {(isAdmin || (isManager && selectedTeam.managerId === currentUser?.id)) && (
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Invite by Email
                </button>
              )}
            </div>

            {/* Tab: Active Members */}
            {membersTab === 'members' && (
              <>
                {(isAdmin || (isManager && selectedTeam.managerId === currentUser?.id)) && (
                  <div className="py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <select
                      value={addMemberUserId}
                      onChange={(e) => setAddMemberUserId(e.target.value ? Number(e.target.value) : '')}
                      className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Quick Assign Registered User to Team --</option>
                      {allUsers
                        .filter((u) => u.teamId !== selectedTeam.id)
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email}) {u.teamName ? `[in: ${u.teamName}]` : '[Unassigned]'}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      disabled={!addMemberUserId}
                      className="inline-flex items-center gap-1 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl disabled:opacity-50"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Assign
                    </button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto py-4">
                  {loadingMembers ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center py-10">
                      <UserX className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No members in this team yet</p>
                      <p className="text-xs text-slate-400 mt-1">Assign existing users or invite new members by email.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:border-slate-800">
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
              </>
            )}

            {/* Tab: Pending Invitations */}
            {membersTab === 'invitations' && (
              <div className="flex-1 overflow-y-auto py-4">
                {invitations.length === 0 ? (
                  <div className="text-center py-10">
                    <Mail className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No invitations sent yet</p>
                    <p className="text-xs text-slate-400 mt-1">Use the "Invite by Email" button to send an invitation via Resend.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {invitations.map((invite) => (
                      <div key={invite.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                                {invite.email}
                              </p>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                invite.status === 'PENDING'
                                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                  : invite.status === 'ACCEPTED'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                              }`}>
                                {invite.status}
                              </span>
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                                Role: {invite.role}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-tight mt-0.5">
                              Invited by {invite.inviterName || 'Admin'} &bull; Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {invite.status === 'PENDING' && (isAdmin || (isManager && selectedTeam.managerId === currentUser?.id)) && (
                          <button
                            onClick={() => handleCancelInvite(invite.id)}
                            title="Cancel Invitation"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Invite Member to {selectedTeam.name}
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="developer@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Team Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MEMBER">MEMBER (Standard Contributor)</option>
                  <option value="MANAGER">MANAGER (Team Reviewer & Approver)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Personal Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Add a welcoming note to include in the email..."
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {inviting ? 'Dispatching...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeamsPage;
