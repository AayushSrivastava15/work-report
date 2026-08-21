import React, { useState } from 'react';
import type { LoginRequest, LoginResponse, UserResponse } from '../types';
import { authApi } from '../api/authApi';
import { AuthContext } from './AuthContext';

export const SESSION_STORAGE_USER_KEY = 'work_report_auth_user';
export const SESSION_STORAGE_TOKEN_KEY = 'work_report_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserResponse | null>(() => {
    try {
      const savedUser = sessionStorage.getItem(SESSION_STORAGE_USER_KEY);
      if (savedUser) {
        return JSON.parse(savedUser) as UserResponse;
      }
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_USER_KEY);
    }
    return null;
  });

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await authApi.login(credentials);
    setToken(res.token);
    setCurrentUser(res.user);
    sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, res.token);
    sessionStorage.setItem(SESSION_STORAGE_USER_KEY, JSON.stringify(res.user));
    return res;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_USER_KEY);
    localStorage.removeItem('work_report_user_id');
  };

  const value = {
    isAuthenticated: currentUser !== null && token !== null,
    currentUser,
    currentUserId: currentUser?.id ?? 0,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
