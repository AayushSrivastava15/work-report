import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { AdminRoute } from './auth/AdminRoute';
import { ManagerOrAdminRoute } from './auth/ManagerOrAdminRoute';
import { RootRoute } from './auth/RootRoute';
import { PublicOnlyRoute } from './auth/PublicOnlyRoute';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { MotionProvider, SmoothScrollProvider } from './motion';
import { BackToTop } from './components/common/BackToTop';
import { PageLoader } from './components/common/PageLoader';

// Dynamic lazy-loaded routed page components
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const AcceptInvitePage = lazy(() => import('./pages/AcceptInvitePage').then((m) => ({ default: m.AcceptInvitePage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const WorkEntriesPage = lazy(() => import('./pages/WorkEntriesPage').then((m) => ({ default: m.WorkEntriesPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AdminTeamsPage = lazy(() => import('./pages/AdminTeamsPage').then((m) => ({ default: m.AdminTeamsPage })));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MotionProvider>
        <SmoothScrollProvider>
          <AuthProvider>
            <ToastProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
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
                    <Route
                      path="/reset-password"
                      element={
                        <PublicOnlyRoute>
                          <ResetPasswordPage />
                        </PublicOnlyRoute>
                      }
                    />

                    {/* Team Invitation Acceptance Route */}
                    <Route path="/accept-invite" element={<AcceptInvitePage />} />

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
                </Suspense>
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
