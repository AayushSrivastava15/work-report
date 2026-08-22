import React, { useState, useEffect, useCallback } from 'react';
import type { EffectivePermissionsResponse, LoginRequest, LoginResponse, UserResponse } from '../types';
import { authApi } from '../api/authApi';
import { AuthContext } from './AuthContext';

export const SESSION_STORAGE_USER_KEY = 'work_report_auth_user';
export const SESSION_STORAGE_TOKEN_KEY = 'work_report_token';
export const SESSION_STORAGE_PERMS_KEY = 'work_report_perms';

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

  const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermissionsResponse | null>(() => {
    try {
      const savedPerms = sessionStorage.getItem(SESSION_STORAGE_PERMS_KEY);
      if (savedPerms) {
        return JSON.parse(savedPerms) as EffectivePermissionsResponse;
      }
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_PERMS_KEY);
    }
    return null;
  });

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const perms = await authApi.getMe();
      setEffectivePermissions(perms);
      sessionStorage.setItem(SESSION_STORAGE_PERMS_KEY, JSON.stringify(perms));

      // Also sync user if fields changed
      if (currentUser) {
        const updatedUser: UserResponse = {
          ...currentUser,
          role: perms.role,
          status: perms.status,
          teamId: perms.teamId,
          teamName: perms.teamName,
          isManager: perms.isManager,
        };
        setCurrentUser(updatedUser);
        sessionStorage.setItem(SESSION_STORAGE_USER_KEY, JSON.stringify(updatedUser));
      }
    } catch {
      // Ignored if network issue or expired
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (token && !effectivePermissions) {
      refreshProfile();
    }
  }, [token, effectivePermissions, refreshProfile]);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await authApi.login(credentials);
    setToken(res.token);
    setCurrentUser(res.user);
    sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, res.token);
    sessionStorage.setItem(SESSION_STORAGE_USER_KEY, JSON.stringify(res.user));

    try {
      // Fetch permissions right after login
      const perms = await authApi.getMe();
      setEffectivePermissions(perms);
      sessionStorage.setItem(SESSION_STORAGE_PERMS_KEY, JSON.stringify(perms));
    } catch {
      // Non-blocking fallback
    }

    return res;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setEffectivePermissions(null);
    sessionStorage.removeItem(SESSION_STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_USER_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_PERMS_KEY);
    localStorage.removeItem('work_report_user_id');
  };

  const hasPermission = useCallback((permission: string, scope?: 'OWN' | 'TEAM' | 'ORGANIZATION'): boolean => {
    if (!effectivePermissions || !effectivePermissions.permissions) {
      // Fallback to role check
      if (currentUser?.role === 'ADMIN') return true;
      return false;
    }

    const perms = effectivePermissions.permissions;

    if (!scope) {
      return perms.some(p => p.startsWith(permission + ':'));
    }

    const exact = `${permission}:${scope}`;
    if (perms.includes(exact)) return true;

    // ORGANIZATION scope satisfies TEAM and OWN
    if (scope === 'TEAM' && perms.includes(`${permission}:ORGANIZATION`)) return true;
    if (scope === 'OWN' && (perms.includes(`${permission}:ORGANIZATION`) || perms.includes(`${permission}:TEAM`))) return true;

    return false;
  }, [effectivePermissions, currentUser]);

  const role = currentUser?.role?.toUpperCase();
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'MANAGER' || (effectivePermissions?.isManager ?? false);

  const value = {
    isAuthenticated: currentUser !== null && token !== null,
    currentUser,
    currentUserId: currentUser?.id ?? 0,
    token,
    effectivePermissions,
    isAdmin,
    isManager,
    hasPermission,
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
