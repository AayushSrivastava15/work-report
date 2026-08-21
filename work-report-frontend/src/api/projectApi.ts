import { request } from './apiClient';
import type { PaginatedResponse, ProjectRequest, ProjectResponse } from '../types';

export const projectApi = {
  getProjectsByUser: (
    userId: number,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<ProjectResponse>> => {
    return request<PaginatedResponse<ProjectResponse>>(
      `/projects/user/${userId}?page=${page}&size=${size}`
    );
  },

  getAllProjects: (
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<ProjectResponse>> => {
    return request<PaginatedResponse<ProjectResponse>>(
      `/projects?page=${page}&size=${size}`
    );
  },

  getProjectById: (id: number): Promise<ProjectResponse> => {
    return request<ProjectResponse>(`/projects/${id}`);
  },

  createProject: (userId: number, data: ProjectRequest): Promise<ProjectResponse> => {
    return request<ProjectResponse>(`/projects/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProject: (id: number, data: ProjectRequest): Promise<ProjectResponse> => {
    return request<ProjectResponse>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProject: (id: number): Promise<void> => {
    return request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};
