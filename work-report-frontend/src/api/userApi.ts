import { request } from './apiClient';
import type { UserResponse } from '../types';

export const userApi = {
  getAllUsers: (): Promise<UserResponse[]> => {
    return request<UserResponse[]>('/users');
  },

  getUserById: (id: number): Promise<UserResponse> => {
    return request<UserResponse>(`/users/${id}`);
  },
};
