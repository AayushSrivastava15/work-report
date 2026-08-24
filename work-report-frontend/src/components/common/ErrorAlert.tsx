import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry, className = '' }) => {
  return (
    <div
      className={`bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm ${className}`}
    >
      <div className="flex items-center space-x-3">
        <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 dark:hover:bg-red-900 rounded-md transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Retry
        </button>
      )}
    </div>
  );
};
