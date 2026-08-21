import React, { useState } from 'react';
import type { LoginRequest, UserResponse } from '../types';
import { authApi } from '../api/authApi';
import { AuthContext } from './AuthContext';

const SESSION_STORAGE_KEY = 'work_report_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(() => {
    try {
      const savedUser = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (savedUser) {
        return JSON.parse(savedUser) as UserResponse;
      }
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
    return null;
  });

  const login = async (credentials: LoginRequest): Promise<UserResponse> => {
    const user = await authApi.login(credentials);
    setCurrentUser(user);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('work_report_user_id');
  };

  const value = {
    isAuthenticated: currentUser !== null,
    currentUser,
    currentUserId: currentUser?.id ?? 0,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
