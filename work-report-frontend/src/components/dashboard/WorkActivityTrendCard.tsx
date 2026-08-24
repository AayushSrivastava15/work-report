import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  MoreVertical,
  Maximize2,
  Table,
  Download,
} from 'lucide-react';
import type { ActivityTrendItem } from '../../types';

interface WorkActivityTrendCardProps {
  trends: ActivityTrendItem[];
  currentAggregation: 'DAY' | 'WEEK' | 'MONTH';
  onAggregationChange: (agg: 'DAY' | 'WEEK' | 'MONTH') => void;
  onViewDetails: () => void;
  onExpand: () => void;
  onExportCsv: () => void;
}

export const WorkActivityTrendCard: React.FC<WorkActivityTrendCardProps> = ({
  trends,
  currentAggregation,
  onAggregationChange,
  onViewDetails,
  onExpand,
  onExportCsv,
}) => {
  const [activeMetric, setActiveMetric] = useState<'total' | 'completed' | 'inProgress'>('total');
  const [showMenu, setShowMenu] = useState(false);

  const metricConfig = {
    total: {
      label: 'All Entries',
      dataKey: 'totalEntries',
      color: '#3b82f6',
      gradientId: 'colorTotal',
    },
    completed: {
      label: 'Completed',
      dataKey: 'completedEntries',
      color: '#10b981',
      gradientId: 'colorCompleted',
    },
    inProgress: {
      label: 'In Progress',
      dataKey: 'inProgressEntries',
      color: '#f59e0b',
      gradientId: 'colorInProgress',
    },
  };

  const currentConfig = metricConfig[activeMetric];

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              Work Activity Over Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track throughput and completion velocity across periods
            </p>
          </div>
        </div>

        {/* Action Controls & Granularity Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {(['total', 'completed', 'inProgress'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeMetric === m
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {metricConfig[m].label}
              </button>
            ))}
          </div>

          {/* Granularity Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {(['DAY', 'WEEK', 'MONTH'] as const).map((agg) => (
              <button
                key={agg}
                onClick={() => onAggregationChange(agg)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  currentAggregation === agg
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {agg === 'DAY' ? 'Day' : agg === 'WEEK' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>

          {/* More Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Chart Options"
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
                <button
                  onClick={onExportCsv}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  Export Data CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      {trends.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-sm text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <TrendingUp className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
          No activity logs recorded in this period.
        </div>
      ) : (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '12px',
                  padding: '10px 14px',
                }}
                formatter={(value: any) => [`${value} entries`, currentConfig.label]}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Area
                type="monotone"
                dataKey={currentConfig.dataKey}
                stroke={currentConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${currentConfig.gradientId})`}
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
