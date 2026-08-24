import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, FolderKanban, FileText, FileBarChart, Users, Shield, Settings, X } from 'lucide-react';
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
    {
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 lg:z-20 flex flex-col transition-transform duration-250 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <span className="font-bold text-slate-800 dark:text-white">Work Report</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-4 flex-1 overflow-y-auto" data-lenis-prevent>
          <div>
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </div>
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `relative flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-700 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="sidebarActiveBg"
                          className="absolute inset-0 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 rounded-xl shadow-2xs -z-10"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className={`shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
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
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider px-3 mb-2 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Administration' : 'Team Workspace'}</span>
              </div>
              <div className="space-y-1">
                {(isAdmin ? adminItems : adminItems.filter((i) => i.path === '/admin/teams')).map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      `relative flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-purple-700 dark:text-purple-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="sidebarAdminActiveBg"
                            className="absolute inset-0 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/60 rounded-xl shadow-2xs -z-10"
                            transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                          />
                        )}
                        <span className={`shrink-0 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}>
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
          <div className="font-semibold text-slate-700 dark:text-slate-300">Work Report Enterprise</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Secure JWT &bull; v1.0.0</div>
        </div>
      </aside>
    </>
  );
};
