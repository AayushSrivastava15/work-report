import React from 'react';
import { motion } from 'motion/react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  badge?: string;
}

interface AnimatedTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  layoutId?: string;
  variant?: 'underline' | 'pill' | 'bordered';
  className?: string;
}

export function AnimatedTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  layoutId = 'activeTabIndicator',
  variant = 'underline',
  className = '',
}: AnimatedTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={`flex items-center space-x-1 ${
        variant === 'underline'
          ? 'border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px'
          : variant === 'pill'
          ? 'bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl max-w-fit border border-slate-200/80 dark:border-slate-700/80'
          : 'border-b border-slate-200 dark:border-slate-800 overflow-x-auto'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'pill') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer select-none flex items-center space-x-1.5 ${
                isActive ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId={`${layoutId}-pill`}
                  className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-2xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        // Default 'underline' or 'bordered'
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap select-none ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 rounded-t-lg'
            }`}
          >
            {tab.icon && <span className="mr-1.5 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                {tab.badge}
              </span>
            )}

            {/* Moving shared indicator */}
            {isActive && (
              <motion.div
                layoutId={`${layoutId}-underline`}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
