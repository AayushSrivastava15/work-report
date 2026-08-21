import { request } from './apiClient';
import type { PaginatedResponse, WorkEntryRequest, WorkEntryResponse } from '../types';

export const workEntryApi = {
  getWorkEntriesByUser: (
    userId: number,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<WorkEntryResponse>> => {
    return request<PaginatedResponse<WorkEntryResponse>>(
      `/work-entries/user/${userId}?page=${page}&size=${size}`
    );
  },

  getAllWorkEntries: (
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<WorkEntryResponse>> => {
    return request<PaginatedResponse<WorkEntryResponse>>(
      `/work-entries?page=${page}&size=${size}`
    );
  },

  getWorkEntryById: (id: number): Promise<WorkEntryResponse> => {
    return request<WorkEntryResponse>(`/work-entries/${id}`);
  },

  createWorkEntry: (
    userId: number,
    projectId: number,
    data: WorkEntryRequest
  ): Promise<WorkEntryResponse> => {
    return request<WorkEntryResponse>(`/work-entries/user/${userId}/project/${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateWorkEntry: (id: number, data: WorkEntryRequest): Promise<WorkEntryResponse> => {
    return request<WorkEntryResponse>(`/work-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteWorkEntry: (id: number): Promise<void> => {
    return request<void>(`/work-entries/${id}`, {
      method: 'DELETE',
    });
  },

  searchWorkEntries: (
    keyword: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<WorkEntryResponse>> => {
    return request<PaginatedResponse<WorkEntryResponse>>(
      `/work-entries/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
  },

  filterByDateRange: (
    startDate: string,
    endDate: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<WorkEntryResponse>> => {
    return request<PaginatedResponse<WorkEntryResponse>>(
      `/work-entries/filter?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
    );
  },

  filterByUserAndDateRange: (
    userId: number,
    startDate: string,
    endDate: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<WorkEntryResponse>> => {
    return request<PaginatedResponse<WorkEntryResponse>>(
      `/work-entries/filter/user/${userId}?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
    );
  },

  filterByProjectAndDateRange: (
    projectId: number,
    startDate: string,
    endDate: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<WorkEntryResponse>> => {
    return request<PaginatedResponse<WorkEntryResponse>>(
      `/work-entries/filter/project/${projectId}?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
    );
  },

  filterByUserAndProjectAndDateRange: (
    userId: number,
    projectId: number,
    startDate: string,
    endDate: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<WorkEntryResponse>> => {
    return request<PaginatedResponse<WorkEntryResponse>>(
      `/work-entries/filter/user/${userId}/project/${projectId}?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
    );
  },

  filterByCategory: (
    category: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<WorkEntryResponse>> => {
    return request<PaginatedResponse<WorkEntryResponse>>(
      `/work-entries/filter/category/${encodeURIComponent(category)}?page=${page}&size=${size}`
    );
  },

  filterByTechnology: (
    technology: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<WorkEntryResponse>> => {
    return request<PaginatedResponse<WorkEntryResponse>>(
      `/work-entries/filter/technology/${encodeURIComponent(technology)}?page=${page}&size=${size}`
    );
  },

  filterByStatus: (
    status: string,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<WorkEntryResponse>> => {
    return request<PaginatedResponse<WorkEntryResponse>>(
      `/work-entries/filter/status/${encodeURIComponent(status)}?page=${page}&size=${size}`
    );
  },

  // Lifecycle Transitions
  submit: (id: number): Promise<WorkEntryResponse> => {
    return request<WorkEntryResponse>(`/work-entries/${id}/submit`, {
      method: 'PUT',
    });
  },

  withdraw: (id: number): Promise<WorkEntryResponse> => {
    return request<WorkEntryResponse>(`/work-entries/${id}/withdraw`, {
      method: 'PUT',
    });
  },

  approve: (id: number): Promise<WorkEntryResponse> => {
    return request<WorkEntryResponse>(`/work-entries/${id}/approve`, {
      method: 'PUT',
    });
  },

  reject: (id: number, reason?: string): Promise<WorkEntryResponse> => {
    return request<WorkEntryResponse>(`/work-entries/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason: reason || '' }),
    });
  },

  resubmit: (id: number, data: WorkEntryRequest): Promise<WorkEntryResponse> => {
    return request<WorkEntryResponse>(`/work-entries/${id}/resubmit`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
