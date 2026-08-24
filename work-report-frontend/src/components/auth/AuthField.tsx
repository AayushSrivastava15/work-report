import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { validationMessageVariants } from '../../motion';

export interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  rightElement?: React.ReactNode;
  optional?: boolean;
}

export const AuthField: React.FC<AuthFieldProps> = ({
  label,
  error,
  helperText,
  icon: Icon,
  rightElement,
  optional = false,
  id,
  className = '',
  required,
  ...inputProps
}) => {
  const inputId = id || (inputProps.name ? `field-${inputProps.name}` : undefined);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={inputId}
          className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider select-none"
        >
          {label}{' '}
          {required && <span className="text-rose-500 font-bold">*</span>}
          {optional && (
            <span className="text-slate-400 dark:text-slate-500 font-normal normal-case ml-1">(Optional)</span>
          )}
        </label>
      </div>

      <div className="relative rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          required={required}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3.5'} ${
            rightElement ? 'pr-10' : 'pr-3.5'
          } py-2.5 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border transition-all duration-150 ${
            error
              ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          } focus:outline-none disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed ${className}`}
          {...inputProps}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            variants={validationMessageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium leading-tight overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {helperText && !error && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
          {helperText}
        </p>
      )}
    </div>
  );
};
