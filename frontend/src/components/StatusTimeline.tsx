import React from 'react';
import { cn, formatDateTime } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Scissors,
  Ruler,
  Layers,
  Sparkles,
  PackageCheck,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const WORKFLOW_STAGES = [
  { id: 'ORDER_PLACED', label: 'Order Placed', icon: Clock },
  { id: 'ACCEPTED', label: 'Accepted', icon: UserCheck },
  { id: 'MEASUREMENT', label: 'Measurement', icon: Ruler },
  { id: 'CUTTING', label: 'Cutting', icon: Scissors },
  { id: 'STITCHING', label: 'Stitching', icon: Layers },
  { id: 'FINISHING', label: 'Finishing', icon: Sparkles },
  { id: 'QUALITY_CHECK', label: 'Quality Check', icon: ShieldCheck },
  { id: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: PackageCheck },
  { id: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
];

export interface StatusHistoryItem {
  id: string;
  status: string;
  note?: string | null;
  createdAt: string;
  changedBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

interface StatusTimelineProps {
  currentStatus: string;
  history?: StatusHistoryItem[];
  className?: string;
}

export default function StatusTimeline({
  currentStatus,
  history = [],
  className,
}: StatusTimelineProps) {
  const isRejected = currentStatus === 'REJECTED';
  const currentStageIndex = WORKFLOW_STAGES.findIndex((s) => s.id === currentStatus);

  return (
    <div className={cn('space-y-8', className)}>
      {/* If rejected, show clear notification banner */}
      {isRejected ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-rose-900 text-lg">Order Rejected</h3>
            <p className="text-rose-700 text-sm mt-1">
              This order could not be accepted by the tailor. Please check the update history
              below for tailor comments.
            </p>
          </div>
        </div>
      ) : (
        /* Progress Stepper */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Live Progress Workflow</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current Stage:{' '}
                <span className="font-medium text-blue-600">
                  {WORKFLOW_STAGES.find((s) => s.id === currentStatus)?.label || currentStatus}
                </span>
              </p>
            </div>
            <StatusBadge status={currentStatus} size="sm" />
          </div>

          {/* Stepper horizontal on large screens, vertical on mobile */}
          <div className="hidden lg:flex items-center justify-between relative">
            <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 -z-0">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${
                    currentStageIndex >= 0
                      ? (currentStageIndex / (WORKFLOW_STAGES.length - 1)) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            {WORKFLOW_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPast = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;

              return (
                <div key={stage.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all shadow-sm',
                      isPast
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'bg-white border-2 border-blue-600 text-blue-600 ring-4 ring-blue-100'
                        : 'bg-white border border-slate-200 text-slate-400'
                    )}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={cn(
                      'text-xs mt-2 text-center max-w-[85px] leading-tight font-medium',
                      isCurrent
                        ? 'text-blue-700 font-semibold'
                        : isPast
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile Stepper */}
          <div className="lg:hidden space-y-3">
            {WORKFLOW_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPast = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;

              return (
                <div key={stage.id} className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0',
                      isPast
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'bg-blue-50 border-2 border-blue-600 text-blue-600 ring-2 ring-blue-100'
                        : 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <span
                      className={cn(
                        'text-sm',
                        isCurrent
                          ? 'font-semibold text-blue-700'
                          : isPast
                          ? 'font-medium text-slate-800'
                          : 'text-slate-400'
                      )}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      Active
                    </span>
                  )}
                  {isPast && (
                    <span className="text-xs text-slate-400">Completed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status History Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Status Update History & Audit Log</span>
        </h4>

        {history.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No status history available yet.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {history.map((item, idx) => (
              <div key={item.id || idx} className="relative group">
                {/* Node dot */}
                <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-50" />

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-xs text-slate-500">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>

                  {item.note && (
                    <p className="text-sm text-slate-700 mt-1 font-normal leading-relaxed">
                      {item.note}
                    </p>
                  )}

                  {item.changedBy && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Updated by:</span>
                      <span className="font-medium text-slate-700">
                        {item.changedBy.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold">
                        {item.changedBy.role}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
