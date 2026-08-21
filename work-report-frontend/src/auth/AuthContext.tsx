import { createContext, useContext } from 'react';
import type { LoginRequest, UserResponse } from '../types';

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: UserResponse | null;
  currentUserId: number;
  login: (credentials: LoginRequest) => Promise<UserResponse>;
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
