import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';
import { teamApi } from '../api/teamApi';
import type { AdminUserStatsResponse, Team, UserResponse } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../auth/AuthContext';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Shield,
  RotateCcw,
  Building,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  IdCard,
  Building2,
  Copy,
  Check,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { currentUser: authUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);

  // Stats
  const [stats, setStats] = useState<AdminUserStatsResponse>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    suspendedUsers: 0,
    rejectedUsers: 0,
  });

  // Table & Filter State
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING'>('ALL');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('ALL');

  // Pagination
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Modals
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [approveModalOpen, setApproveModalOpen] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [suspendModalOpen, setSuspendModalOpen] = useState<boolean>(false);
  const [reactivateModalOpen, setReactivateModalOpen] = useState<boolean>(false);
  const [roleModalOpen, setRoleModalOpen] = useState<boolean>(false);
  const [newRole, setNewRole] = useState<string>('USER');
  const [teamModalOpen, setTeamModalOpen] = useState<boolean>(false);
  const [newTeamId, setNewTeamId] = useState<number | ''>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Fetch Stats & Teams
  const fetchStats = useCallback(async () => {
    try {
      const data = await adminApi.getUserStats();
      setStats(data);
      const teamList = await teamApi.getAllTeams();
      setTeams(teamList);
    } catch {
      // Ignore or log error
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const effectiveStatus = activeTab === 'PENDING' ? 'PENDING' : selectedStatus;
      const data = await adminApi.getUsers({
        keyword: keyword.trim() || undefined,
        status: effectiveStatus,
        role: selectedRole,
        department: selectedDepartment,
        teamId: selectedTeamId !== 'ALL' ? Number(selectedTeamId) : undefined,
        page,
        size,
      });

      setUsers(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      showError(err.message || 'Failed to fetch users.', 'Error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedStatus, selectedRole, selectedDepartment, selectedTeamId, keyword, page, size, showError]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  // Handle Tab Switch
  const handleTabChange = (tab: 'ALL' | 'PENDING') => {
    setActiveTab(tab);
    setPage(0);
    if (tab === 'PENDING') {
      setSelectedStatus('PENDING');
    } else {
      setSelectedStatus('ALL');
    }
  };

  // Actions
  const handleApprove = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await adminApi.approveUser(selectedUser.id);
      showSuccess(`Account for ${selectedUser.name} has been approved and is now Active.`, 'User Approved');
      setApproveModalOpen(false);
      setSelectedUser(null);
      fetchStats();
      fetchUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to approve user.', 'Approval Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await adminApi.rejectUser(selectedUser.id, rejectReason);
      showSuccess(`Registration for ${selectedUser.name} has been rejected.`, 'Registration Rejected');
      setRejectModalOpen(false);
      setSelectedUser(null);
      setRejectReason('');
      fetchStats();
      fetchUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to reject user.', 'Rejection Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await adminApi.suspendUser(selectedUser.id);
      showSuccess(`Account for ${selectedUser.name} has been suspended.`, 'User Suspended');
      setSuspendModalOpen(false);
      setSelectedUser(null);
      fetchStats();
      fetchUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to suspend user.', 'Suspension Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await adminApi.reactivateUser(selectedUser.id);
      showSuccess(`Account for ${selectedUser.name} has been reactivated and restored to Active.`, 'User Reactivated');
      setReactivateModalOpen(false);
      setSelectedUser(null);
      fetchStats();
      fetchUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to reactivate user.', 'Reactivation Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await adminApi.updateUserRole(selectedUser.id, newRole);
      showSuccess(`Role for ${selectedUser.name} updated to ${newRole}.`, 'Role Updated');
      setRoleModalOpen(false);
      setSelectedUser(null);
      fetchStats();
      fetchUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to update user role.', 'Role Update Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTeamChange = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await adminApi.updateUser(selectedUser.id, { teamId: newTeamId ? Number(newTeamId) : 0 });
      showSuccess(`Team assignment for ${selectedUser.name} updated.`, 'Team Updated');
      setTeamModalOpen(false);
      setSelectedUser(null);
      fetchStats();
      fetchUsers();
    } catch (err: any) {
      showError(err.message || 'Failed to update team assignment.', 'Team Update Error');
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setKeyword('');
    setSelectedStatus('ALL');
    setSelectedRole('ALL');
    setSelectedDepartment('ALL');
    setSelectedTeamId('ALL');
    setPage(0);
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || 'ACTIVE').toUpperCase();
    switch (s) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            Pending Approval
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <UserX className="w-3 h-3 mr-1 text-slate-500" />
            Suspended
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const copyInviteCode = () => {
    const code = stats.organizationCode || authUser?.organizationCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      showSuccess(`Company code ${code} copied to clipboard!`, 'Code Copied');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin User Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage employee accounts, review pending registration requests, and configure access permissions
          </p>
        </div>
      </div>

      {/* ORGANIZATION SUMMARY CARD */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {stats.organizationName || authUser?.organizationName || 'Enterprise Workspace'}
              </h2>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-white/20 text-white tracking-wider">
                {stats.organizationType || authUser?.organizationType || 'COMPANY'}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Scoped Tenant Isolation &bull; Only members of this workspace are visible here
            </p>
          </div>
        </div>

        {/* Company Invite Code Box */}
        {(stats.organizationCode || authUser?.organizationCode) && (
          <div className="flex items-center space-x-2.5 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20">
            <div className="text-right">
              <div className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">
                Company Invite Code
              </div>
              <div className="font-mono text-sm font-black text-white tracking-wider">
                {stats.organizationCode || authUser?.organizationCode}
              </div>
            </div>
            <button
              type="button"
              onClick={copyInviteCode}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-blue-900 hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1 text-blue-700" />}
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        )}
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Users */}
        <div
          onClick={() => {
            setActiveTab('ALL');
            setSelectedStatus('ALL');
            setPage(0);
          }}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer select-none"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalUsers}</div>
        </div>

        {/* Active Users */}
        <div
          onClick={() => {
            setActiveTab('ALL');
            setSelectedStatus('ACTIVE');
            setPage(0);
          }}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer select-none"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.activeUsers}</div>
        </div>

        {/* Pending Requests */}
        <div
          onClick={() => {
            handleTabChange('PENDING');
          }}
          className={`p-4 rounded-xl border shadow-2xs transition-all cursor-pointer select-none ${
            stats.pendingUsers > 0
              ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
              : 'bg-white border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{stats.pendingUsers}</div>
        </div>

        {/* Suspended Users */}
        <div
          onClick={() => {
            setActiveTab('ALL');
            setSelectedStatus('SUSPENDED');
            setPage(0);
          }}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer select-none"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Suspended</span>
            <UserX className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{stats.suspendedUsers}</div>
        </div>

        {/* Rejected Users */}
        <div
          onClick={() => {
            setActiveTab('ALL');
            setSelectedStatus('REJECTED');
            setPage(0);
          }}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer select-none col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700">{stats.rejectedUsers}</div>
        </div>
      </div>

      {/* TABS & TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 p-2 border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => handleTabChange('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Accounts ({stats.totalUsers})
          </button>
          <button
            onClick={() => handleTabChange('PENDING')}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-amber-800 hover:bg-amber-100/60'
            }`}
          >
            <span>Pending Registration Requests</span>
            {stats.pendingUsers > 0 && (
              <span
                className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded-full ${
                  activeTab === 'PENDING' ? 'bg-white text-amber-800' : 'bg-amber-500 text-white'
                }`}
              >
                {stats.pendingUsers}
              </span>
            )}
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, email, ID..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Status Dropdown (Active only in ALL tab) */}
          {activeTab === 'ALL' && (
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                <option value="ALL">Status: All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          )}

          {/* Role Dropdown */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            >
              <option value="ALL">Role: All Roles</option>
              <option value="USER">Member (USER)</option>
              <option value="MANAGER">Manager (MANAGER)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
            </select>
          </div>

          {/* Team Dropdown */}
          <div>
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
            >
              <option value="ALL">Team: All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id.toString()}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center space-x-2">
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* USER TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 text-slate-600 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Corporate Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="font-semibold text-slate-800">No users found</div>
                      <p className="text-[11px] text-slate-400">
                        {activeTab === 'PENDING'
                          ? 'No pending registration requests awaiting approval.'
                          : 'Try changing your search keywords or filter criteria.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = authUser?.id === user.id;
                  const isPending = user.status === 'PENDING';
                  const isActive = user.status === 'ACTIVE';
                  const isSuspended = user.status === 'SUSPENDED';
                  const isRejected = user.status === 'REJECTED';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <span>{user.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-100 text-blue-700">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: #{user.id} {user.employeeId ? `• Emp: ${user.employeeId}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {user.email}
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-600">
                        {user.department ? (
                          <span className="inline-flex items-center text-slate-700">
                            <Building className="w-3 h-3 mr-1 text-slate-400" />
                            {user.department}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : user.role === 'MANAGER'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {user.role === 'ADMIN' ? (
                            <>
                              <Shield className="w-2.5 h-2.5 mr-1 text-purple-600" />
                              ADMIN
                            </>
                          ) : user.role === 'MANAGER' ? (
                            <>
                              <ShieldAlert className="w-2.5 h-2.5 mr-1 text-amber-600" />
                              MANAGER
                            </>
                          ) : (
                            'MEMBER'
                          )}
                        </span>
                      </td>

                      {/* Team */}
                      <td className="py-3 px-4">
                        {user.teamName ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Users className="w-2.5 h-2.5 mr-1 text-indigo-500" />
                            {user.teamName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">{renderStatusBadge(user.status)}</td>

                      {/* Registered Date */}
                      <td className="py-3 px-4 text-[11px] text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Details Button */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setDetailsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Account Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* PENDING ACTIONS */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setApproveModalOpen(true);
                                }}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setRejectModalOpen(true);
                                }}
                                className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* ACTIVE ACTIONS */}
                          {isActive && !isSelf && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewTeamId(user.teamId || '');
                                  setTeamModalOpen(true);
                                }}
                                className="px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                                title="Assign Team"
                              >
                                Team
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewRole(user.role || 'USER');
                                  setRoleModalOpen(true);
                                }}
                                className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                              >
                                Role
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSuspendModalOpen(true);
                                }}
                                className="px-2 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                              >
                                Suspend
                              </button>
                            </>
                          )}

                          {/* SUSPENDED ACTIONS */}
                          {isSuspended && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setReactivateModalOpen(true);
                              }}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reactivate</span>
                            </button>
                          )}

                          {/* REJECTED ACTIONS */}
                          {isRejected && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setApproveModalOpen(true);
                              }}
                              className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <span>Re-Approve</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{users.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalElements}</span> registered users
          </div>

          <div className="flex items-center space-x-4">
            {/* Page Size Selector */}
            <div className="flex items-center space-x-1.5">
              <span>Per page:</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-1">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-slate-700">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* APPROVE CONFIRMATION MODAL */}
      {approveModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Approve User Account</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to approve registration for{' '}
                  <span className="font-semibold text-slate-800">{selectedUser.name}</span> ({selectedUser.email})?
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-800">
              The user account status will be set to <strong>ACTIVE</strong> and they will be able to log in immediately.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setApproveModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT USER MODAL */}
      {rejectModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reject User Registration</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Reject account application for <span className="font-semibold text-slate-800">{selectedUser.name}</span>.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Reason for Rejection <span className="text-slate-400 font-normal normal-case">(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Unverified organizational email, duplicate record..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setRejectModalOpen(false);
                  setSelectedUser(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND USER MODAL */}
      {suspendModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Suspend Account</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to suspend <span className="font-semibold text-slate-800">{selectedUser.name}</span>?
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              Suspended users will be blocked from logging into the system and creating work entries.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setSuspendModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSuspend}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REACTIVATE USER MODAL */}
      {reactivateModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reactivate Account</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Reactivate access for <span className="font-semibold text-slate-800">{selectedUser.name}</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setReactivateModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReactivate}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Reactivating...' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {roleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Configure Access Role</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Change role assignment for <span className="font-semibold text-slate-800">{selectedUser.name}</span>.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                <option value="USER">MEMBER (Individual Contributor)</option>
                <option value="MANAGER">TEAM MANAGER (Team Approval & Review Access)</option>
                <option value="ADMIN">ORGANIZATION ADMIN (Full Company Access)</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setRoleModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleRoleChange}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Updating...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN TEAM MODAL */}
      {teamModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign Team Workspace</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Assign <span className="font-semibold text-slate-800">{selectedUser.name}</span> to a team in this organization.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Team
              </label>
              <select
                value={newTeamId}
                onChange={(e) => setNewTeamId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
              >
                <option value="">-- No Team (Unassigned) --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.managerName ? `(Manager: ${t.managerName})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Team members can have their submissions reviewed and approved by their designated Team Manager.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  setTeamModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleTeamChange}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {actionLoading ? 'Saving...' : 'Save Team Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAILS MODAL */}
      {detailsModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedUser(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center">
                  <IdCard className="w-3 h-3 mr-1" />
                  Account ID & Role
                </div>
                <div className="font-semibold text-slate-800">#{selectedUser.id}</div>
                <div className="mt-1">{renderStatusBadge(selectedUser.status)}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center">
                  <Building className="w-3 h-3 mr-1" />
                  Department / Title
                </div>
                <div className="font-semibold text-slate-800">
                  {selectedUser.department || 'Not Assigned'}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {selectedUser.designation || 'Staff Member'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Registration Date
                </div>
                <div className="font-semibold text-slate-800">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '—'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Approval Audit
                </div>
                <div className="font-semibold text-slate-800">
                  {selectedUser.approvedBy ? `By: ${selectedUser.approvedBy}` : 'Self-Registered'}
                </div>
                {selectedUser.approvedAt && (
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    {new Date(selectedUser.approvedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {selectedUser.rejectionReason && (
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800">
                <div className="font-bold mb-1">Rejection Reason:</div>
                <div>{selectedUser.rejectionReason}</div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setDetailsModalOpen(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
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
