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
import { SettingsPage } from './pages/SettingsPage';

import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminTeamsPage } from './pages/AdminTeamsPage';
import { AdminRoute } from './auth/AdminRoute';
import { ManagerOrAdminRoute } from './auth/ManagerOrAdminRoute';
import { RegisterPage } from './pages/RegisterPage';
import { RootRoute } from './auth/RootRoute';
import { PublicOnlyRoute } from './auth/PublicOnlyRoute';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { MotionProvider, SmoothScrollProvider } from './motion';
import { BackToTop } from './components/common/BackToTop';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MotionProvider>
        <SmoothScrollProvider>
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
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile" element={<SettingsPage />} />

                    {/* Team & Admin Protected Routes */}
                    <Route element={<ManagerOrAdminRoute />}>
                      <Route path="/admin/teams" element={<AdminTeamsPage />} />
                    </Route>

                    {/* Admin-Only Protected Routes */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin/users" element={<AdminUsersPage />} />
                    </Route>
                  </Route>
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <BackToTop />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </SmoothScrollProvider>
    </MotionProvider>
  </ThemeProvider>
  );
};

export default App;
