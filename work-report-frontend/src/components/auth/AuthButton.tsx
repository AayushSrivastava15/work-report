import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  loading = false,
  loadingText = 'Processing...',
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      disabled={disabled || loading}
      className={`w-full h-11 flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
      {...(props as any)}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
