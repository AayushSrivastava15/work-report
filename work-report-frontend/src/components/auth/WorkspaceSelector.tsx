import React from 'react';
import { motion } from 'motion/react';
import { Building2, Users, UserCheck } from 'lucide-react';

export type WorkspaceMode = 'CREATE_COMPANY' | 'JOIN_TEAM' | 'INDIVIDUAL';

interface WorkspaceSelectorProps {
  mode: WorkspaceMode;
  onChange: (mode: WorkspaceMode) => void;
  disabled?: boolean;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  mode,
  onChange,
  disabled = false,
}) => {
  const options: {
    id: WorkspaceMode;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'CREATE_COMPANY',
      title: 'Create Company',
      description: 'Start team & get code',
      icon: Building2,
    },
    {
      id: 'JOIN_TEAM',
      title: 'Join Team',
      description: 'Join via Company Code',
      icon: Users,
    },
    {
      id: 'INDIVIDUAL',
      title: 'Personal',
      description: 'Solo private workspace',
      icon: UserCheck,
    },
  ];

  return (
    <div className="w-full mb-4">
      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 select-none">
        Workspace Type <span className="text-rose-500 font-bold">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
        {options.map((option) => {
          const isSelected = mode === option.id;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.id}
              type="button"
              disabled={disabled}
              whileTap={!disabled ? { scale: 0.97 } : undefined}
              onClick={() => onChange(option.id)}
              className={`relative group flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition-colors cursor-pointer select-none ${
                isSelected
                  ? 'border-blue-600 dark:border-blue-500 ring-1 ring-blue-600 dark:ring-blue-500 shadow-2xs'
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50/60 dark:hover:bg-slate-800'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isSelected && (
                <motion.div
                  layoutId="workspaceSelectedBg"
                  className="absolute inset-0 bg-blue-50/80 dark:bg-blue-950/60 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <div
                className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-xs font-bold truncate leading-tight ${
                    isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {option.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-normal mt-0.5">
                  {option.description}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
