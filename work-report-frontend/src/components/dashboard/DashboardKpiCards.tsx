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
} from 'lucide-react';
import type { KpiMetrics } from '../../types';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { staggerContainerVariants, cardItemVariants } from '../../motion';

interface DashboardKpiCardsProps {
  kpis: KpiMetrics;
  onCardClick?: (type: string) => void;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({ kpis, onCardClick }) => {
  const cards = [
    {
      id: 'entries',
      label: 'Total Work Entries',
      rawValue: kpis.totalWorkEntries,
      sublabel: kpis.growthPercentage !== 0 ? (
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${kpis.growthPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {kpis.growthPercentage >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {kpis.growthPercentage >= 0 ? `+${kpis.growthPercentage}%` : `${kpis.growthPercentage}%`} vs prev period
        </span>
      ) : (
        <span className="text-xs text-slate-400">All filtered records</span>
      ),
      icon: FileText,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
      borderHover: 'hover:border-blue-300 dark:hover:border-blue-700',
    },
    {
      id: 'projects',
      label: 'Total Projects',
      rawValue: kpis.totalProjects,
      sublabel: (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {kpis.activeProjects} active with logs
        </span>
      ),
      icon: FolderKanban,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      borderHover: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    },
    {
      id: 'active_projects',
      label: 'Active Projects',
      rawValue: kpis.activeProjects,
      sublabel: (
        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
          {kpis.totalProjects > 0 ? Math.round((kpis.activeProjects / kpis.totalProjects) * 100) : 100}% project engagement
        </span>
      ),
      icon: Layers,
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
      borderHover: 'hover:border-purple-300 dark:hover:border-purple-700',
    },
    {
      id: 'completed',
      label: 'Completed Work',
      rawValue: kpis.completedWork,
      sublabel: (
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {kpis.completedPercentage}% completion rate
        </span>
      ),
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      rawValue: kpis.inProgressWork,
      sublabel: (
        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {kpis.inProgressPercentage}% in active review
        </span>
      ),
      icon: Clock,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-300 dark:hover:border-amber-700',
    },
    {
      id: 'technologies',
      label: 'Technologies Used',
      rawValue: kpis.technologiesUsed,
      sublabel: (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Distinct tech stacks
        </span>
      ),
      icon: Cpu,
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
      borderHover: 'hover:border-cyan-300 dark:hover:border-cyan-700',
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
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCardClick && onCardClick(c.id)}
            className={`bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-shadow hover:shadow-xs cursor-pointer ${c.borderHover} group`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 line-clamp-1">
                {c.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              <AnimatedNumber value={c.rawValue} />
            </div>
            <div className="mt-1">{c.sublabel}</div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
