import { useAuth } from '../auth/AuthContext';
import type { UserResponse } from '../types';

export interface UserContextType {
  currentUserId: number;
  currentUser: UserResponse | null;
  logout: () => void;
}

/**
 * Re-export hook connecting pages directly to central authentication state
 */
export const useUser = (): UserContextType => {
  const { currentUserId, currentUser, logout } = useAuth();
  return {
    currentUserId,
    currentUser,
    logout,
  };
};
