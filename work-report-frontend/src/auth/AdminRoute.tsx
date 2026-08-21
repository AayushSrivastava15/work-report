import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../context/ToastContext';

interface AdminRouteProps {
  children?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();
  const { showError } = useToast();

  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      showError('Access Denied: Administrative privileges required.', 'Unauthorized');
    }
  }, [isAuthenticated, isAdmin, showError]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
