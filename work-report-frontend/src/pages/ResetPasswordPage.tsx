import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import {
  AuthLayout,
  AuthHeader,
  AuthCard,
  PasswordField,
  AuthButton,
  AuthAlert,
} from '../components/auth';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();

  const token = searchParams.get('token') || '';

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setTokenValid(false);
      setTokenError('No password reset token was provided in the URL.');
      return;
    }

    const checkToken = async () => {
      try {
        setValidating(true);
        const res = await authApi.validateResetToken(token);
        if (res.valid) {
          setTokenValid(true);
          setUserEmail(res.email || null);
          setUserName(res.name || null);
        } else {
          setTokenValid(false);
          setTokenError(res.message || 'This reset link is invalid or has expired.');
        }
      } catch (err: any) {
        setTokenValid(false);
        setTokenError(err?.message || 'Failed to validate reset token.');
      } finally {
        setValidating(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
      showSuccess('Your password has been reset successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please try again.');
      showError(err?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Set New Password"
        subtitle={userName ? `Create a new password for ${userName}` : 'Enter your new credentials below'}
      />

      <AuthCard variant="compact">
        {validating ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Validating your reset token...</p>
          </div>
        ) : !tokenValid ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Invalid Reset Link</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              {tokenError || 'This password reset link is invalid, expired, or has already been used.'}
            </p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Password Reset Complete</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <AuthAlert message={error} type="error" />}

            {userEmail && (
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                Resetting password for: <strong className="text-slate-900 dark:text-white">{userEmail}</strong>
              </div>
            )}

            <PasswordField
              id="new-password"
              name="newPassword"
              label="New Password"
              placeholder="At least 6 characters"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />

            <PasswordField
              id="confirm-password"
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="Re-enter new password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            <div className="pt-2">
              <AuthButton type="submit" loading={loading} loadingText="Updating Password...">
                Update Password
              </AuthButton>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
