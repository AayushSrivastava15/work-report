import { request } from './apiClient';
import type { ChangePasswordRequest, UserProfileUpdateRequest, UserResponse } from '../types';

export const userProfileApi = {
  getUserProfile: (userId: number): Promise<UserResponse> => {
    return request<UserResponse>(`/users/${userId}`);
  },

  updateProfile: (userId: number, data: UserProfileUpdateRequest): Promise<UserResponse> => {
    return request<UserResponse>(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: (userId: number, data: ChangePasswordRequest): Promise<void> => {
    return request<void>(`/users/${userId}/change-password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
