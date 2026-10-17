'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { AuthModal } from './auth-modal';
import {
  Lock,
  Shield,
  Zap,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function ProtectedRoute({
  children,
  title = 'Authentication Required',
  description = 'This custodian vault and private repair records are protected by PostgreSQL Row Level Security (RLS). Sign in to view and manage your verified products.',
}: ProtectedRouteProps) {
  const { isAuthenticated, authLoading, currentUser, loginAsDemo } = useReLife();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-stone-500 font-mono tracking-wider uppercase">
          Verifying Custodian Session & RLS Permissions...
        </p>
      </div>
    );
  }

  if (isAuthenticated && currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-950 flex items-center justify-center text-emerald-400 mx-auto shadow-md">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Row Level Security Active
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">{title}</h1>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">{description}</p>
        </div>

        {/* Feature Security Safeguards */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Strict Custodian Privacy</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-normal">
            Each user accesses only their own products, confidential purchase bills, private maintenance notes, and ownership tokens.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Quick Profile Access */}
          <button
            onClick={() => loginAsDemo('elena')}
            className="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors whitespace-nowrap"
          >
            <span>Sign In as Elena Rostova (Registered Owner)</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setAuthTab('signin');
                setAuthModalOpen(true);
              }}
              className="py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors whitespace-nowrap"
            >
              Sign In
            </button>

            <button
              onClick={() => {
                setAuthTab('signup');
                setAuthModalOpen(true);
              }}
              className="py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors whitespace-nowrap"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        defaultTab={authTab}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
