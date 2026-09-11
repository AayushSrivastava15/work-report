import React from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  FolderKanban,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import type { KpiMetrics, ActivityTrendItem } from '../../types';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { staggerContainerVariants, cardItemVariants } from '../../motion';

interface DashboardKpiCardsProps {
  kpis: KpiMetrics;
  activityTrends?: ActivityTrendItem[];
  onCardClick?: (type: string) => void;
}

/**
 * Helper to render an SVG sparkline from real trend data
 */
const MiniSparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (!data || data.length < 2) {
    return (
      <div className="h-5 flex items-center">
        <span className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  const width = 64;
  const height = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `M ${points[0]} L ${points.join(' L ')} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="relative inline-flex items-center shrink-0">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#spark-${color})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  kpis,
  activityTrends = [],
  onCardClick,
}) => {
  const trendData = activityTrends.map((t) => t.totalEntries);
  const projectEngagement =
    kpis.totalProjects > 0
      ? Math.min(100, Math.round((kpis.activeProjects / kpis.totalProjects) * 100))
      : 100;

  const cards = [
    {
      id: 'entries',
      label: 'Total Work Entries',
      rawValue: kpis.totalWorkEntries,
      trend: kpis.growthPercentage !== 0 ? (
        <span
          className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
            kpis.growthPercentage >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {kpis.growthPercentage >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {kpis.growthPercentage >= 0 ? `+${kpis.growthPercentage}%` : `${kpis.growthPercentage}%`}
        </span>
      ) : (
        <span className="text-[11px] text-slate-400">All periods</span>
      ),
      visual: <MiniSparkline data={trendData} color="#3b82f6" />,
      icon: FileText,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
      borderHover: 'hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-blue-500/5',
      accentColor: 'blue',
    },
    {
      id: 'projects',
      label: 'Total Projects',
      rawValue: kpis.totalProjects,
      trend: (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {kpis.activeProjects} active with logs
        </span>
      ),
      visual: (
        <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${
                kpis.totalProjects > 0
                  ? Math.min(100, Math.round((kpis.activeProjects / kpis.totalProjects) * 100))
                  : 0
              }%`,
            }}
          />
        </div>
      ),
      icon: FolderKanban,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      borderHover: 'hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-indigo-500/5',
      accentColor: 'indigo',
    },
    {
      id: 'active_projects',
      label: 'Active Projects',
      rawValue: kpis.activeProjects,
      trend: (
        <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          {projectEngagement}% active
        </span>
      ),
      visual: (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
          {kpis.activeProjects}/{kpis.totalProjects}
        </span>
      ),
      icon: Layers,
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
      borderHover: 'hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-purple-500/5',
      accentColor: 'purple',
    },
    {
      id: 'completed',
      label: 'Completed Work',
      rawValue: kpis.completedWork,
      trend: (
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          {kpis.completedPercentage}% rate
        </span>
      ),
      visual: (
        <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, kpis.completedPercentage)}%` }}
          />
        </div>
      ),
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-emerald-500/5',
      accentColor: 'emerald',
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      rawValue: kpis.inProgressWork,
      trend: (
        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3 shrink-0" />
          {kpis.inProgressPercentage}% in review
        </span>
      ),
      visual: (
        <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, kpis.inProgressPercentage)}%` }}
          />
        </div>
      ),
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-amber-500/5',
      accentColor: 'amber',
    },
    {
      id: 'technologies',
      label: 'Technologies Used',
      rawValue: kpis.technologiesUsed,
      trend: (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Distinct tech stacks
        </span>
      ),
      visual: (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60 flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5" />
          Adopted
        </span>
      ),
      icon: Cpu,
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
      borderHover: 'hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-cyan-500/5',
      accentColor: 'cyan',
    },
  ];

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
    >
      {cards.map((c) => {
        const IconComponent = c.icon;
        return (
          <motion.div
            key={c.id}
            variants={cardItemVariants}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCardClick && onCardClick(c.id)}
            className={`bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-sm transition-all cursor-pointer ${c.borderHover} group relative overflow-hidden`}
          >
            {/* Top Label & Icon */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {c.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Numeric Value */}
            <div className="text-2xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              <AnimatedNumber value={c.rawValue} />
            </div>

            {/* Sublabel & Visual Indicator Row */}
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
              <div className="truncate">{c.trend}</div>
              <div className="shrink-0">{c.visual}</div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
