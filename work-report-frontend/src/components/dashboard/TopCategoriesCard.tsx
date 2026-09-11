import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  Layers,
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
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#94a3b8', // slate
];

export const TopCategoriesCard: React.FC<TopCategoriesCardProps> = ({
  categories,
  onCategoryClick,
  onViewDetails,
  onExpand,
  onExportCsv,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<CategoryAnalyticsItem | null>(null);

  // Group top 6 categories + "Other"
  const chartData = useMemo(() => {
    if (categories.length <= 6) {
      return categories;
    }

    const top6 = categories.slice(0, 6);
    const other = categories.slice(6);

    const otherWorkCount = other.reduce((acc, curr) => acc + curr.workCount, 0);
    const otherCompleted = other.reduce((acc, curr) => acc + curr.completedCount, 0);
    const otherInProgress = other.reduce((acc, curr) => acc + curr.inProgressCount, 0);
    const otherPercentage = Math.round(
      other.reduce((acc, curr) => acc + curr.percentage, 0) * 10
    ) / 10;

    const result = [...top6];
    if (other.length > 0) {
      result.push({
        category: `Other (${other.length})`,
        workCount: otherWorkCount,
        completedCount: otherCompleted,
        inProgressCount: otherInProgress,
        percentage: otherPercentage,
      });
    }

    return result;
  }, [categories]);

  const totalEntries = useMemo(() => {
    return categories.reduce((acc, curr) => acc + curr.workCount, 0);
  }, [categories]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between transition-all">
      <div>
        {/* Header & Controls */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Work by Category
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Effort allocation across functional domains
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
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
                  Export CSV
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart with Beside Legend */}
        {chartData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            No category metrics recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
            {/* Donut Chart (5 cols) */}
            <div className="sm:col-span-5 relative h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="workCount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    onClick={(data: any) => onCategoryClick(data.category)}
                    onMouseEnter={(_, index) => setHoveredCategory(chartData[index])}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className="cursor-pointer"
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`pie-cell-${index}`}
                        fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Dynamic Readout */}
              <div className="absolute w-[94px] h-[94px] flex flex-col items-center justify-center pointer-events-none text-center rounded-full">
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                  {hoveredCategory ? hoveredCategory.workCount : totalEntries}
                </span>
                <span
                  className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight truncate max-w-[85px] px-1"
                  title={hoveredCategory ? hoveredCategory.category : 'Total'}
                >
                  {hoveredCategory ? hoveredCategory.category : 'Total'}
                </span>
                {hoveredCategory && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {hoveredCategory.percentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Compact Ranked List with Mini Progress Bars (7 cols) */}
            <div className="sm:col-span-7 space-y-2 text-xs">
              {chartData.map((c, i) => {
                const color = CATEGORY_PALETTE[i % CATEGORY_PALETTE.length];
                const isHovered = hoveredCategory?.category === c.category;
                return (
                  <div
                    key={c.category}
                    onClick={() => onCategoryClick(c.category)}
                    onMouseEnter={() => setHoveredCategory(c)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`p-2 rounded-xl transition-all cursor-pointer border ${
                      isHovered
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/50 dark:border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center space-x-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {c.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {c.workCount}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-600">
                          {c.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Mini Share Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${c.percentage}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
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
