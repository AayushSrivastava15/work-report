import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import {
  Briefcase,
  User,
  Mail,
  Lock,
  Building,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Home,
  UserCheck,
  Users,
  Building2,
  Copy,
  Check,
  KeyRound
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [mode, setMode] = useState<'CREATE_COMPANY' | 'JOIN_TEAM' | 'INDIVIDUAL'>('CREATE_COMPANY');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [organizationCode, setOrganizationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Join Work Report Platform
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Create an organization, join your team, or start a personal workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-md rounded-2xl border border-slate-200/80">
          {/* SUCCESS SCREEN */}
          {isSuccess && registeredUser ? (
            <div className="text-center space-y-5 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {mode === 'CREATE_COMPANY'
                    ? 'Organization Created Successfully!'
                    : mode === 'JOIN_TEAM'
                    ? 'Join Request Submitted!'
                    : 'Personal Workspace Ready!'}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Account for <span className="font-semibold text-slate-800">{registeredUser.email}</span> has been created.
                </p>
              </div>

              {/* Company Admin Invite Code Card */}
              {mode === 'CREATE_COMPANY' && registeredUser.organizationCode && (
                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-blue-900 font-bold uppercase tracking-wider">
                        Your Company Invite Code
                      </div>
                      <div className="text-xs text-blue-700">
                        Share this code with employees who need to join {registeredUser.organizationName}:
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-blue-300">
                    <span className="font-mono text-lg font-bold text-blue-700 tracking-wider flex-1">
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
                  <p className="text-[11px] text-blue-600">
                    You are the primary <strong>Organization Admin</strong>. You will review and approve new team requests.
                  </p>
                </div>
              )}

              {/* Employee Join Team Info */}
              {mode === 'JOIN_TEAM' && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    <span>Awaiting Approval from {registeredUser.organizationName || 'Organization Admin'}</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    Your account is in <strong>Pending</strong> status. Once your company administrator approves your request, you will be able to sign in and access the workspace.
                  </p>
                </div>
              )}

              {/* Individual Info */}
              {mode === 'INDIVIDUAL' && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-left text-xs text-emerald-900">
                  <div className="font-bold mb-1">✓ Instant Access Activated</div>
                  <div>Your private workspace is live. You have full self-management privileges.</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {formErrors.form && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formErrors.form}</span>
                </div>
              )}

              {/* 3-Way Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Workspace Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Create Company */}
                  <button
                    type="button"
                    onClick={() => setMode('CREATE_COMPANY')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      mode === 'CREATE_COMPANY'
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-semibold text-xs text-slate-800">
                      <Building2 className={`w-3.5 h-3.5 ${mode === 'CREATE_COMPANY' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>Create Company</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                      Start a new team & generate code
                    </p>
                  </button>

                  {/* Option 2: Join Team */}
                  <button
                    type="button"
                    onClick={() => setMode('JOIN_TEAM')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      mode === 'JOIN_TEAM'
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-semibold text-xs text-slate-800">
                      <Users className={`w-3.5 h-3.5 ${mode === 'JOIN_TEAM' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>Join Team</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                      Join using Company Code
                    </p>
                  </button>

                  {/* Option 3: Individual */}
                  <button
                    type="button"
                    onClick={() => setMode('INDIVIDUAL')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      mode === 'INDIVIDUAL'
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-semibold text-xs text-slate-800">
                      <UserCheck className={`w-3.5 h-3.5 ${mode === 'INDIVIDUAL' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>Individual</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                      Personal solo workspace
                    </p>
                  </button>
                </div>
              </div>

              {/* Mode-Specific Field 1: Company Name */}
              {mode === 'CREATE_COMPANY' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company / Team Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Corporation or Alpha Labs"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border ${
                        formErrors.companyName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-200'
                      } focus:outline-none focus:ring-2`}
                    />
                  </div>
                  {formErrors.companyName && <p className="text-xs text-rose-500 mt-1">{formErrors.companyName}</p>}
                </div>
              )}

              {/* Mode-Specific Field 2: Organization Code */}
              {mode === 'JOIN_TEAM' && (
                <div className="animate-fade-in bg-blue-50/50 p-3.5 rounded-xl border border-blue-200">
                  <label className="block text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1.5">
                    Company Code <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-blue-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. ALPHA-4827 or STARK-1920"
                      value={organizationCode}
                      onChange={(e) => setOrganizationCode(e.target.value.toUpperCase())}
                      className={`w-full pl-10 pr-3.5 py-2 text-sm font-mono uppercase font-bold rounded-xl border ${
                        formErrors.organizationCode ? 'border-rose-400 focus:ring-rose-200' : 'border-blue-300 focus:ring-blue-200 bg-white'
                      } focus:outline-none focus:ring-2 text-blue-800`}
                    />
                  </div>
                  <p className="text-[11px] text-blue-600 mt-1">
                    Enter the company code provided by your organization administrator.
                  </p>
                  {formErrors.organizationCode && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.organizationCode}</p>
                  )}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border ${
                      formErrors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-200'
                    } focus:outline-none focus:ring-2`}
                  />
                </div>
                {formErrors.name && <p className="text-xs text-rose-500 mt-1">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border ${
                      formErrors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-200'
                    } focus:outline-none focus:ring-2`}
                  />
                </div>
                {formErrors.email && <p className="text-xs text-rose-500 mt-1">{formErrors.email}</p>}
              </div>

              {/* Department (Optional) */}
              {mode !== 'INDIVIDUAL' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department / Division <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Core Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2 text-sm rounded-xl border ${
                      formErrors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-200'
                    } focus:outline-none focus:ring-2`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && <p className="text-xs text-rose-500 mt-1">{formErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border ${
                      formErrors.confirmPassword ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-200'
                    } focus:outline-none focus:ring-2`}
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading
                    ? 'Processing...'
                    : mode === 'CREATE_COMPANY'
                    ? 'Create Company & Get Code'
                    : mode === 'JOIN_TEAM'
                    ? 'Submit Join Request'
                    : 'Create Personal Workspace'}
                </button>
              </div>

              {/* Link to Login */}
              <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
