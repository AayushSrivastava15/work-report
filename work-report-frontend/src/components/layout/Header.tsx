import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Menu, User, Briefcase, LogOut, Plus, Building2, Copy, Check } from 'lucide-react';
interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const copyOrgCode = () => {
    if (currentUser?.organizationCode) {
      navigator.clipboard.writeText(currentUser.organizationCode);
      setCopiedCode(true);
      showSuccess(`Company code ${currentUser.organizationCode} copied to clipboard!`, 'Code Copied');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs transition-colors">
      {/* Left: Brand & Mobile Menu */}
      <div className="flex items-center space-x-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 dark:text-white tracking-tight text-lg hidden sm:inline leading-none">
              Work Report
            </span>
            <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider hidden sm:block">
              Enterprise SaaS
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Organization Workspace Badge */}
      {currentUser?.organizationName && (
        <div className="hidden md:flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3 py-1.5 shadow-2xs">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
            {currentUser.organizationName}
          </span>
          {currentUser.organizationCode && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={copyOrgCode}
              className="inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
              title="Click to copy Company Invite Code"
            >
              <span>{currentUser.organizationCode}</span>
              <AnimatePresence mode="wait" initial={false}>
                {copiedCode ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Copy className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      )}

      {/* Right: Actions & Authenticated User Info */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* Quick Record Shortcut */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate('/work-entries?new=1')}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          title="Record a new work entry"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick Record</span>
        </motion.button>


        {currentUser && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3 py-1.5 shadow-2xs cursor-pointer transition-colors"
            title="Account & Profile Settings"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
            )}
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[120px] sm:max-w-[150px]">
                  {currentUser.name}
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                      : 'bg-slate-200/70 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {currentUser.role === 'ADMIN' ? 'ADMIN' : 'STAFF'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:block leading-tight truncate max-w-[150px]">
                {currentUser.email}
              </div>
            </div>
          </motion.div>
        )}

        {/* User profile badge */}

        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleLogout}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg transition-colors cursor-pointer shadow-2xs"
          title="Sign out of your account"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </header>
  );
};

