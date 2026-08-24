import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading data...',
  className = 'py-12',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
