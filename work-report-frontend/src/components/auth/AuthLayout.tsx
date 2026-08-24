import React from 'react';
import { AuthFooter } from './AuthFooter';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-center items-center py-6 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center my-auto">
        {children}
        <AuthFooter />
      </div>
    </div>
  );
};

