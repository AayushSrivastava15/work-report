import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { toastNotificationVariants } from '../motion';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string, title = 'Success') => {
      showToast('success', message, title);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, title = 'Error') => {
      showToast('error', message, title, 5000);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title = 'Info') => {
      showToast('info', message, title);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}

      {/* Floating Toasts Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              variants={toastNotificationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border shadow-lg ${
                toast.type === 'success'
                  ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-emerald-500/10'
                  : toast.type === 'error'
                  ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-rose-500/10'
                  : 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 shadow-blue-500/10'
              }`}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-2">
                {toast.title && <div className="text-xs font-bold uppercase tracking-wider mb-0.5">{toast.title}</div>}
                <div className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">{toast.message}</div>
              </div>

              {/* Close Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
