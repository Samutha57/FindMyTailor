import React from 'react';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ORDER_PLACED: {
    label: 'Order Placed',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Accepted',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: CheckCircle2,
  },
  MEASUREMENT: {
    label: 'Measurement',
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    icon: Ruler,
  },
  CUTTING: {
    label: 'Fabric Cutting',
    color: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    icon: Scissors,
  },
  STITCHING: {
    label: 'Stitching in Progress',
    color: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: Layers,
  },
  FINISHING: {
    label: 'Finishing Touches',
    color: 'bg-violet-50 text-violet-800 border-violet-200',
    icon: Sparkles,
  },
  QUALITY_CHECK: {
    label: 'Quality Check',
    color: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: ShieldCheck,
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    color: 'bg-teal-50 text-teal-800 border-teal-200',
    icon: PackageCheck,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: XCircle,
  },
};

export default function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status.replace(/_/g, ' '),
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Clock,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border shadow-sm',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn(size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5')} />
      <span>{config.label}</span>
    </span>
  );
}
