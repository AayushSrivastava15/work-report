import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { WorkEntriesPage } from './pages/WorkEntriesPage';
import { ReportsPage } from './pages/ReportsPage';

import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminRoute } from './auth/AdminRoute';
import { RegisterPage } from './pages/RegisterPage';
import { RootRoute } from './auth/RootRoute';
import { PublicOnlyRoute } from './auth/PublicOnlyRoute';
import { ToastProvider } from './context/ToastContext';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Smart Root: Unauthenticated -> HomePage, Authenticated -> Dashboard */}
            <Route path="/" element={<RootRoute />} />

            {/* Public Authentication Routes (Guarded: redirect to Dashboard if already logged in) */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            {/* Protected Enterprise Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/work-entries" element={<WorkEntriesPage />} />
                <Route path="/reports" element={<ReportsPage />} />

                {/* Admin-Only Protected Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
