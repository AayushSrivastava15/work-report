import { request } from './apiClient';
import type { LoginRequest, LoginResponse, UserRequest, UserResponse, EffectivePermissionsResponse } from '../types';

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  register: (data: UserRequest): Promise<UserResponse> => {
    return request<UserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMe: (): Promise<EffectivePermissionsResponse> => {
    return request<EffectivePermissionsResponse>('/auth/me');
  },

  getPermissions: (): Promise<EffectivePermissionsResponse> => {
    return request<EffectivePermissionsResponse>('/auth/permissions');
  },
};
