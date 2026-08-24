import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  showBackToHome?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  showBackToHome = true,
}) => {
  return (
    <div className="text-center mb-5 sm:mb-6">
      {showBackToHome && (
        <div className="inline-flex justify-center mb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      )}

      <div className="flex justify-center mb-2.5">
        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-50 dark:ring-blue-950/60">
          <Briefcase className="w-5.5 h-5.5" />
        </div>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
};
