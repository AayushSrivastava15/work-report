import { createContext, useContext } from 'react';
import type { LoginRequest, LoginResponse, UserResponse } from '../types';

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: UserResponse | null;
  currentUserId: number;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
