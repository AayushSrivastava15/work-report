import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
      {/* Left: Brand & Mobile Menu */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 tracking-tight text-lg hidden sm:inline leading-none">
              Work Report
            </span>
            <div className="text-[10px] uppercase font-bold text-blue-600 tracking-wider hidden sm:block">
              Enterprise SaaS
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Organization Workspace Badge */}
      {currentUser?.organizationName && (
        <div className="hidden md:flex items-center space-x-2 bg-slate-100/80 border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-2xs">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
            {currentUser.organizationName}
          </span>
          {currentUser.organizationCode && (
            <button
              onClick={copyOrgCode}
              className="inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
              title="Click to copy Company Invite Code"
            >
              <span>{currentUser.organizationCode}</span>
              {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-blue-500" />}
            </button>
          )}
        </div>
      )}

      {/* Right: Actions & Authenticated User Info */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Quick Record Shortcut */}
        <button
          onClick={() => navigate('/work-entries?new=1')}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          title="Record a new work entry"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick Record</span>
        </button>

        {currentUser && (
          <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px] sm:max-w-[150px]">
                  {currentUser.name}
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {currentUser.role === 'ADMIN' ? 'ADMIN' : 'STAFF'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono hidden sm:block leading-tight truncate max-w-[150px]">
                {currentUser.email}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
          title="Sign out of your account"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
