import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Cpu,
  Search,
  MoreVertical,
  Maximize2,
  Table,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { TechnologyAnalyticsItem } from '../../types';

interface TopTechnologiesCardProps {
  technologies: TechnologyAnalyticsItem[];
  onTechClick: (techName: string) => void;
  onViewDetails: () => void;
  onExpand: () => void;
  onExportCsv: () => void;
}

export const TopTechnologiesCard: React.FC<TopTechnologiesCardProps> = ({
  technologies,
  onTechClick,
  onViewDetails,
  onExpand,
  onExportCsv,
}) => {
  const [limit, setLimit] = useState<'5' | '10' | '20' | 'ALL'>('10');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const chartData = useMemo(() => {
    let filtered = [...technologies];

    if (searchTerm.trim()) {
      filtered = filtered.filter((t) =>
        t.technology.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    if (limit === 'ALL' || filtered.length <= Number(limit)) {
      return filtered;
    }

    const n = Number(limit);
    const topN = filtered.slice(0, n);
    const other = filtered.slice(n);

    const otherWorkCount = other.reduce((acc, curr) => acc + curr.workCount, 0);
    const otherPercentage = Math.round(
      other.reduce((acc, curr) => acc + curr.percentage, 0) * 10
    ) / 10;

    const result = [...topN];
    if (other.length > 0) {
      result.push({
        technology: `Other Technologies (${other.length})`,
        workCount: otherWorkCount,
        projectCount: other.length,
        projects: [],
        percentage: otherPercentage,
      });
    }

    return result;
  }, [technologies, limit, searchTerm]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between">
      <div>
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                Top Technologies Used
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Technology frequency across projects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {/* Limit Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              {(['5', '10', '20', 'ALL'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLimit(l)}
                  className={`px-2 py-0.5 font-semibold rounded-md transition-all cursor-pointer ${
                    limit === l
                      ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-400 shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {l === 'ALL' ? 'All' : `Top ${l}`}
                </button>
              ))}
            </div>

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

        {/* Quick Search */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-colors"
          />
        </div>

        {/* Chart Canvas */}
        {chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            No technologies matched your query.
          </div>
        ) : (
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
                />
                <YAxis
                  type="category"
                  dataKey="technology"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  width={140}
                  tickFormatter={(val: string) =>
                    val.length > 18 ? `${val.substring(0, 16)}...` : val
                  }
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(139, 92, 246, 0.08)' }}
                  wrapperStyle={{ outline: 'none', zIndex: 50 }}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const item = payload[0].payload as TechnologyAnalyticsItem;
                    return (
                      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xl text-xs space-y-1.5 max-w-xs pointer-events-none">
                        <div className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1">
                          {item.technology}
                        </div>
                        <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                          <span>Usage Count:</span>
                          <strong className="font-bold text-purple-600 dark:text-purple-400">{item.workCount} entries</strong>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                          <span>Share:</span>
                          <strong className="text-slate-800 dark:text-slate-200">{item.percentage}%</strong>
                        </div>
                        {item.projects && item.projects.length > 0 && (
                          <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                            <span className="font-medium text-slate-700 dark:text-slate-300">Used in: </span>
                            {item.projects.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="workCount"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                  onClick={(data: any) => onTechClick(data.technology)}
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`tech-cell-${index}`}
                      fill={
                        entry.technology.startsWith('Other')
                          ? '#94a3b8'
                          : index === 0
                          ? '#7c3aed'
                          : '#8b5cf6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Showing {chartData.length} of {technologies.length} technologies
        </span>
        <button
          onClick={onViewDetails}
          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors cursor-pointer"
        >
          View All Technologies
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
