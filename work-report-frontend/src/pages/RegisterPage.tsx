import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  Building,
  Building2,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import {
  AuthLayout,
  AuthHeader,
  AuthCard,
  AuthField,
  PasswordField,
  WorkspaceSelector,
  type WorkspaceMode,
  AuthButton,
  AuthAlert,
} from '../components/auth';
import { motion, AnimatePresence } from 'motion/react';
import { tabContentVariants } from '../motion';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [mode, setMode] = useState<WorkspaceMode>('CREATE_COMPANY');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [organizationCode, setOrganizationCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const clearFieldError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (mode === 'CREATE_COMPANY' && !companyName.trim()) {
      errors.companyName = 'Company / Organization name is required';
    }

    if (mode === 'JOIN_TEAM' && !organizationCode.trim()) {
      errors.organizationCode = 'Company Code is required to join a team';
    }

    if (!name.trim()) errors.name = 'Full name is required';
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setFormErrors({});

      const response = await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        department: department.trim() || undefined,
        registrationMode: mode,
        companyName: mode === 'CREATE_COMPANY' ? companyName.trim() : undefined,
        organizationCode: mode === 'JOIN_TEAM' ? organizationCode.trim().toUpperCase() : undefined,
      });

      setRegisteredUser(response);
      setIsSuccess(true);

      if (mode === 'CREATE_COMPANY') {
        showSuccess(`Company "${response.organizationName}" created with code ${response.organizationCode}!`, 'Company Registered');
      } else if (mode === 'JOIN_TEAM') {
        showSuccess('Join request submitted to company administrator.', 'Request Submitted');
      } else {
        showSuccess('Personal workspace created! You can now log in.', 'Workspace Ready');
      }
    } catch (err: any) {
      const fieldErrors = err.fieldErrors || {};
      const errorMessage = err.message || 'Failed to create account. Please verify your details.';
      setFormErrors({ ...fieldErrors, form: errorMessage });
      showError(errorMessage, 'Registration Error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Join Work Report Platform"
        subtitle="Create an organization, join your team, or start a personal workspace"
      />

      <AuthCard variant="wide">
        {/* SUCCESS SCREEN */}
        {isSuccess && registeredUser ? (
          <div className="text-center space-y-5 py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200/80 dark:border-emerald-800 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {mode === 'CREATE_COMPANY'
                  ? 'Organization Created Successfully!'
                  : mode === 'JOIN_TEAM'
                  ? 'Join Request Submitted!'
                  : 'Personal Workspace Ready!'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Account for <span className="font-semibold text-slate-800 dark:text-slate-200">{registeredUser.email}</span> has been created.
              </p>
            </div>

            {/* Company Admin Invite Code Card */}
            {mode === 'CREATE_COMPANY' && registeredUser.organizationCode && (
              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/50 rounded-xl border border-blue-200/90 dark:border-blue-800 text-left space-y-2.5">
                <div>
                  <div className="text-[11px] text-blue-900 dark:text-blue-300 font-bold uppercase tracking-wider">
                    Your Company Invite Code
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                    Share this code with employees who need to join{' '}
                    <span className="font-semibold">{registeredUser.organizationName}</span>:
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-blue-300 dark:border-blue-700 shadow-2xs">
                  <span className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300 tracking-wider flex-1">
                    {registeredUser.organizationCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(registeredUser.organizationCode)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <p className="text-[11px] text-blue-600 dark:text-blue-400">
                  You are the primary <strong>Organization Admin</strong>. You will review and approve new team requests.
                </p>
              </div>
            )}

            {/* Employee Join Team Info */}
            {mode === 'JOIN_TEAM' && (
              <div className="p-4 bg-amber-50/90 dark:bg-amber-950/50 rounded-xl border border-amber-200/90 dark:border-amber-800 text-left text-xs text-amber-900 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Awaiting Approval from {registeredUser.organizationName || 'Organization Admin'}</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-[11px] sm:text-xs">
                  Your account is in <strong>Pending</strong> status. Once your company administrator approves your request, you will be able to sign in and access the workspace.
                </p>
              </div>
            )}

            {/* Individual Info */}
            {mode === 'INDIVIDUAL' && (
              <div className="p-4 bg-emerald-50/90 dark:bg-emerald-950/50 rounded-xl border border-emerald-200/90 dark:border-emerald-800 text-left text-xs text-emerald-900 dark:text-emerald-300">
                <div className="font-bold mb-1">✓ Instant Access Activated</div>
                <p className="text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs">
                  Your private workspace is live. You have full self-management privileges.
                </p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <AuthAlert message={formErrors.form} type="error" />

            {/* Mode Selector */}
            <WorkspaceSelector
              mode={mode}
              onChange={(newMode) => {
                setMode(newMode);
                setFormErrors({});
              }}
              disabled={loading}
            />

            {/* Dynamic Form Content by Mode */}
            <AnimatePresence mode="wait">
              {/* Mode: CREATE_COMPANY */}
              {mode === 'CREATE_COMPANY' && (
                <motion.div
                  key="CREATE_COMPANY"
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5"
                >
                  <AuthField
                    id="reg-company-name"
                    name="companyName"
                    label="Company / Team Name"
                    icon={Building2}
                    required
                    placeholder="e.g. Acme Corporation or Alpha Labs"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      clearFieldError('companyName');
                    }}
                    disabled={loading}
                    error={formErrors.companyName}
                  />

                  <AuthField
                    id="reg-name"
                    name="name"
                    label="Full Name"
                    icon={User}
                    required
                    autoComplete="name"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError('name');
                    }}
                    disabled={loading}
                    error={formErrors.name}
                  />

                  <AuthField
                    id="reg-email"
                    name="email"
                    type="email"
                    label="Email Address"
                    icon={Mail}
                    required
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError('email');
                    }}
                    disabled={loading}
                    error={formErrors.email}
                  />

                  <AuthField
                    id="reg-department"
                    name="department"
                    label="Department / Division"
                    icon={Building}
                    optional
                    placeholder="e.g. Core Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={loading}
                  />

                  <PasswordField
                    id="reg-password"
                    name="password"
                    label="Password"
                    autoComplete="new-password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                    }}
                    disabled={loading}
                    error={formErrors.password}
                  />

                  <PasswordField
                    id="reg-confirm-password"
                    name="confirmPassword"
                    label="Confirm Password"
                    autoComplete="new-password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError('confirmPassword');
                    }}
                    disabled={loading}
                    error={formErrors.confirmPassword}
                  />
                </motion.div>
              )}

              {/* Mode: JOIN_TEAM */}
              {mode === 'JOIN_TEAM' && (
                <motion.div
                  key="JOIN_TEAM"
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-3.5"
                >
                  <div className="p-3 sm:p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200/90 dark:border-blue-800">
                    <AuthField
                      id="reg-org-code"
                      name="organizationCode"
                      label="Company Code"
                      icon={KeyRound}
                      required
                      placeholder="e.g. ALPHA-4827 or STARK-1920"
                      value={organizationCode}
                      onChange={(e) => {
                        setOrganizationCode(e.target.value.toUpperCase());
                        clearFieldError('organizationCode');
                      }}
                      disabled={loading}
                      error={formErrors.organizationCode}
                      className="font-mono uppercase font-bold text-blue-800 dark:text-blue-300 tracking-wider"
                      helperText="Enter the company code provided by your organization administrator."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5">
                    <AuthField
                      id="reg-name"
                      name="name"
                      label="Full Name"
                      icon={User}
                      required
                      autoComplete="name"
                      placeholder="e.g. Jane Doe"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearFieldError('name');
                      }}
                      disabled={loading}
                      error={formErrors.name}
                    />

                    <AuthField
                      id="reg-email"
                      name="email"
                      type="email"
                      label="Email Address"
                      icon={Mail}
                      required
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearFieldError('email');
                      }}
                      disabled={loading}
                      error={formErrors.email}
                    />

                    <AuthField
                      id="reg-department"
                      name="department"
                      label="Department / Division"
                      icon={Building}
                      optional
                      placeholder="e.g. Core Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={loading}
                    />

                    <PasswordField
                      id="reg-password"
                      name="password"
                      label="Password"
                      autoComplete="new-password"
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearFieldError('password');
                      }}
                      disabled={loading}
                      error={formErrors.password}
                    />

                    <div className="md:col-span-2">
                      <PasswordField
                        id="reg-confirm-password"
                        name="confirmPassword"
                        label="Confirm Password"
                        autoComplete="new-password"
                        required
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          clearFieldError('confirmPassword');
                        }}
                        disabled={loading}
                        error={formErrors.confirmPassword}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mode: INDIVIDUAL */}
              {mode === 'INDIVIDUAL' && (
                <motion.div
                  key="INDIVIDUAL"
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5"
                >
                  <AuthField
                    id="reg-name"
                    name="name"
                    label="Full Name"
                    icon={User}
                    required
                    autoComplete="name"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError('name');
                    }}
                    disabled={loading}
                    error={formErrors.name}
                  />

                  <AuthField
                    id="reg-email"
                    name="email"
                    type="email"
                    label="Email Address"
                    icon={Mail}
                    required
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError('email');
                    }}
                    disabled={loading}
                    error={formErrors.email}
                  />

                  <PasswordField
                    id="reg-password"
                    name="password"
                    label="Password"
                    autoComplete="new-password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                    }}
                    disabled={loading}
                    error={formErrors.password}
                  />

                  <PasswordField
                    id="reg-confirm-password"
                    name="confirmPassword"
                    label="Confirm Password"
                    autoComplete="new-password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError('confirmPassword');
                    }}
                    disabled={loading}
                    error={formErrors.confirmPassword}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="pt-2">
              <AuthButton
                type="submit"
                loading={loading}
                loadingText={
                  mode === 'CREATE_COMPANY'
                    ? 'Creating Company...'
                    : mode === 'JOIN_TEAM'
                    ? 'Submitting Request...'
                    : 'Creating Workspace...'
                }
              >
                {mode === 'CREATE_COMPANY'
                  ? 'Create Company & Get Code'
                  : mode === 'JOIN_TEAM'
                  ? 'Submit Join Request'
                  : 'Create Personal Workspace'}
              </AuthButton>
            </div>

            {/* Switch to Login */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default RegisterPage;
