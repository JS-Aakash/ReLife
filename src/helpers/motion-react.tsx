'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);
  return reduced;
}

export function AnimatePresence({
  children,
}: {
  children: React.ReactNode;
  initial?: boolean;
  mode?: string;
}) {
  return <>{children}</>;
}

interface MotionProps extends React.HTMLAttributes<HTMLElement> {
  animate?: {
    opacity?: number;
    transform?: string | string[];
    [key: string]: any;
  };
  initial?: any;
  exit?: any;
  transition?: any;
  children?: React.ReactNode;
}

function MotionDiv({ animate, initial, exit, transition, className, style, children, ...props }: MotionProps) {
  const isKeyframes = Array.isArray(animate?.transform);
  const transformStyle = isKeyframes ? undefined : (animate?.transform as string | undefined);
  const opacityStyle = animate?.opacity !== undefined ? animate.opacity : style?.opacity;

  const durationSec = transition?.transform?.duration ?? 5.2;

  return (
    <div
      className={`${className || ''} ${isKeyframes ? 'animate-receipt-feed' : ''}`}
      style={{
        ...style,
        opacity: opacityStyle,
        transform: transformStyle ?? style?.transform,
        transition: isKeyframes ? undefined : `opacity 0.25s ease, transform ${durationSec}s ease`,
        animationDuration: isKeyframes ? `${durationSec}s` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function MotionSpan({ animate, initial, exit, transition, className, style, children, ...props }: MotionProps) {
  const opacityStyle = animate?.opacity !== undefined ? animate.opacity : style?.opacity;
  const transformStyle = typeof animate?.transform === 'string' ? animate.transform : undefined;
  const durationSec = transition?.duration ?? 0.16;

  return (
    <span
      className={className}
      style={{
        ...style,
        opacity: opacityStyle,
        transform: transformStyle ?? style?.transform,
        transition: style?.transition || `opacity ${durationSec}s ease, transform ${durationSec}s ease`,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export const motion = {
  div: MotionDiv,
  span: MotionSpan,
};

export default motion;
