import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { teamApi } from '../api/teamApi';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users, Building2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import {
  AuthLayout,
  AuthHeader,
  AuthCard,
  AuthButton,
  AuthAlert,
} from '../components/auth';

export const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const token = searchParams.get('token') || '';

  const [validating, setValidating] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setInviteValid(false);
      setTokenError('No invitation token was provided in the link.');
      return;
    }

    const checkInvite = async () => {
      try {
        setValidating(true);
        const res = await teamApi.validateInvitation(token);
        if (res.valid) {
          setInviteValid(true);
          setInviteEmail(res.email || null);
          setTeamName(res.teamName || null);
          setOrganizationName(res.organizationName || null);
          setRole(res.role || 'MEMBER');
        } else {
          setInviteValid(false);
          setTokenError(res.message || 'This invitation is invalid or has expired.');
        }
      } catch (err: any) {
        setInviteValid(false);
        setTokenError(err?.message || 'Failed to validate invitation.');
      } finally {
        setValidating(false);
      }
    };

    checkInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    try {
      setAccepting(true);
      setError(null);
      await teamApi.acceptInvitation(token);
      setAccepted(true);
      showSuccess(`You have joined ${teamName || 'the team'} successfully!`);
    } catch (err: any) {
      setError(err?.message || 'Failed to accept invitation.');
      showError(err?.message || 'Failed to accept invitation.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Team Invitation"
        subtitle="You've been invited to collaborate on Work Report"
      />

      <AuthCard variant="compact">
        {validating ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Verifying your invitation...</p>
          </div>
        ) : !inviteValid ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Invitation Unavailable</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              {tokenError || 'This team invitation link is invalid, expired, or has already been accepted.'}
            </p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : accepted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Welcome to the Team!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              You are now an active member of <strong>{teamName}</strong> at <strong>{organizationName}</strong>.
            </p>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && <AuthAlert message={error} type="error" />}

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{teamName}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{organizationName}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Invited Role:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{role}</span>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="pt-2">
                <AuthButton
                  type="button"
                  onClick={handleAccept}
                  loading={accepting}
                  loadingText="Joining Team..."
                >
                  Accept & Join Team
                </AuthButton>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                  To accept this invitation, please sign in to your Work Report account or create a new account.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                    className="w-full text-center py-2.5 px-3 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to={`/register?email=${encodeURIComponent(inviteEmail || '')}`}
                    className="w-full text-center py-2.5 px-3 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default AcceptInvitePage;
