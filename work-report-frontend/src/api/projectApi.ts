import { request } from './apiClient';
import type { ProjectRequest, ProjectResponse } from '../types';

export const projectApi = {
  getProjectsByUser: (userId: number): Promise<ProjectResponse[]> => {
    return request<ProjectResponse[]>(`/projects/user/${userId}`);
  },

  getAllProjects: (): Promise<ProjectResponse[]> => {
    return request<ProjectResponse[]>('/projects');
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
