import { request } from './apiClient';
import type { AdminUserStatsResponse, PaginatedResponse, UserResponse } from '../types';

export interface AdminUserQueryParams {
  keyword?: string;
  status?: string;
  role?: string;
  department?: string;
  teamId?: number;
  page?: number;
  size?: number;
}

export const adminApi = {
  getUsers: (params: AdminUserQueryParams = {}): Promise<PaginatedResponse<UserResponse>> => {
    const query = new URLSearchParams();
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.role && params.role !== 'ALL') query.append('role', params.role);
    if (params.department && params.department !== 'ALL') query.append('department', params.department);
    if (params.teamId !== undefined && params.teamId !== null) query.append('teamId', params.teamId.toString());
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.size !== undefined) query.append('size', params.size.toString());

    const queryString = query.toString();
    return request<PaginatedResponse<UserResponse>>(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  getUserStats: (): Promise<AdminUserStatsResponse> => {
    return request<AdminUserStatsResponse>('/admin/users/stats');
  },

  getUserById: (id: number): Promise<UserResponse> => {
    return request<UserResponse>(`/admin/users/${id}`);
  },

  approveUser: (id: number): Promise<UserResponse> => {
    return request<UserResponse>(`/admin/users/${id}/approve`, {
      method: 'PUT',
    });
  },

  rejectUser: (id: number, reason?: string): Promise<UserResponse> => {
    return request<UserResponse>(`/admin/users/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason: reason || '' }),
    });
  },

  suspendUser: (id: number): Promise<UserResponse> => {
    return request<UserResponse>(`/admin/users/${id}/suspend`, {
      method: 'PUT',
    });
  },

  reactivateUser: (id: number): Promise<UserResponse> => {
    return request<UserResponse>(`/admin/users/${id}/reactivate`, {
      method: 'PUT',
    });
  },

  updateUserRole: (id: number, role: string): Promise<UserResponse> => {
    return request<UserResponse>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  updateUser: (id: number, data: any): Promise<UserResponse> => {
    return request<UserResponse>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
