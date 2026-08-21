import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Briefcase, Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, Home } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your credentials to access your dashboard and work reports
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {/* General error banner */}
          {errors.general && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs font-medium text-rose-800 leading-snug">{errors.general}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Corporate Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  disabled={loading}
                  placeholder="name@company.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:text-slate-500`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  disabled={loading}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border ${
                    errors.password
                      ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:text-slate-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Link to Register */}
            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              New user?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Create an account
              </Link>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Work Report Management System &bull; Secure Enterprise Edition
        </p>
      </div>
    </div>
  );
};
