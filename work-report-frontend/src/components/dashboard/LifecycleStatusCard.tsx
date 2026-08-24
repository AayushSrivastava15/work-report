import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  CheckCircle2,
  MoreVertical,
  Maximize2,
  Table,
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

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between">
      <div>
        {/* Header & Controls */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                Lifecycle Status Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Work delivery and review distribution
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs text-slate-700 dark:text-slate-200 animate-fadeIn"
                onClick={() => setShowMenu(false)}
              >
                <button
                  onClick={onViewDetails}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Table className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  View Details Table
                </button>
                <button
                  onClick={onExpand}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  Expand Chart
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart with Center Stats */}
        {statuses.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            No status distribution recorded.
          </div>
        ) : (
          <div className="relative h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statuses}
                  dataKey="workCount"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, _, props: any) => [
                    `${value} entries (${props.payload.percentage}%)`,
                    props.payload.label,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Absolute Metric Overlay */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                {hoveredStatus ? hoveredStatus.workCount : totalEntries.toLocaleString()}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                {hoveredStatus ? hoveredStatus.label : 'Total Reports'}
              </span>
              {hoveredStatus && (
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {hoveredStatus.percentage}% share
                </span>
              )}
            </div>
          </div>
        )}

        {/* Clean Interactive Legend Below */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {statuses.map((s) => (
            <div
              key={s.status}
              onClick={() => onStatusClick(s.status)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{s.label}</span>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{s.workCount}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1 font-medium">({s.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
