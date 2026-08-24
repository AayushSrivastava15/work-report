import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  ShieldCheck,
  Building2,
  Mail,
  Briefcase,
  Building,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Check,
  Copy,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  FileText,
  Users,
  Layers,
  Info,
  Palette,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { userProfileApi } from '../api/userProfileApi';
import { organizationApi } from '../api/organizationApi';
import type {
  OrganizationDetailsResponse,
  UserProfileUpdateRequest,
  ChangePasswordRequest,
} from '../types';
import { Modal } from '../components/common/Modal';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { tabContentVariants, cardItemVariants, staggerContainerVariants } from '../motion';

type SettingsTab = 'PROFILE' | 'APPEARANCE' | 'SECURITY' | 'ORGANIZATION';

const AVATAR_PRESETS = [
  { name: 'Ocean', bg: 'bg-gradient-to-tr from-blue-600 to-cyan-400', text: 'text-white' },
  { name: 'Indigo', bg: 'bg-gradient-to-tr from-indigo-600 to-purple-500', text: 'text-white' },
  { name: 'Emerald', bg: 'bg-gradient-to-tr from-emerald-600 to-teal-400', text: 'text-white' },
  { name: 'Sunset', bg: 'bg-gradient-to-tr from-rose-500 to-amber-400', text: 'text-white' },
  { name: 'Midnight', bg: 'bg-gradient-to-tr from-slate-900 to-slate-700', text: 'text-white' },
];

