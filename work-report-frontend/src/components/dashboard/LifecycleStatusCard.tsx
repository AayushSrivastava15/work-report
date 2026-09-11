import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle2,
  MoreVertical,
  Maximize2,
  Table,
  ShieldCheck,
} from 'lucide-react';
import type { StatusAnalyticsItem } from '../../types';

interface LifecycleStatusCardProps {
  statuses: StatusAnalyticsItem[];
  totalEntries: number;
  onStatusClick: (statusKey: string) => void;
  onViewDetails: () => void;
  onExpand: () => void;
}

export const LifecycleStatusCard: React.FC<LifecycleStatusCardProps> = ({
  statuses,
  totalEntries,
  onStatusClick,
  onViewDetails,
  onExpand,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredStatus, setHoveredStatus] = useState<StatusAnalyticsItem | null>(null);

  // Calculate completion percentage from completed/approved status
  const { completedCount, completionPercentage } = useMemo(() => {
    const completedItem = statuses.find(
      (s) =>
        s.status === 'APPROVED' ||
        s.status === 'COMPLETED' ||
        s.label?.toLowerCase().includes('completed') ||
        s.label?.toLowerCase().includes('approved')
    );
    const count = completedItem ? completedItem.workCount : 0;
    const pct = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
    return { completedCount: count, completionPercentage: pct };
  }, [statuses, totalEntries]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between transition-all">
      <div>
        {/* Header & Controls */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Work Status & Health
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Delivery pipeline and review distribution
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs text-slate-700 dark:text-slate-200 animate-fadeIn"
                onClick={() => setShowMenu(false)}
              >
                <button
                  onClick={onViewDetails}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Table className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  View Details Table
                </button>
                <button
                  onClick={onExpand}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  Expand Chart
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart with Center Completion Ring */}
        {statuses.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            No status distribution recorded.
          </div>
        ) : (
          <div className="relative h-44 w-full flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statuses}
                  dataKey="workCount"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={74}
                  paddingAngle={3}
                  onClick={(data: any) => onStatusClick(data.status)}
                  onMouseEnter={(_, index) => setHoveredStatus(statuses[index])}
                  onMouseLeave={() => setHoveredStatus(null)}
                  className="cursor-pointer"
                >
                  {statuses.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Absolute Metric Overlay */}
            <div className="absolute w-[100px] h-[100px] flex flex-col items-center justify-center pointer-events-none text-center rounded-full">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                {hoveredStatus ? hoveredStatus.workCount : `${completionPercentage}%`}
              </span>
              <span
                className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight truncate max-w-[95px] px-1"
                title={hoveredStatus ? hoveredStatus.label : 'Completed'}
              >
                {hoveredStatus ? hoveredStatus.label : 'Completed'}
              </span>
              {hoveredStatus ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {hoveredStatus.percentage}% share
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Healthy
                </span>
              )}
            </div>
          </div>
        )}

        {/* Compact Interactive Status Breakdown List */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {statuses.map((s) => (
            <div
              key={s.status}
              onClick={() => onStatusClick(s.status)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center space-x-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {s.label}
                </span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {s.workCount}
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600">
                  {s.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>Total: <strong>{totalEntries}</strong> ({completedCount} completed)</span>
        <button
          onClick={onViewDetails}
          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer"
        >
          View Full Breakdown
        </button>
      </div>
    </div>
  );
};
