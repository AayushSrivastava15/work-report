import React from 'react';
import { motion } from 'motion/react';
import { FolderOpen } from 'lucide-react';
import { cardItemVariants } from '../../motion';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = 'py-12',
}) => {
  return (
    <motion.div
      variants={cardItemVariants}
      initial="initial"
      animate="animate"
      className={`flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">{description}</p>}
      {actionLabel && onAction && (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};
