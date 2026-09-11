import React, { useState, useMemo } from 'react';
import {
  Network,
  MoreVertical,
  Maximize2,
  Table,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { WorkDistributionItem } from '../../types';

interface WorkDistributionCardProps {
  distribution: WorkDistributionItem[];
  onProjectClick: (projectId: number | null, projectName: string) => void;
  onViewDetails: () => void;
  onExpand: () => void;
  onExportCsv: () => void;
}

export const WorkDistributionCard: React.FC<WorkDistributionCardProps> = ({
  distribution,
  onProjectClick,
  onViewDetails,
  onExpand,
  onExportCsv,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    project: string;
    category: string;
    count: number;
    total: number;
  } | null>(null);

  // Extract top distinct categories across all projects (up to 5 for compact presentation)
  const topCategories = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    distribution.forEach((d) => {
      Object.entries(d.categoryCounts || {}).forEach(([cat, count]) => {
        categoryTotals[cat] = (categoryTotals[cat] || 0) + count;
      });
    });

    return Object.keys(categoryTotals)
      .sort((a, b) => categoryTotals[b] - categoryTotals[a])
      .slice(0, 5);
  }, [distribution]);

  // Find max cell count for heatmap color intensity scaling
  const maxCellCount = useMemo(() => {
    let max = 1;
    distribution.forEach((d) => {
      topCategories.forEach((cat) => {
        const c = d.categoryCounts[cat] || 0;
        if (c > max) max = c;
      });
    });
    return max;
  }, [distribution, topCategories]);

  // Calculate column category totals for bottom summary row
  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    topCategories.forEach((cat) => {
      totals[cat] = distribution.reduce((sum, d) => sum + (d.categoryCounts[cat] || 0), 0);
    });
    return totals;
  }, [distribution, topCategories]);

  const grandTotal = useMemo(() => {
    return distribution.reduce((sum, d) => sum + d.totalCount, 0);
  }, [distribution]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between transition-all">
      <div>
        {/* Header & Controls */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Work Distribution Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cross-domain heatmap: Project × Functional Categories
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
                  Expand Matrix
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

        {/* Heatmap Matrix Table */}
        {distribution.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            No distribution data available.
          </div>
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-left">Project</th>
                  {topCategories.map((cat) => (
                    <th key={cat} className="py-2.5 px-2 text-center">
                      <span className="truncate max-w-[90px] inline-block" title={cat}>
                        {cat}
                      </span>
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {distribution.slice(0, 7).map((d) => (
                  <tr
                    key={d.projectId || d.projectName}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    {/* Project Row Header */}
                    <td
                      onClick={() => onProjectClick(d.projectId, d.projectName)}
                      className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate max-w-[160px]"
                      title={`Filter by ${d.projectName}`}
                    >
                      {d.projectName}
                    </td>

                    {/* Category Heat Cells */}
                    {topCategories.map((cat) => {
                      const count = d.categoryCounts[cat] || 0;
                      const intensity = count > 0 ? Math.min(1, count / maxCellCount) : 0;
                      const isHot = intensity > 0.45;

                      return (
                        <td
                          key={cat}
                          className="py-1.5 px-1.5 text-center"
                          onMouseEnter={() =>
                            setHoveredCell({
                              project: d.projectName,
                              category: cat,
                              count,
                              total: d.totalCount,
                            })
                          }
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {count === 0 ? (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          ) : (
                            <span
                              onClick={() => onProjectClick(d.projectId, d.projectName)}
                              className={`inline-flex items-center justify-center w-8 h-6 rounded-md font-bold text-[11px] cursor-pointer transition-transform hover:scale-110 shadow-2xs ${
                                isHot
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                              }`}
                              style={{
                                opacity: Math.max(0.65, 0.3 + intensity * 0.7),
                              }}
                              title={`${d.projectName} - ${cat}: ${count} entries`}
                            >
                              {count}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Project Total Column */}
                    <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {d.totalCount}
                    </td>
                  </tr>
                ))}

                {/* Summary Column Totals */}
                <tr className="bg-slate-50/70 dark:bg-slate-800/60 font-bold text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700">
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-semibold">
                    Domain Total
                  </td>
                  {topCategories.map((cat) => (
                    <td key={cat} className="py-2 px-2 text-center text-blue-600 dark:text-blue-400">
                      {columnTotals[cat] || 0}
                    </td>
                  ))}
                  <td className="py-2 px-3 text-right text-slate-900 dark:text-white">
                    {grandTotal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic Hover Tooltip Banner */}
        {hoveredCell && hoveredCell.count > 0 && (
          <div className="mt-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 text-[11px] flex items-center justify-between animate-fadeIn">
            <span>
              <strong>{hoveredCell.project}</strong> → <strong>{hoveredCell.category}</strong>
            </span>
            <span className="font-bold">
              {hoveredCell.count} entries ({Math.round((hoveredCell.count / hoveredCell.total) * 100)}% of project)
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Showing {Math.min(7, distribution.length)} of {distribution.length} projects
        </span>
        <button
          onClick={onViewDetails}
          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors cursor-pointer"
        >
          View Full Breakdown
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
