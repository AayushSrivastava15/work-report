import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Layers,
  BarChart2,
  PieChart as PieIcon,
  MoreVertical,
  Maximize2,
  Table,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { CategoryAnalyticsItem } from '../../types';

interface TopCategoriesCardProps {
  categories: CategoryAnalyticsItem[];
  onCategoryClick: (categoryName: string) => void;
  onViewDetails: () => void;
  onExpand: () => void;
  onExportCsv: () => void;
}

const CATEGORY_PALETTE = [
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#06b6d4',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#94a3b8',
];

export const TopCategoriesCard: React.FC<TopCategoriesCardProps> = ({
  categories,
  onCategoryClick,
  onViewDetails,
  onExpand,
  onExportCsv,
}) => {
  const [viewType, setViewType] = useState<'bar' | 'donut'>('bar');
  const [unit, setUnit] = useState<'count' | 'percentage'>('count');
  const [showMenu, setShowMenu] = useState(false);

  // Top 8 + Other Aggregation
  const chartData = useMemo(() => {
    if (categories.length <= 8) {
      return categories.map((c) => ({
        ...c,
        displayValue: unit === 'count' ? c.workCount : c.percentage,
      }));
    }

    const top8 = categories.slice(0, 8);
    const other = categories.slice(8);

    const otherWorkCount = other.reduce((acc, curr) => acc + curr.workCount, 0);
    const otherCompleted = other.reduce((acc, curr) => acc + curr.completedCount, 0);
    const otherInProgress = other.reduce((acc, curr) => acc + curr.inProgressCount, 0);
    const otherPercentage = Math.round(
      other.reduce((acc, curr) => acc + curr.percentage, 0) * 10
    ) / 10;

    const result = top8.map((c) => ({
      ...c,
      displayValue: unit === 'count' ? c.workCount : c.percentage,
    }));

    if (other.length > 0) {
      result.push({
        category: `Other (${other.length})`,
        workCount: otherWorkCount,
        completedCount: otherCompleted,
        inProgressCount: otherInProgress,
        percentage: otherPercentage,
        displayValue: unit === 'count' ? otherWorkCount : otherPercentage,
      });
    }

    return result;
  }, [categories, unit]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between">
      <div>
        {/* Header & Controls */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                Top Work Categories
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Workload allocation across domains
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewType('bar')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  viewType === 'bar'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Bar Chart"
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewType('donut')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  viewType === 'donut'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Donut Chart"
              >
                <PieIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Unit Toggle */}
            <button
              onClick={() => setUnit(unit === 'count' ? 'percentage' : 'count')}
              className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {unit === 'count' ? '#' : '%'}
            </button>

            {/* Options Menu */}
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
                  <button
                    onClick={onExportCsv}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    Export CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        {chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            No category metrics recorded.
          </div>
        ) : viewType === 'bar' ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#64748b', opacity: 0.25 }}
                  unit={unit === 'percentage' ? '%' : ''}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  width={140}
                  tickFormatter={(val: string) =>
                    val.length > 18 ? `${val.substring(0, 16)}...` : val
                  }
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }}
                  wrapperStyle={{ outline: 'none', zIndex: 50 }}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const item = payload[0].payload as CategoryAnalyticsItem;
                    return (
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xl text-xs space-y-1.5 max-w-xs pointer-events-none">
                        <div className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                          {item.category}
                        </div>
                        <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                          <span>Work Entries:</span>
                          <strong className="font-bold text-emerald-600 dark:text-emerald-400">{item.workCount}</strong>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                          <span>Share:</span>
                          <strong className="text-slate-800 dark:text-slate-200">{item.percentage}%</strong>
                        </div>
                        <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400">
                          <span>Completed:</span>
                          <strong>{item.completedCount}</strong>
                        </div>
                        <div className="flex justify-between gap-4 text-amber-600 dark:text-amber-400">
                          <span>In Progress:</span>
                          <strong>{item.inProgressCount}</strong>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="displayValue"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                  onClick={(data: any) => onCategoryClick(data.category)}
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 w-full flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="workCount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    onClick={(data: any) => onCategoryClick(data.category)}
                    className="cursor-pointer"
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`pie-cell-${index}`}
                        fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ outline: 'none', zIndex: 50 }}
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const item = payload[0].payload as CategoryAnalyticsItem;
                      return (
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xl text-xs space-y-1 pointer-events-none">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.category}
                          </div>
                          <div className="text-slate-600 dark:text-slate-300">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.workCount} entries</span> ({item.percentage}%)
                          </div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-1.5 overflow-y-auto max-h-72 pr-2 text-xs">
              {chartData.map((c, i) => (
                <div
                  key={c.category}
                  onClick={() => onCategoryClick(c.category)}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }}
                    />
                    <span className="truncate text-slate-700 dark:text-slate-200 font-medium">{c.category}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0 ml-2">
                    {c.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Showing {chartData.length} of {categories.length} categories
        </span>
        <button
          onClick={onViewDetails}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer"
        >
          View All Categories
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
