import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserResponse } from '../types';
import { userApi } from '../api/userApi';

interface UserContextType {
  currentUserId: number;
  currentUser: UserResponse | null;
  users: UserResponse[];
  setCurrentUserId: (id: number) => void;
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserIdState] = useState<number>(() => {
    const saved = localStorage.getItem('work_report_user_id');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getAllUsers();
      setUsers(data);
      
      const found = data.find((u) => u.id === currentUserId) || data[0] || null;
      if (found) {
        setCurrentUser(found);
        setCurrentUserIdState(found.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const found = users.find((u) => u.id === currentUserId) || null;
      setCurrentUser(found);
    }
  }, [currentUserId, users]);

  const setCurrentUserId = (id: number) => {
    setCurrentUserIdState(id);
    localStorage.setItem('work_report_user_id', id.toString());
  };

  return (
    <UserContext.Provider
      value={{
        currentUserId,
        currentUser,
        users,
        setCurrentUserId,
        loading,
        error,
        refreshUsers: fetchUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
