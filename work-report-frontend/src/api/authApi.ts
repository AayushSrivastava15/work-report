import { request } from './apiClient';
import type { LoginRequest, UserResponse } from '../types';

export const authApi = {
  login: (data: LoginRequest): Promise<UserResponse> => {
    return request<UserResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
