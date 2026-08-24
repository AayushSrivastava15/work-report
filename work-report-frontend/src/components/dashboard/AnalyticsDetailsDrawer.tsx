import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Download,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { Pagination } from '../common/Pagination';
import { modalBackdropVariants, drawerVariants } from '../../motion';

export interface DrawerColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
}

interface AnalyticsDetailsDrawerProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  data: T[];
  columns: DrawerColumn<T>[];
  searchKey?: keyof T;
  exportFileName?: string;
  onRowClick?: (item: T) => void;
}

export function AnalyticsDetailsDrawer<T extends Record<string, any>>({
  isOpen,
  onClose,
  title,
  subtitle,
  data,
  columns,
  searchKey,
  exportFileName = 'analytics-export.csv',
  onRowClick,
}: AnalyticsDetailsDrawerProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const filteredData = useMemo(() => {
    let list = [...data];

    if (searchTerm.trim() && searchKey) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((item) => {
        const val = item[searchKey];
        return val ? String(val).toLowerCase().includes(term) : false;
      });
    }

    if (sortKey) {
      list.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA || '').localeCompare(String(valB || ''))
          : String(valB || '').localeCompare(String(valA || ''));
      });
    }

    return list;
  }, [data, searchTerm, searchKey, sortKey, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = page * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const exportCsv = () => {
    if (filteredData.length === 0) return;
    const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const rows = filteredData.map((item) =>
      columns
        .map((col) => {
          const val = item[col.key];
          return `"${String(val !== undefined && val !== null ? val : '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              variants={drawerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              data-lenis-prevent
              className="w-screen max-w-2xl bg-white dark:bg-slate-900 flex flex-col justify-between border-l border-slate-200 dark:border-slate-800"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Search & Export Toolbar */}
              <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
                {searchKey ? (
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter records..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(0);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                ) : (
                  <div />
                )}

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={exportCsv}
                  disabled={filteredData.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  Export CSV ({filteredData.length})
                </motion.button>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-y-auto p-6" data-lenis-prevent>
                {paginatedData.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                    No matching records found.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          {columns.map((col) => (
                            <th
                              key={col.key}
                              onClick={() => col.sortable !== false && handleSort(col.key)}
                              className={`px-4 py-3 font-semibold ${
                                col.align === 'right'
                                  ? 'text-right'
                                  : col.align === 'center'
                                  ? 'text-center'
                                  : 'text-left'
                              } ${
                                col.sortable !== false
                                  ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 select-none'
                                  : ''
                              }`}
                            >
                              <div
                                className={`inline-flex items-center gap-1 ${
                                  col.align === 'right' ? 'justify-end' : ''
                                }`}
                              >
                                <span>{col.header}</span>
                                {col.sortable !== false && (
                                  <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {paginatedData.map((item, idx) => (
                          <tr
                            key={idx}
                            onClick={() => onRowClick && onRowClick(item)}
                            className={`hover:bg-blue-50/40 dark:hover:bg-blue-950/40 transition-colors ${
                              onRowClick ? 'cursor-pointer' : ''
                            }`}
                          >
                            {columns.map((col) => (
                              <td
                                key={col.key}
                                className={`px-4 py-3 whitespace-nowrap ${
                                  col.align === 'right'
                                    ? 'text-right'
                                    : col.align === 'center'
                                    ? 'text-center'
                                    : 'text-left'
                                }`}
                              >
                                {col.render ? col.render(item) : item[col.key]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Drawer Footer with Pagination */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Total: {filteredData.length} records
                </span>
                <div className="flex items-center gap-2">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    size={pageSize}
                    totalElements={filteredData.length}
                    onPageChange={(p) => setPage(p)}
                    onSizeChange={(s) => {
                      setPageSize(s);
                      setPage(0);
                    }}
                    sizeOptions={[5, 10, 20, 50]}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
