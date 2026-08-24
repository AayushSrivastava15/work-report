import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Network,
  MoreVertical,
  Maximize2,
  Table,
  Download,
} from 'lucide-react';
import type { WorkDistributionItem } from '../../types';

interface WorkDistributionCardProps {
  distribution: WorkDistributionItem[];
  onProjectClick: (projectId: number | null, projectName: string) => void;
  onViewDetails: () => void;
  onExpand: () => void;
  onExportCsv: () => void;
}

const STACK_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#64748b',
  '#6366f1',
];

export const WorkDistributionCard: React.FC<WorkDistributionCardProps> = ({
  distribution,
  onProjectClick,
  onViewDetails,
  onExpand,
  onExportCsv,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Extract all distinct category names across projects
  const allCategories = React.useMemo(() => {
    const set = new Set<string>();
    distribution.forEach((d) => {
      Object.keys(d.categoryCounts || {}).forEach((cat) => set.add(cat));
    });
    return Array.from(set).slice(0, 6);
  }, [distribution]);

  const chartData = React.useMemo(() => {
    return distribution.map((d) => {
      const item: any = {
        projectName: d.projectName,
        projectId: d.projectId,
        total: d.totalCount,
      };
      allCategories.forEach((cat) => {
        item[cat] = d.categoryCounts[cat] || 0;
      });
      return item;
    });
  }, [distribution, allCategories]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              Work Distribution (Project → Category Matrix)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Functional domain breakdown across top projects
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

      {/* Stacked Horizontal Bar Chart */}
      {distribution.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
          No distribution data available.
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                type="category"
                dataKey="projectName"
                tick={{ fontSize: 11, fill: '#334155' }}
                width={140}
                tickFormatter={(val: string) =>
                  val.length > 20 ? `${val.substring(0, 18)}...` : val
                }
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                  padding: '10px 14px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {allCategories.map((cat, index) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  stackId="a"
                  fill={STACK_COLORS[index % STACK_COLORS.length]}
                  radius={index === allCategories.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                  onClick={(data: any) => onProjectClick(data.projectId, data.projectName)}
                  className="cursor-pointer hover:opacity-90"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
