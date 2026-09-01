import React, { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { PageLoader } from '../components/common/PageLoader';

const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })));

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

  return (
    <Suspense fallback={<PageLoader />}>
      <HomePage />
    </Suspense>
  );
};
