import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileEdit,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import type { KpiMetrics, WorkEntryResponse } from '../../types';

interface NeedsAttentionCardProps {
  kpis: KpiMetrics;
  recentEntries: WorkEntryResponse[];
  onSelectEntry: (entry: WorkEntryResponse) => void;
  onNavigateDrafts: () => void;
  onNavigatePending: () => void;
  onNavigateWorkEntries: () => void;
}

export const NeedsAttentionCard: React.FC<NeedsAttentionCardProps> = ({
  kpis,
  recentEntries,
  onSelectEntry,
  onNavigateDrafts,
  onNavigatePending,
}) => {
  // Find entries from existing recent list needing attention
  const pendingEntries = recentEntries.filter(
    (e) =>
      e.status === 'PENDING' ||
      e.status === 'Pending' ||
      e.status === 'In Progress' ||
      e.status === 'Submitted'
  );

  const draftEntries = recentEntries.filter(
    (e) => e.status === 'DRAFT' || e.status === 'Draft'
  );

  const rejectedEntries = recentEntries.filter(
    (e) => e.status === 'REJECTED' || e.status === 'Rejected'
  );

  const hasAttentionItems =
    kpis.draftWork > 0 ||
    kpis.inProgressWork > 0 ||
    kpis.rejectedWork > 0 ||
    pendingEntries.length > 0 ||
    draftEntries.length > 0 ||
    rejectedEntries.length > 0;

  if (!hasAttentionItems) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  You're all caught up
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  All Clear
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                No pending reviews, draft submissions, or rejected reports requiring your attention.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 transition-all space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Needs Attention
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deliverables and reviews awaiting action or submission
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {kpis.inProgressWork > 0 && (
            <button
              onClick={onNavigatePending}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Review Pending ({kpis.inProgressWork})
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {kpis.draftWork > 0 && (
            <button
              onClick={onNavigateDrafts}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              My Drafts ({kpis.draftWork})
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Attention Item Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Pending Review Summary Card */}
        {kpis.inProgressWork > 0 && (
          <div
            onClick={onNavigatePending}
            className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  <Clock className="w-3 h-3 text-amber-600" />
                  PENDING REVIEW
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                  {kpis.inProgressWork}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {kpis.inProgressWork === 1
                  ? '1 work deliverable is awaiting manager approval.'
                  : `${kpis.inProgressWork} work deliverables are awaiting approval or review.`}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1 mt-2.5 group-hover:translate-x-0.5 transition-transform">
              Review Work Logs <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        )}

        {/* Draft Reports Card */}
        {kpis.draftWork > 0 && (
          <div
            onClick={onNavigateDrafts}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <FileEdit className="w-3 h-3 text-slate-500" />
                  UNSUBMITTED DRAFTS
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {kpis.draftWork}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {kpis.draftWork === 1
                  ? '1 draft report has been saved but not yet submitted.'
                  : `${kpis.draftWork} draft reports have been saved and require completion.`}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-2.5 group-hover:translate-x-0.5 transition-transform">
              Continue Drafts <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        )}

        {/* Rejected Deliverables Card */}
        {kpis.rejectedWork > 0 && (
          <div
            onClick={onNavigateDrafts}
            className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  REJECTED / NEEDS REVISION
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                  {kpis.rejectedWork}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {kpis.rejectedWork === 1
                  ? '1 report was rejected and needs revision.'
                  : `${kpis.rejectedWork} reports were rejected and require revision before resubmission.`}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1 mt-2.5 group-hover:translate-x-0.5 transition-transform">
              View Issues <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        )}

        {/* Specific Attention Entries from Filtered List */}
        {[...pendingEntries, ...draftEntries, ...rejectedEntries].slice(0, 3).map((entry) => (
          <div
            key={entry.id}
            onClick={() => onSelectEntry(entry)}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-2xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                {entry.date}
              </span>
              <span
                className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  entry.status === 'DRAFT' || entry.status === 'Draft'
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    : entry.status === 'REJECTED' || entry.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {entry.status}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {entry.title}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              <span className="truncate">{entry.projectName}</span>
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                <Eye className="w-3 h-3" />
                View
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
