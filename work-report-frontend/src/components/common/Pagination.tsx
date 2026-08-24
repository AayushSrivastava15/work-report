import React from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface PaginationProps {
  page: number; // 0-indexed
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onSizeChange?: (newSize: number) => void;
  disabled?: boolean;
  sizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
  disabled = false,
  sizeOptions = [10, 20, 50],
}) => {
  if (totalElements === 0 || totalPages <= 0) {
    return null;
  }

  const currentPage = page + 1; // 1-indexed for display
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push('ellipsis-start');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const isFirst = page === 0;
  const isLast = page >= totalPages - 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none">
      {/* Item count description */}
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{totalElements}</span> entries
      </div>

      <div className="flex items-center space-x-4">
        {/* Optional Page size selector */}
        {onSizeChange && (
          <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
            <span>Rows:</span>
            <select
              value={size}
              disabled={disabled}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer disabled:opacity-50 transition-shadow"
            >
              {sizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-1">
          {/* First Page */}
          <motion.button
            whileTap={!disabled && !isFirst ? { scale: 0.92 } : undefined}
            onClick={() => onPageChange(0)}
            disabled={disabled || isFirst}
            title="First Page"
            aria-label="First page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </motion.button>

          {/* Previous Page */}
          <motion.button
            whileTap={!disabled && !isFirst ? { scale: 0.92 } : undefined}
            onClick={() => onPageChange(page - 1)}
            disabled={disabled || isFirst}
            title="Previous Page"
            aria-label="Previous page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((p, idx) => {
              if (typeof p === 'string') {
                return (
                  <span key={`${p}-${idx}`} className="px-1.5 text-xs text-slate-400 dark:text-slate-500">
                    …
                  </span>
                );
              }
              const isActive = p === currentPage;
              return (
                <motion.button
                  key={p}
                  whileTap={!disabled ? { scale: 0.92 } : undefined}
                  onClick={() => onPageChange(p - 1)}
                  disabled={disabled}
                  aria-label={`Page ${p}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-w-[30px] h-[30px] text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p}
                </motion.button>
              );
            })}
          </div>

          {/* Next Page */}
          <motion.button
            whileTap={!disabled && !isLast ? { scale: 0.92 } : undefined}
            onClick={() => onPageChange(page + 1)}
            disabled={disabled || isLast}
            title="Next Page"
            aria-label="Next page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          {/* Last Page */}
          <motion.button
            whileTap={!disabled && !isLast ? { scale: 0.92 } : undefined}
            onClick={() => onPageChange(totalPages - 1)}
            disabled={disabled || isLast}
            title="Last Page"
            aria-label="Last page"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
