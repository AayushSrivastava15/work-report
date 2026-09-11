import React, { useState, useMemo } from 'react';
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
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
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
  const [activeMetric, setActiveMetric] = useState<'total' | 'completed' | 'inProgress' | 'multi'>('total');
  const [showMenu, setShowMenu] = useState(false);

  // Derive quick summary stats from trends data
  const summary = useMemo(() => {
    if (!trends || trends.length === 0) {
      return { total: 0, completed: 0, inProgress: 0, peakPeriod: 'N/A', peakValue: 0 };
    }
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let peakValue = 0;
    let peakPeriod = trends[0].period;

    trends.forEach((t) => {
      total += t.totalEntries || 0;
      completed += t.completedEntries || 0;
      inProgress += t.inProgressEntries || 0;
      if (t.totalEntries > peakValue) {
        peakValue = t.totalEntries;
        peakPeriod = t.period;
      }
    });

    return { total, completed, inProgress, peakPeriod, peakValue };
  }, [trends]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 transition-all">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Work Activity Over Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Throughput velocity and delivery trends across periods
            </p>
          </div>
        </div>

        {/* Action Controls & Granularity Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveMetric('total')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeMetric === 'total'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All Entries
            </button>
            <button
              onClick={() => setActiveMetric('completed')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeMetric === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveMetric('inProgress')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeMetric === 'inProgress'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveMetric('multi')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeMetric === 'multi'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Multi-Track
            </button>
          </div>

          {/* Granularity Switcher */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
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
                <button
                  onClick={onExportCsv}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  Export Data CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary Pill Badges */}
      {trends.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-xs pt-1 pb-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40 font-medium">
            <Layers className="w-3 h-3 text-blue-500" />
            <span>Range Total: <strong>{summary.total}</strong> entries</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Completed: <strong>{summary.completed}</strong></span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/40 font-medium">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>In Progress: <strong>{summary.inProgress}</strong></span>
          </div>
          {summary.peakValue > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium ml-auto">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Peak: <strong>{summary.peakValue}</strong> ({summary.peakPeriod})</span>
            </div>
          )}
        </div>
      )}

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
                <linearGradient id="trendBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="trendEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="trendAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#64748b', opacity: 0.25 }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                wrapperStyle={{ outline: 'none', zIndex: 50 }}
                content={({ payload, label }) => {
                  if (!payload || payload.length === 0) return null;
                  const item = payload[0].payload as ActivityTrendItem;
                  const total = item.totalEntries || 0;
                  const completed = item.completedEntries || 0;
                  const inProgress = item.inProgressEntries || 0;
                  const draft = item.draftEntries || 0;
                  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xl text-xs space-y-2 pointer-events-none min-w-[190px]">
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">Period: {label}</span>
                        {item.date && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.date}</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Total Entries:
                          </span>
                          <strong className="font-bold text-blue-600 dark:text-blue-400">{total}</strong>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Completed:
                          </span>
                          <strong className="font-bold text-emerald-600 dark:text-emerald-400">{completed}</strong>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            In Progress:
                          </span>
                          <strong className="font-bold text-amber-600 dark:text-amber-400">{inProgress}</strong>
                        </div>
                        {draft > 0 && (
                          <div className="flex items-center justify-between gap-4 text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              Draft:
                            </span>
                            <strong>{draft}</strong>
                          </div>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Completion Rate:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{completionRate}%</span>
                      </div>
                    </div>
                  );
                }}
              />

              {activeMetric === 'total' && (
                <Area
                  type="monotone"
                  dataKey="totalEntries"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trendBlue)"
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {activeMetric === 'completed' && (
                <Area
                  type="monotone"
                  dataKey="completedEntries"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trendEmerald)"
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {activeMetric === 'inProgress' && (
                <Area
                  type="monotone"
                  dataKey="inProgressEntries"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trendAmber)"
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {activeMetric === 'multi' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="totalEntries"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={0.6}
                    fill="url(#trendBlue)"
                    name="Total"
                    activeDot={{ r: 5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completedEntries"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={0.6}
                    fill="url(#trendEmerald)"
                    name="Completed"
                    activeDot={{ r: 5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inProgressEntries"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={0.6}
                    fill="url(#trendAmber)"
                    name="In Progress"
                    activeDot={{ r: 5 }}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
