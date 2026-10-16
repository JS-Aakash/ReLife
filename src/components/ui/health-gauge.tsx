'use client';

import React from 'react';
import { HealthScoreBreakdown } from '@/lib/types';
import { CheckCircle2, AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface HealthGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function HealthGauge({ score, size = 'md', showLabel = true }: HealthGaugeProps) {
  const radius = size === 'sm' ? 24 : size === 'md' ? 42 : 56;
  const strokeWidth = size === 'sm' ? 5 : size === 'md' ? 7 : 9;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = '#10b981'; // emerald
  let bgColor = '#ecfdf5';
  let tier = 'Good';

  if (normalizedScore >= 85) {
    color = '#059669'; // forest emerald
    bgColor = '#ecfdf5';
    tier = 'Exceptional';
  } else if (normalizedScore >= 70) {
    color = '#10b981';
    bgColor = '#ecfdf5';
    tier = 'Good';
  } else if (normalizedScore >= 50) {
    color = '#f59e0b'; // amber
    bgColor = '#fffbeb';
    tier = 'Moderate';
  } else {
    color = '#ef4444'; // red
    bgColor = '#fef2f2';
    tier = 'Degraded';
  }

  const dimensions = {
    sm: 60,
    md: 104,
    lg: 136,
  }[size];

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: dimensions, height: dimensions }}>
        <svg
          className="transform -rotate-90"
          width={dimensions}
          height={dimensions}
          viewBox={`0 0 ${dimensions} ${dimensions}`}
        >
          {/* Background circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            stroke="#e5e5e0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="font-bold tracking-tight text-stone-900"
            style={{ fontSize: size === 'sm' ? '14px' : size === 'md' ? '24px' : '32px' }}
          >
            {normalizedScore}
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400 -mt-1">
              / 100
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Health Score
            </span>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: bgColor, color: color }}
            >
              {tier}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Maintainability & condition index
          </p>
        </div>
      )}
    </div>
  );
}

export function ExplainableHealthFactors({ breakdown }: { breakdown: HealthScoreBreakdown }) {
  if (!breakdown || !breakdown.factors) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 space-y-3.5">
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-700" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
            Explainable Health Score Breakdown
          </h4>
        </div>
        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Tier: {breakdown.tier}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {breakdown.factors.map((factor, index) => {
          const percentage = Math.round((factor.score / factor.maxScore) * 100);
          return (
            <div key={index} className="bg-white rounded-lg p-3 border border-stone-200/70 shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-stone-800">{factor.name}</span>
                <span className="font-mono font-medium text-stone-600">
                  {factor.score}/{factor.maxScore} pts
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${
                    factor.status === 'positive'
                      ? 'bg-emerald-600'
                      : factor.status === 'neutral'
                      ? 'bg-amber-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed">
                {factor.explanation}
              </p>
            </div>
          );
        })}
      </div>

      {breakdown.maintenanceAdvice && breakdown.maintenanceAdvice.length > 0 && (
        <div className="mt-2 pt-2 border-t border-stone-200 text-xs text-stone-600 space-y-1">
          <div className="font-semibold text-stone-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Recommended Maintenance:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-stone-500 text-[11px] pl-1">
            {breakdown.maintenanceAdvice.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
