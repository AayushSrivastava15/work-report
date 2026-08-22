import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, FileText, FileBarChart, Users, Shield, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin, isManager } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Projects',
      path: '/projects',
      icon: <FolderKanban className="w-5 h-5" />,
    },
    {
      label: 'Work Entries',
      path: '/work-entries',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: <FileBarChart className="w-5 h-5" />,
    },
  ];

  const adminItems = [
    {
      label: 'Team Management',
      path: '/admin/teams',
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: 'User Management',
      path: '/admin/users',
      icon: <Shield className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 z-50 lg:z-20 transition-transform duration-200 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden">
          <span className="font-bold text-slate-800">Work Report</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </div>
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Admin & Manager Navigation Section */}
          {(isAdmin || isManager) && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider px-3 mb-2 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Administration' : 'Team Workspace'}</span>
              </div>
              <div className="space-y-1">
                {(isAdmin ? adminItems : adminItems.filter(i => i.path === '/admin/teams')).map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-purple-50 text-purple-700 font-semibold shadow-2xs border border-purple-100'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={isActive ? 'text-purple-600' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* System info footer */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
          <div className="font-semibold text-slate-700">Work Report Enterprise</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Secure JWT &bull; v1.0.0</div>
        </div>
      </aside>
    </>
  );
};
