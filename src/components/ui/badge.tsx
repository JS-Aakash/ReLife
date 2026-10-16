import React from 'react';
import { VerificationBadge, WarrantyStatus, ProductCategory } from '@/lib/types';
import { ShieldCheck, FileCheck, UserCheck, AlertTriangle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProvenanceBadge({
  badge,
  size = 'md',
  showIcon = true,
}: {
  badge: VerificationBadge;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}) {
  const configs = {
    'technician-verified': {
      label: 'Technician Verified',
      icon: ShieldCheck,
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/20',
      description: 'Inspected & digitally certified by verified service center',
    },
    'document-backed': {
      label: 'Document Backed',
      icon: FileCheck,
      classes: 'bg-blue-50 text-blue-800 border-blue-200 ring-1 ring-blue-300/20',
      description: 'Supported by uploaded proof of invoice or receipt',
    },
    'owner-reported': {
      label: 'Owner Reported',
      icon: UserCheck,
      classes: 'bg-stone-100 text-stone-700 border-stone-200',
      description: 'Self-reported maintenance history by product owner',
    },
  };

  const config = configs[badge] || configs['owner-reported'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border shadow-xs transition-all',
        config.classes,
        sizeClasses
      )}
      title={config.description}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
}

export function WarrantyBadge({
  status,
  daysRemaining,
}: {
  status: WarrantyStatus;
  daysRemaining: number;
}) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Active ({daysRemaining}d left)</span>
      </span>
    );
  }

  if (status === 'expiring_soon') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>Expires in {daysRemaining} days</span>
      </span>
    );
  }

  if (status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
        <Clock className="w-3.5 h-3.5 text-stone-400" />
        <span>Warranty Expired</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
      <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
      <span>Warranty Unknown</span>
    </span>
  );
}

export function CategoryBadge({ category }: { category: ProductCategory }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase bg-stone-100 text-stone-700 border border-stone-200">
      {category}
    </span>
  );
}
