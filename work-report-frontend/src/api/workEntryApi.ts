import { request } from './apiClient';
import type { WorkEntryRequest, WorkEntryResponse } from '../types';

export const workEntryApi = {
  getWorkEntriesByUser: (userId: number): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>(`/work-entries/user/${userId}`);
  },

  getAllWorkEntries: (): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>('/work-entries');
  },

  getWorkEntryById: (id: number): Promise<WorkEntryResponse> => {
    return request<WorkEntryResponse>(`/work-entries/${id}`);
  },

  createWorkEntry: (userId: number, projectId: number, data: WorkEntryRequest): Promise<WorkEntryResponse> => {
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

  searchWorkEntries: (keyword: string): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>(`/work-entries/search?keyword=${encodeURIComponent(keyword)}`);
  },

  filterByDateRange: (startDate: string, endDate: string): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>(`/work-entries/filter?startDate=${startDate}&endDate=${endDate}`);
  },

  filterByUserAndDateRange: (userId: number, startDate: string, endDate: string): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>(`/work-entries/filter/user/${userId}?startDate=${startDate}&endDate=${endDate}`);
  },

  filterByProjectAndDateRange: (projectId: number, startDate: string, endDate: string): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>(`/work-entries/filter/project/${projectId}?startDate=${startDate}&endDate=${endDate}`);
  },

  filterByUserAndProjectAndDateRange: (
    userId: number,
    projectId: number,
    startDate: string,
    endDate: string
  ): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>(
      `/work-entries/filter/user/${userId}/project/${projectId}?startDate=${startDate}&endDate=${endDate}`
    );
  },

  filterByCategory: (category: string): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>(`/work-entries/filter/category/${encodeURIComponent(category)}`);
  },

  filterByTechnology: (technology: string): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>(`/work-entries/filter/technology/${encodeURIComponent(technology)}`);
  },

  filterByStatus: (status: string): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>(`/work-entries/filter/status/${encodeURIComponent(status)}`);
  },
};