export const SettingsPage: React.FC = () => {
  const { currentUser, updateCurrentUser, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (searchParams.get('tab')?.toUpperCase() as SettingsTab) || 'PROFILE';
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    ['PROFILE', 'APPEARANCE', 'SECURITY', 'ORGANIZATION'].includes(initialTab) ? initialTab : 'PROFILE'
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTabChange = (newTab: SettingsTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab.toLowerCase() }, { replace: true });
  };

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});

  // Organization State (Admin)
  const [orgDetails, setOrgDetails] = useState<OrganizationDetailsResponse | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [savingOrg, setSavingOrg] = useState(false);
  const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);
  const [rotatingCode, setRotatingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync profile form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setDepartment(currentUser.department || '');
      setDesignation(currentUser.designation || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  const fetchOrgDetails = useCallback(async () => {
    try {
      setLoadingOrg(true);
      const data = await organizationApi.getOrganizationDetails();
      setOrgDetails(data);
      setOrgName(data.name);
    } catch (err: any) {
      showError(err.message || 'Failed to load organization settings');
    } finally {
      setLoadingOrg(false);
    }
  }, [showError]);

  // Load organization details if on Organization tab or if admin
  useEffect(() => {
    if (activeTab === 'ORGANIZATION' && isAdmin) {
      fetchOrgDetails();
    }
  }, [activeTab, isAdmin, fetchOrgDetails]);

  // Profile Photo Upload Handling
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 500KB for base64 storage)
    if (file.size > 500 * 1024) {
      showError('Avatar file size must be less than 500KB. Please select a smaller image.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectPresetAvatar = (preset: typeof AVATAR_PRESETS[0]) => {
    // Generate a clean SVG Data URL with the preset background
    const initials = name ? name.charAt(0).toUpperCase() : 'U';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${preset.name === 'Sunset' ? '#f43f5e' : preset.name === 'Emerald' ? '#059669' : preset.name === 'Indigo' ? '#4f46e5' : preset.name === 'Midnight' ? '#0f172a' : '#2563eb'}"/>
          <stop offset="100%" stop-color="${preset.name === 'Sunset' ? '#fbbf24' : preset.name === 'Emerald' ? '#2dd4bf' : preset.name === 'Indigo' ? '#a855f7' : preset.name === 'Midnight' ? '#334155' : '#22d3ee'}"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="24" fill="url(#grad)"/>
      <text x="50%" y="54%" font-family="system-ui, sans-serif" font-size="52" font-weight="bold" fill="#ffffff" dominant-baseline="middle" text-anchor="middle">${initials}</text>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setAvatarUrl(dataUrl);
  };

  // Submit Profile Form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!name.trim()) {
      showError('Name cannot be empty');
      return;
    }

    try {
      setSavingProfile(true);
      const updateData: UserProfileUpdateRequest = {
        name: name.trim(),
        department: department.trim() || undefined,
        designation: designation.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
      };

      const updatedUser = await userProfileApi.updateProfile(currentUser.id, updateData);
      updateCurrentUser(updatedUser);
      showSuccess('Your profile details have been saved successfully!', 'Profile Updated');
    } catch (err: any) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Password Strength Calculation
  const calculatePasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 20;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^A-Za-z0-9]/.test(pass)) score += 15;

    if (score < 40) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score < 75) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passStrength = calculatePasswordStrength(newPassword);

  // Submit Password Form
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) errors.newPassword = 'New password is required';
    else if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters long';
    if (!confirmPassword) errors.confirmPassword = 'Confirm password is required';
    else if (newPassword !== confirmPassword) errors.confirmPassword = 'New passwords do not match';

    setPassErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setChangingPass(true);
      const req: ChangePasswordRequest = {
        currentPassword,
        newPassword,
        confirmPassword,
      };

      await userProfileApi.changePassword(currentUser.id, req);
      showSuccess('Your password has been changed successfully.', 'Password Changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPassErrors({});
    } catch (err: any) {
      showError(err.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  // Submit Organization Name
  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      showError('Organization name cannot be empty');
      return;
    }

    try {
      setSavingOrg(true);
      const updated = await organizationApi.updateOrganization({ name: orgName.trim() });
      setOrgDetails(updated);
      updateCurrentUser({ organizationName: updated.name });
      showSuccess('Company settings updated successfully!', 'Organization Saved');
    } catch (err: any) {
      showError(err.message || 'Failed to update organization');
    } finally {
      setSavingOrg(false);
    }
  };

  // Rotate Organization Code
  const handleRotateOrgCode = async () => {
    try {
      setRotatingCode(true);
      const updated = await organizationApi.rotateOrganizationCode();
      setOrgDetails(updated);
      updateCurrentUser({ organizationCode: updated.code });
      setIsRotateModalOpen(false);
      showSuccess(`New Company Code is: ${updated.code}`, 'Company Code Rotated');
    } catch (err: any) {
      showError(err.message || 'Failed to rotate company code');
    } finally {
      setRotatingCode(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showSuccess(`Code ${code} copied to clipboard!`, 'Copied');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Avatar Profile Preview */}
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name || 'Profile'}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/40"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-2 ring-blue-100 dark:ring-blue-900/40">
                  {name ? name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[9px] font-black uppercase rounded-md shadow-xs ${
                  currentUser?.role === 'ADMIN'
                    ? 'bg-purple-600 text-white'
                    : currentUser?.isManager
                    ? 'bg-indigo-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {currentUser?.role === 'ADMIN' ? 'ADMIN' : currentUser?.isManager ? 'MGR' : 'STAFF'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                  {currentUser?.name || 'User Profile'}
                </h1>
                {currentUser?.status === 'ACTIVE' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>{currentUser?.email}</span>
                {currentUser?.organizationName && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.organizationName}</span>
                  </>
                )}
                {currentUser?.teamName && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentUser.teamName}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="hidden sm:flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3">
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Workspace Type
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>
                  {currentUser?.organizationType === 'INDIVIDUAL'
                    ? 'Solo Freelancer'
                    : 'Corporate Organization'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation with Shared Layout Indicator */}
        <div className="flex items-center space-x-1 border-t border-slate-100 dark:border-slate-800 mt-6 pt-3 overflow-x-auto">
          {[
            { id: 'PROFILE', label: 'My Profile', icon: User },
            { id: 'APPEARANCE', label: 'Appearance & Theme', icon: Palette },
            { id: 'SECURITY', label: 'Security & Password', icon: ShieldCheck },
            ...(isAdmin
              ? [{ id: 'ORGANIZATION', label: 'Organization & Workspace', icon: Building2 }]
              : []),
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as SettingsTab)}
                className={`relative flex items-center space-x-2 px-4 py-2 text-xs font-bold transition-colors cursor-pointer select-none rounded-xl ${
                  isActive
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="settingsTabIndicator"
                    className="absolute inset-0 bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/90 dark:border-blue-800/60 rounded-xl -z-10 shadow-2xs"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {/* ===================== TAB 1: PROFILE ===================== */}
        {activeTab === 'PROFILE' && (
          <motion.div
            key="PROFILE"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Photo Section */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Profile Avatar & Visuals
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize your photo or choose from modern vibrant color presets.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Big Preview */}
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-md">
                        {name ? name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
                      </div>
                    )}
                  </div>

                  {/* Actions & Presets */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarFileChange}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload New Photo
                      </motion.button>

                      {avatarUrl && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove Photo
                        </motion.button>
                      )}
                    </div>

                    {/* Gradient Presets */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                        Or pick an illustrated gradient avatar:
                      </span>
                      <div className="flex items-center space-x-2">
                        {AVATAR_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleSelectPresetAvatar(preset)}
                            className={`w-7 h-7 rounded-lg ${preset.bg} shadow-2xs hover:scale-110 transition-transform cursor-pointer flex items-center justify-center text-white text-xs font-black border border-white dark:border-slate-800`}
                            title={preset.name}
                          >
                            {name ? name.charAt(0).toUpperCase() : 'U'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details Form */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Personal & Professional Information
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Update your display name, department, title, and public notes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Full Display Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Email Address (Read-only) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Corporate Email
                      </label>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Verified
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                      <input
                        type="email"
                        disabled
                        value={currentUser?.email || ''}
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 cursor-not-allowed font-mono"
                      />
                    </div>
                  </div>

                  {/* Designation / Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Designation / Job Title
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Senior Fullstack Engineer"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Department / Division
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Core Engineering & Platform"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio / About */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Professional Bio / About Me
                    </label>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      {bio.length}/1000
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your responsibilities, technical interests, or project focus..."
                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {savingProfile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* ===================== TAB 2: APPEARANCE & THEME ===================== */}
        {activeTab === 'APPEARANCE' && (
          <motion.div
            key="APPEARANCE"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Color Theme & Interface Appearance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose how Work Report looks to you. Select a light or dark theme, or sync with your system.
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Active: {resolvedTheme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
                </span>
              </div>

              {/* Visual Theme Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Light Theme Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme('light')}
                  className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    theme === 'light'
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Mockup Preview */}
                  <div className="w-full h-28 rounded-xl bg-white border border-slate-200 p-2.5 shadow-2xs mb-4 flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="w-12 h-2 rounded bg-slate-200" />
                    </div>
                    <div className="flex gap-2 flex-1 pt-2">
                      <div className="w-1/4 h-full bg-slate-100 rounded-lg" />
                      <div className="flex-1 space-y-1.5">
                        <div className="w-full h-3 bg-blue-50 rounded border border-blue-100" />
                        <div className="w-3/4 h-2.5 bg-slate-100 rounded" />
                        <div className="w-1/2 h-2.5 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-2xs">
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">Light Mode</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Crisp bright workspace</div>
                      </div>
                    </div>

                    {theme === 'light' && (
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Dark Theme Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme('dark')}
                  className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Mockup Preview */}
                  <div className="w-full h-28 rounded-xl bg-slate-950 border border-slate-800 p-2.5 shadow-2xs mb-4 flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <div className="w-12 h-2 rounded bg-slate-800" />
                    </div>
                    <div className="flex gap-2 flex-1 pt-2">
                      <div className="w-1/4 h-full bg-slate-900 rounded-lg border border-slate-800/60" />
                      <div className="flex-1 space-y-1.5">
                        <div className="w-full h-3 bg-blue-950/80 rounded border border-blue-800/60" />
                        <div className="w-3/4 h-2.5 bg-slate-800 rounded" />
                        <div className="w-1/2 h-2.5 bg-slate-800 rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center shadow-2xs border border-blue-900/50">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">Dark Mode</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Easy on the eyes</div>
                      </div>
                    </div>

                    {theme === 'dark' && (
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* System Preference Card */}
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme('system')}
                  className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    theme === 'system'
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Mockup Preview */}
                  <div className="w-full h-28 rounded-xl bg-gradient-to-r from-white to-slate-950 border border-slate-300 dark:border-slate-700 p-2.5 shadow-2xs mb-4 flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="w-12 h-2 rounded bg-slate-400/50" />
                    </div>
                    <div className="flex gap-2 flex-1 pt-2">
                      <div className="w-1/4 h-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      <div className="flex-1 space-y-1.5">
                        <div className="w-full h-3 bg-blue-500/30 rounded" />
                        <div className="w-3/4 h-2.5 bg-slate-300 dark:bg-slate-700 rounded" />
                        <div className="w-1/2 h-2.5 bg-slate-300 dark:bg-slate-700 rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-2xs">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">System Preference</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Auto-sync ({resolvedTheme})
                        </div>
                      </div>
                    </div>

                    {theme === 'system' && (
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Status Note */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold block text-slate-800 dark:text-white mb-0.5">
                    Fast Header Toggle Available
                  </span>
                  You can also switch themes instantly at any time by clicking the theme toggle icon (☀️/🌙) in the top header bar next to your profile.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================== TAB 3: SECURITY & PASSWORD ===================== */}
        {activeTab === 'SECURITY' && (
          <motion.div
            key="SECURITY"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Change Account Password
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (passErrors.currentPassword) {
                          setPassErrors((prev) => ({ ...prev, currentPassword: '' }));
                        }
                      }}
                      placeholder="Enter your current password"
                      className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border ${
                        passErrors.currentPassword ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-300'
                      } focus:outline-none focus:ring-2`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passErrors.currentPassword && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{passErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passErrors.newPassword) {
                          setPassErrors((prev) => ({ ...prev, newPassword: '' }));
                        }
                      }}
                      placeholder="Min 6 characters (e.g. Pass@123)"
                      className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border ${
                        passErrors.newPassword ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-300'
                      } focus:outline-none focus:ring-2`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passErrors.newPassword && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{passErrors.newPassword}</p>
                  )}

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{passStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passStrength.score}%` }}
                          className={`h-full ${passStrength.color} rounded-full`}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passErrors.confirmPassword) {
                          setPassErrors((prev) => ({ ...prev, confirmPassword: '' }));
                        }
                      }}
                      placeholder="Re-enter your new password"
                      className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border ${
                        passErrors.confirmPassword ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 dark:border-slate-700 focus:ring-blue-300'
                      } focus:outline-none focus:ring-2`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passErrors.confirmPassword && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{passErrors.confirmPassword}</p>
                  )}
                  {newPassword && confirmPassword && newPassword === confirmPassword && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-2 flex justify-end">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={changingPass}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {changingPass ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Security Advisory Card */}
              <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200/90 dark:border-blue-800/60 p-5 flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-blue-600 dark:bg-blue-500 text-white shrink-0 shadow-2xs">
                  <Info className="w-4 h-4" />
                </div>
                <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  <span className="font-bold block mb-0.5">Password Best Practices</span>
                  Use at least 8 characters with a mix of uppercase letters, numbers, and symbols. Never share your password or reuse credentials across external websites.
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* ===================== TAB 4: ORGANIZATION (ADMIN ONLY) ===================== */}
        {activeTab === 'ORGANIZATION' && isAdmin && (
          <motion.div
            key="ORGANIZATION"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            {loadingOrg ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                <div className="w-8 h-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Loading organization settings...</p>
              </div>
            ) : (
              <>
                {/* Organization Details Form */}
                <form onSubmit={handleSaveOrganization} className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-5">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Company & Workspace Information
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Manage organization branding and invite codes for employee registrations.
                        </p>
                      </div>
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {orgDetails?.plan || 'Enterprise Pro'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Organization Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Company / Workspace Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="e.g. Acme Global Corporation"
                          className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                        />
                      </div>

                      {/* Workspace Type */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Workspace Mode
                        </label>
                        <input
                          type="text"
                          disabled
                          value={
                            orgDetails?.type === 'INDIVIDUAL'
                              ? 'Solo Professional Workspace'
                              : 'Multi-User Corporate Team'
                          }
                          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>

                    {/* Company Code Box */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/90 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                          Company Registration Invite Code
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          New staff members use this code during registration to join your workspace.
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-black text-sm text-blue-700 dark:text-blue-400 tracking-wider">
                          {orgDetails?.code || 'N/A'}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          type="button"
                          onClick={() => orgDetails?.code && copyCode(orgDetails.code)}
                          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Copy Company Code"
                        >
                          {copiedCode ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          type="button"
                          onClick={() => setIsRotateModalOpen(true)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Rotate Code
                        </motion.button>
                      </div>
                    </div>

                    {/* Save Org Name */}
                    <div className="pt-2 flex justify-end">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={savingOrg}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        {savingOrg ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving Company Settings...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Save Company Settings</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </form>

                {/* Workspace Statistics Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Workspace Health & Metrics
                  </h4>
                  <motion.div
                    variants={staggerContainerVariants}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3.5"
                  >
                    <motion.div
                      variants={cardItemVariants}
                      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Total Members</span>
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-2xl font-black text-slate-800 dark:text-white">
                        <AnimatedNumber value={orgDetails?.totalMembers || 0} />
                      </div>
                    </motion.div>

                    <motion.div
                      variants={cardItemVariants}
                      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Active Teams</span>
                        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400">
                        <AnimatedNumber value={orgDetails?.totalTeams || 0} />
                      </div>
                    </motion.div>

                    <motion.div
                      variants={cardItemVariants}
                      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Projects</span>
                        <FolderKanban className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                        <AnimatedNumber value={orgDetails?.totalProjects || 0} />
                      </div>
                    </motion.div>

                    <motion.div
                      variants={cardItemVariants}
                      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Total Reports</span>
                        <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-2xl font-black text-purple-700 dark:text-purple-400">
                        <AnimatedNumber value={orgDetails?.totalReports || 0} />
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROTATE CODE CONFIRMATION MODAL */}
      <Modal
        isOpen={isRotateModalOpen}
        onClose={() => setIsRotateModalOpen(false)}
        title="Rotate Company Invite Code"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <span className="font-bold block mb-1">Important Notice</span>
              Rotating the company invite code will immediately invalidate the existing code (
              <span className="font-mono font-bold">{orgDetails?.code}</span>). Existing active members
              will NOT lose access, but any pending new registrations will need the new code.
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to generate a new Company Invite Code?
          </p>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRotateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              disabled={rotatingCode}
              onClick={handleRotateOrgCode}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              {rotatingCode ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Code...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm & Rotate Code</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
