import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading workspace...',
}) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 transition-opacity duration-200">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 dark:border-blue-400/20 animate-ping absolute" />
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default PageLoader;
