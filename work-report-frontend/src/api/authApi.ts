import { request } from './apiClient';
import type {
  LoginRequest,
  LoginResponse,
  UserRequest,
  UserResponse,
  EffectivePermissionsResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ValidateTokenResponse,
} from '../types';

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

  forgotPassword: (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  validateResetToken: (token: string): Promise<ValidateTokenResponse> => {
    return request<ValidateTokenResponse>(`/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
  },

  resetPassword: (data: ResetPasswordRequest): Promise<{ message: string }> => {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

