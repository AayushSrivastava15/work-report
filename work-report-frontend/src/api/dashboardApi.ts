import { request } from './apiClient';
import type {
  DashboardCategoryResponse,
  DashboardProjectCountResponse,
  DashboardProjectResponse,
  DashboardStatusResponse,
  DashboardTechnologyResponse,
  DashboardWorkCountResponse,
  WorkEntryResponse,
} from '../types';

export const dashboardApi = {
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
