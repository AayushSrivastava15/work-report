import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Mail } from 'lucide-react';
import {
  AuthLayout,
  AuthHeader,
  AuthCard,
  AuthField,
  PasswordField,
  AuthButton,
  AuthAlert,
} from '../components/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          <PasswordField
            id="login-password"
            name="password"
            label="Password"
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
    </AuthLayout>
  );
};

export default LoginPage;
