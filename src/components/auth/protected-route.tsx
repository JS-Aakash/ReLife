'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { AuthModal } from './auth-modal';
import { DEMO_PERSONAS, DemoPersonaKey } from '@/lib/auth-personas';
import {
  Lock,
  Shield,
  ArrowRight,
  ShieldCheck,
  Package,
  Wrench,
  Sparkles,
  KeyRound,
  UserCheck,
} from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function ProtectedRoute({
  children,
  title = 'Custodian Authentication Required',
  description = 'This command center and private hardware records are protected with secure session isolation. Sign in to view and manage your verified product passports.',
}: ProtectedRouteProps) {
  const { isAuthenticated, authLoading, currentUser, loginAsDemo } = useReLife();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-stone-500 font-mono tracking-wider uppercase">
          Verifying Custodian Session & Security Partition...
        </p>
      </div>
    );
  }

  if (isAuthenticated && currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-950 flex items-center justify-center text-emerald-400 mx-auto shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Secure Vault Protected
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">{title}</h1>
          <p className="text-xs text-stone-500 leading-relaxed max-w-md mx-auto">{description}</p>
        </div>

        {/* 3 Demo Accounts Gateway - Direct 1-Click Access with visible credentials */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Select Demo Profile for 1-Click Access:
            </span>
            <span className="text-[10px] text-emerald-800 font-medium">Pre-configured demo data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Aarav Sharma */}
            <div className="rounded-2xl border border-stone-200 p-3.5 bg-stone-50 hover:bg-white hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={DEMO_PERSONAS.aarav.avatar}
                    alt={DEMO_PERSONAS.aarav.name}
                    className="w-9 h-9 rounded-full object-cover border border-emerald-500/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-stone-900 block truncate">
                      {DEMO_PERSONAS.aarav.name}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 inline-block">
                      Owner
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-stone-500 space-y-0.5">
                  <p className="font-medium text-stone-700">MacBook Pro, Sirrus Bike, Sony XM5, Dyson</p>
                  <p className="font-mono text-stone-400 truncate">aarav.sharma@relife.in</p>
                  <p className="font-mono text-emerald-700">pwd: custodian2026!</p>
                </div>
              </div>

              <button
                onClick={() => loginAsDemo('aarav')}
                className="mt-3 w-full py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors whitespace-nowrap"
              >
                <span>Enter as Aarav</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>

            {/* Priya Patel */}
            <div className="rounded-2xl border border-stone-200 p-3.5 bg-stone-50 hover:bg-white hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={DEMO_PERSONAS.priya.avatar}
                    alt={DEMO_PERSONAS.priya.name}
                    className="w-9 h-9 rounded-full object-cover border border-blue-400 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-stone-900 block truncate">
                      {DEMO_PERSONAS.priya.name}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 inline-block">
                      Fleet Lead
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-stone-500 space-y-0.5">
                  <p className="font-medium text-stone-700">iPhone 15 Pro, iPad Pro, Dell XPS, Fujifilm</p>
                  <p className="font-mono text-stone-400 truncate">priya.patel@relife.in</p>
                  <p className="font-mono text-blue-700">pwd: fleet2026!</p>
                </div>
              </div>

              <button
                onClick={() => loginAsDemo('priya')}
                className="mt-3 w-full py-2 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors whitespace-nowrap"
              >
                <span>Enter as Priya</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>

            {/* Vikram Malhotra */}
            <div className="rounded-2xl border border-stone-200 p-3.5 bg-stone-50 hover:bg-white hover:border-amber-500 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={DEMO_PERSONAS.vikram.avatar}
                    alt={DEMO_PERSONAS.vikram.name}
                    className="w-9 h-9 rounded-full object-cover border border-amber-400 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-stone-900 block truncate">
                      {DEMO_PERSONAS.vikram.name}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 inline-block">
                      Technician
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-stone-500 space-y-0.5">
                  <p className="font-medium text-stone-700">Fluke DMM, Weller Soldering, 3D Printer</p>
                  <p className="font-mono text-stone-400 truncate">vikram.malhotra@zenithrepairs.in</p>
                  <p className="font-mono text-amber-700">pwd: service2026!</p>
                </div>
              </div>

              <button
                onClick={() => loginAsDemo('vikram')}
                className="mt-3 w-full py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors whitespace-nowrap"
              >
                <span>Enter as Vikram</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary sign-in buttons */}
        <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              setAuthTab('signin');
              setAuthModalOpen(true);
            }}
            className="flex-1 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors whitespace-nowrap text-center flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>Sign In with Custom Email</span>
          </button>

          <button
            onClick={() => {
              setAuthTab('signup');
              setAuthModalOpen(true);
            }}
            className="flex-1 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors whitespace-nowrap text-center flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>Create New Custodian Account</span>
          </button>
        </div>

        {/* Security Safeguards footer */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-left flex items-start gap-2.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Strict user isolation enforced via PostgreSQL Row Level Security. Each user profile only accesses their own registered products, invoices, and private maintenance logs.
          </p>
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
