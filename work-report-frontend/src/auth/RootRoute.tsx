import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { HomePage } from '../pages/HomePage';

/**
 * Smart Root Route (/) resolver:
 * - If user is unauthenticated -> renders Public Home Page (HomePage).
 * - If user is authenticated -> redirects automatically to /dashboard.
 */
export const RootRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <HomePage />;
};
