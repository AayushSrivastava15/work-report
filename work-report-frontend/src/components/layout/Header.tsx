import React from 'react';
import { useUser } from '../../context/UserContext';
import { Menu, User, Briefcase } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUserId, users, setCurrentUserId, currentUser } = useUser();

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

      {/* User Switcher (Centralized User Management) */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
          <User className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:inline">
            Active User:
          </span>
          <select
            value={currentUserId}
            onChange={(e) => setCurrentUserId(Number(e.target.value))}
            className="bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} (ID: {u.id})
              </option>
            ))}
          </select>
        </div>

        {currentUser && (
          <div className="hidden lg:block text-right">
            <div className="text-xs text-slate-500 font-mono">{currentUser.email}</div>
          </div>
        )}
      </div>
    </header>
  );
};
