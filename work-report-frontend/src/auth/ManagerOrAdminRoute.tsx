import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../context/ToastContext';

interface ManagerOrAdminRouteProps {
  children?: React.ReactNode;
}

export const ManagerOrAdminRoute: React.FC<ManagerOrAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isManager } = useAuth();
  const location = useLocation();
  const { showError } = useToast();

  const isAllowed = isAdmin || isManager;

  useEffect(() => {
    if (isAuthenticated && !isAllowed) {
      showError('Access Denied: Team management or administrative privileges required.', 'Unauthorized');
    }
  }, [isAuthenticated, isAllowed, showError]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
