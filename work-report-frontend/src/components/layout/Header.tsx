import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Menu, User, Briefcase, LogOut } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-lg hidden sm:inline">
            Work Report System
          </span>
        </div>
      </div>

      {/* Authenticated User Info & Logout */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {currentUser && (
          <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-xs text-slate-500 font-mono hidden sm:block leading-tight">
                {currentUser.email}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
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
