import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Search,
  MoreVertical,
  Maximize2,
  Table,
  Download,
  ExternalLink,
  Layers,
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
  const [limit, setLimit] = useState<'5' | '10' | 'ALL'>('5');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // Maximum work count for relative horizontal indicator width
  const maxWorkCount = useMemo(() => {
    return Math.max(...technologies.map((t) => t.workCount), 1);
  }, [technologies]);

  const filteredTechnologies = useMemo(() => {
    let list = [...technologies];

    if (searchTerm.trim()) {
      list = list.filter((t) =>
        t.technology.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    list.sort((a, b) => b.workCount - a.workCount);

    if (limit === 'ALL') return list;
    return list.slice(0, Number(limit));
  }, [technologies, searchTerm, limit]);

  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between transition-all">
      <div>
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Technology Stack
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adoption frequency and project cross-references
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {/* Limit Selector */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              {(['5', '10', 'ALL'] as const).map((l) => (
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

            {/* More Menu */}
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
                    Expand View
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
        </div>

        {/* Quick Search */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-colors"
          />
        </div>

        {/* Compact Ranked List with Mini Indicators */}
        {filteredTechnologies.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            No technologies matched your query.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTechnologies.map((t, idx) => {
              const relativeWidth = Math.min(100, Math.round((t.workCount / maxWorkCount) * 100));
              return (
                <div
                  key={t.technology}
                  onClick={() => onTechClick(t.technology)}
                  className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 border border-slate-200/60 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-700/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 w-4 shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                        {t.technology}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {t.workCount} {t.workCount === 1 ? 'entry' : 'entries'}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-600">
                        {t.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Volume Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mb-1.5">
                    <div
                      className="bg-purple-600 dark:bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${relativeWidth}%` }}
                    />
                  </div>

                  {/* Projects cross-reference pills */}
                  {t.projects && t.projects.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-hidden pt-0.5">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5" />
                        Projects:
                      </span>
                      <div className="flex items-center gap-1 truncate">
                        {t.projects.slice(0, 3).map((proj) => (
                          <span
                            key={proj}
                            className="inline-block text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[110px]"
                            title={proj}
                          >
                            {proj}
                          </span>
                        ))}
                        {t.projects.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            +{t.projects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Showing {filteredTechnologies.length} of {technologies.length} technologies
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
