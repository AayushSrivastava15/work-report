import React from 'react';
import type { WorkEntryResponse } from '../../types';
import { Modal } from '../common/Modal';
import {
  Calendar,
  FolderKanban,
  Tag,
  Cpu,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileEdit,
  Send,
  RotateCcw,
  Check,
  X,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';

interface WorkEntryDetailsModalProps {
  entry: WorkEntryResponse | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  isManager?: boolean;
  isIndividual?: boolean;
  currentUserId?: number;
  onEdit?: (entry: WorkEntryResponse) => void;
  onDelete?: (entry: WorkEntryResponse) => void;
  onSubmit?: (entry: WorkEntryResponse) => void;
  onWithdraw?: (entry: WorkEntryResponse) => void;
  onApprove?: (entry: WorkEntryResponse) => void;
  onReject?: (entry: WorkEntryResponse) => void;
}

export const WorkEntryDetailsModal: React.FC<WorkEntryDetailsModalProps> = ({
  entry,
  isOpen,
  onClose,
  isAdmin = false,
  isManager = false,
  isIndividual = false,
  currentUserId,
  onEdit,
  onDelete,
  onSubmit,
  onWithdraw,
  onApprove,
  onReject,
}) => {
  if (!entry) return null;

  const normalizedStatus = (entry.status || 'DRAFT').toUpperCase();

  const getStatusBadge = () => {
    switch (normalizedStatus) {
      case 'APPROVED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {isIndividual ? 'Completed' : 'Approved'}
          </span>
        );
      case 'PENDING':
      case 'SUBMITTED':
      case 'IN PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-2xs">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {isIndividual ? 'In Progress' : 'Pending Review'}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Rejected
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-2xs">
            <FileEdit className="w-3.5 h-3.5 mr-1" />
            Draft
          </span>
        );
    }
  };

  const isDraft = normalizedStatus === 'DRAFT';
  const isPending = normalizedStatus === 'PENDING' || normalizedStatus === 'SUBMITTED';
  const isApproved = normalizedStatus === 'APPROVED' || normalizedStatus === 'COMPLETED';
  const isRejected = normalizedStatus === 'REJECTED';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Work Report Entry Details">
      <div className="space-y-5">
        {/* Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{entry.title}</h3>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Entry ID #{entry.id}</div>
          </div>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Rejection Alert Callout if Rejected */}
        {isRejected && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <div className="font-bold text-rose-900 dark:text-rose-200">Report Review Feedback</div>
                <p className="mt-1 text-rose-800 dark:text-rose-300 leading-relaxed">
                  {entry.rejectionReason || 'This report was returned for correction. Please update the necessary details and resubmit.'}
                </p>
                {entry.reviewerName && (
                  <div className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-2">
                    Reviewed by: {entry.reviewerName}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/80 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          {/* Project */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Project</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{entry.projectName || `Project #${entry.projectId}`}</div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Work Date</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{entry.date}</div>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{entry.category}</div>
            </div>
          </div>

          {/* Technology */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Technology</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono text-xs">{entry.technology || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Audit & Lifecycle Info */}
        {(entry.submittedAt || entry.reviewedAt || entry.reviewerName) && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-4">
            {entry.submittedAt && (
              <div className="flex items-center space-x-1.5">
                <Send className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Submitted: {new Date(entry.submittedAt).toLocaleString()}</span>
              </div>
            )}
            {entry.reviewedAt && (
              <div className="flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Reviewed: {new Date(entry.reviewedAt).toLocaleString()}</span>
              </div>
            )}
            {entry.reviewerName && (
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Reviewer: {entry.reviewerName}</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Description & Deliverables</div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto shadow-2xs">
            {entry.description || <span className="italic text-slate-400 dark:text-slate-500">No detailed description provided.</span>}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Solo / Individual Workspace Direct Completion */}
            {isIndividual && (isDraft || isPending) && (onApprove || onSubmit) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onApprove) onApprove(entry);
                  else if (onSubmit) onSubmit(entry);
                }}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Mark as Completed
              </button>
            )}

            {/* Solo Workspace Reopen / Withdraw */}
            {isIndividual && (isPending || isApproved) && onWithdraw && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => {
                  onClose();
                  onWithdraw(entry);
                }}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reopen as Draft
              </motion.button>
            )}

            {/* Company Draft Actions */}
            {!isIndividual && isDraft && onSubmit && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => {
                  onClose();
                  onSubmit(entry);
                }}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Submit for Review
              </motion.button>
            )}

            {/* Company Pending Actions */}
            {!isIndividual && isPending && onWithdraw && !isAdmin && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => {
                  onClose();
                  onWithdraw(entry);
                }}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Withdraw to Draft
              </motion.button>
            )}

            {/* Company Review Actions (Admin & Manager) */}
            {!isIndividual && isPending && (isAdmin || (isManager && entry.userId !== currentUserId)) && onApprove && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => {
                  onClose();
                  onApprove(entry);
                }}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                {isAdmin && entry.userId === currentUserId ? 'Approve & Mark Completed' : 'Approve'}
              </motion.button>
            )}

            {!isIndividual && isPending && (isAdmin || isManager) && entry.userId !== currentUserId && onReject && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => {
                  onClose();
                  onReject(entry);
                }}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Reject
              </motion.button>
            )}

            {/* Edit (allowed for Draft, Rejected, Admin, or Solo user) */}
            {(isDraft || isRejected || isAdmin || isIndividual) && onEdit && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(entry);
                }}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5 mr-1.5" />
                {isRejected ? 'Edit & Resubmit' : 'Edit Entry'}
              </motion.button>
            )}

            {/* Delete (allowed for Draft, Admin, or Solo user) */}
            {(isDraft || isAdmin || isIndividual) && onDelete && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(entry);
                }}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </motion.button>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-auto"
          >
            Close
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};
