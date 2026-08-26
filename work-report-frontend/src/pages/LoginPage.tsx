import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import { Mail, CheckCircle2, Send } from 'lucide-react';
import {
  AuthLayout,
  AuthHeader,
  AuthCard,
  AuthField,
  PasswordField,
  AuthButton,
  AuthAlert,
} from '../components/auth';
import { Modal } from '../components/common/Modal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard or original destination
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await login({
        email: email.trim(),
        password,
      });

      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrors({
        general: err.message || 'Invalid email or password.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showError('Please enter your email address');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await authApi.forgotPassword({ email: forgotEmail.trim() });
      setForgotSuccessMessage(res.message || 'If an account exists, a password reset link has been dispatched.');
      showSuccess('Password reset link sent to your email.');
    } catch (err: any) {
      showError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Sign in to your account"
        subtitle="Enter your credentials to access your dashboard and work reports"
      />

      <AuthCard variant="compact">
        <AuthAlert message={errors.general} type="error" />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Field */}
          <AuthField
            id="login-email"
            name="email"
            type="email"
            label="Corporate Email"
            autoComplete="email"
            autoFocus
            required
            icon={Mail}
            placeholder="name@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            disabled={loading}
            error={errors.email}
          />

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Password
              </span>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotSuccessMessage(null);
                  setShowForgotModal(true);
                }}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <PasswordField
              id="login-password"
              name="password"
              label=""
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              disabled={loading}
              error={errors.password}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-1.5">
            <AuthButton
              type="submit"
              loading={loading}
              loadingText="Signing in..."
            >
              Sign In
            </AuthButton>
          </div>

          {/* Switch to Register */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            New user?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
            >
              Create an account
            </Link>
          </div>
        </form>
      </AuthCard>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Your Password"
      >
        {forgotSuccessMessage ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Email Sent</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              {forgotSuccessMessage}
            </p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Enter your corporate email address. We will send a secure single-use password reset link to your inbox.
            </p>

            <div>
              <label htmlFor="forgot-email" className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={forgotLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-sm"
              >
                {forgotLoading ? (
                  <>Sending Link...</>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Reset Link
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </AuthLayout>
  );
};

export default LoginPage;
