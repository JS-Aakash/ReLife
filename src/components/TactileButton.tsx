'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  depth?: 'shallow' | 'regular' | 'deep';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export function TactileButton({
  depth = 'regular',
  size = 'md',
  href,
  children,
  className,
  ...props
}: TactileButtonProps) {
  const depthClasses = {
    shallow: 'border-b-2 active:translate-y-[1px] active:border-b',
    regular: 'border-b-3 active:translate-y-[2px] active:border-b',
    deep: 'border-b-4 active:translate-y-[3px] active:border-b-2',
  }[depth];

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
    md: 'px-3.5 py-1.5 text-xs font-semibold gap-2 rounded-xl',
    lg: 'px-5 py-2.5 text-sm font-bold gap-2.5 rounded-xl',
  }[size];

  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all select-none',
    'bg-stone-800 text-stone-100 hover:bg-stone-700 hover:text-white border-stone-950 shadow-xs cursor-pointer',
    depthClasses,
    sizeClasses,
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
}
