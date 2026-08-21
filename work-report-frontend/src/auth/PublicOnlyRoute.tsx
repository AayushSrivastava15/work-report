import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

/**
 * Route guard that prevents authenticated users from accessing public authentication pages
 * (e.g. /login, /register). If the user already has an active session, they are redirected to /dashboard.
 */
export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
