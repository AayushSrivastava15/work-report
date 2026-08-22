import { createContext, useContext } from 'react';
import type { EffectivePermissionsResponse, LoginRequest, LoginResponse, UserResponse } from '../types';

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: UserResponse | null;
  currentUserId: number;
  token: string | null;
  effectivePermissions: EffectivePermissionsResponse | null;
  isAdmin: boolean;
  isManager: boolean;
  hasPermission: (permission: string, scope?: 'OWN' | 'TEAM' | 'ORGANIZATION') => boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

