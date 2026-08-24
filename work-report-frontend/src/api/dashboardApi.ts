import { request } from './apiClient';
import type {
  AnalyticsFilterParams,
  DashboardAnalyticsResponse,
  DashboardCategoryResponse,
  DashboardProjectCountResponse,
  DashboardProjectResponse,
  DashboardStatusResponse,
  DashboardTechnologyResponse,
  DashboardWorkCountResponse,
  WorkEntryResponse,
} from '../types';

export const dashboardApi = {
  getAnalytics: (userId: number, filters?: AnalyticsFilterParams): Promise<DashboardAnalyticsResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.projectId) params.append('projectId', filters.projectId.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.technology) params.append('technology', filters.technology);
      if (filters.status) params.append('status', filters.status);
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.aggregation) params.append('aggregation', filters.aggregation);
      if (filters.teamMemberId) params.append('teamMemberId', filters.teamMemberId.toString());
    }
    const query = params.toString();
    return request<DashboardAnalyticsResponse>(
      `/dashboard/user/${userId}/analytics${query ? `?${query}` : ''}`
    );
  },

  getWorkCount: (userId: number): Promise<DashboardWorkCountResponse> => {
    return request<DashboardWorkCountResponse>(`/dashboard/user/${userId}/work-count`);
  },

  getProjectCount: (userId: number): Promise<DashboardProjectCountResponse> => {
    return request<DashboardProjectCountResponse>(`/dashboard/user/${userId}/project-count`);
  },

  getCurrentMonthWork: (userId: number): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>(`/dashboard/user/${userId}/current-month`);
  },

  getCurrentWeekWork: (userId: number): Promise<WorkEntryResponse[]> => {
    return request<WorkEntryResponse[]>(`/dashboard/user/${userId}/current-week`);
  },

  getWorkByProject: (userId: number): Promise<DashboardProjectResponse[]> => {
    return request<DashboardProjectResponse[]>(`/dashboard/user/${userId}/projects`);
  },

  getWorkByCategory: (userId: number): Promise<DashboardCategoryResponse[]> => {
    return request<DashboardCategoryResponse[]>(`/dashboard/user/${userId}/categories`);
  },

  getWorkByTechnology: (userId: number): Promise<DashboardTechnologyResponse[]> => {
    return request<DashboardTechnologyResponse[]>(`/dashboard/user/${userId}/technologies`);
  },

  getWorkByStatus: (userId: number): Promise<DashboardStatusResponse[]> => {
    return request<DashboardStatusResponse[]>(`/dashboard/user/${userId}/status`);
  },
};
