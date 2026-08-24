import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AuthAlertProps {
  message?: string;
  type?: 'error' | 'warning';
  className?: string;
}

export const AuthAlert: React.FC<AuthAlertProps> = ({
  message,
  type = 'error',
  className = '',
}) => {
  if (!message) return null;

  const bgClasses =
    type === 'error'
      ? 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-200/90 dark:border-rose-800 text-rose-800 dark:text-rose-300'
      : 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-200/90 dark:border-amber-800 text-amber-800 dark:text-amber-300';
  const iconColor = type === 'error' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400';

  return (
    <div
      role="alert"
      className={`mb-4 p-3 rounded-xl border flex items-start gap-2.5 text-xs font-medium leading-snug animate-fade-in ${bgClasses} ${className}`}
    >
      <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
      <span className="flex-1">{message}</span>
    </div>
  );
};
