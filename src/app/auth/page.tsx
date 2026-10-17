'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { DEMO_PERSONAS, DemoPersonaKey } from '@/lib/auth-personas';
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  User,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Package,
  Wrench,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const { login, signup, loginAsDemo, activePersonaKey } = useReLife();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'consumer' | 'technician'>('consumer');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Welcome back! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 600);
    } else {
      setErrorMessage(res.error || 'Invalid email or password.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (password.length < 6) {
      setIsLoading(false);
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const res = await signup(email, password, fullName, role);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Account provisioned successfully! Loading your vault...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 600);
    } else {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  const handlePersonaSelect = (personaKey: DemoPersonaKey) => {
    loginAsDemo(personaKey);
    setSuccessMessage(`Signed in as ${DEMO_PERSONAS[personaKey].name}! Redirecting...`);
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-950 flex items-center justify-center text-emerald-400 shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-stone-900">
              Re<span className="text-emerald-700">Life</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            {tab === 'signup' ? 'Create Custodian Account' : 'Sign In to Custodian Vault'}
          </h1>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            Access your private digital product passports, verified repair milestones, and confidential invoices.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Cloud Status Indicator */}
          <div className="bg-stone-50 border-b border-stone-200 px-4 py-2.5 flex items-center justify-between text-[11px] text-stone-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-emerald-600'}`} />
              {isSupabaseConfigured ? 'Cloud Vault Connected' : 'Encrypted Storage Vault Active'}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
              Zero Leakage
            </span>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-stone-200 bg-stone-50/60 p-1 text-xs font-semibold text-stone-600">
            <button
              onClick={() => { setTab('signin'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                tab === 'signin' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                tab === 'signup' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'hover:text-stone-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Content */}
          <div className="p-6">
            {tab === 'signup' ? (
              /* Sign Up Form */
              <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Lin"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600 text-xs text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="maya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600 text-xs text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600 text-xs text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('consumer')}
                      className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all whitespace-nowrap ${
                        role === 'consumer'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      Hardware Caretaker
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('technician')}
                      className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all whitespace-nowrap ${
                        role === 'technician'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      Certified Technician
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 mt-4 whitespace-nowrap"
                >
                  {isLoading ? (
                    <span>Provisioning Custodian Account...</span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Sign In Form */
              <div className="space-y-5">
                <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="elena@relife-demo.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600 text-xs text-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-stone-700">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('aarav.sharma@relife.in');
                          setPassword('custodian2026!');
                        }}
                        className="text-[10px] text-emerald-700 hover:underline font-semibold whitespace-nowrap"
                      >
                        Auto-fill Aarav Credentials
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600 text-xs text-stone-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 mt-4 whitespace-nowrap"
                  >
                    {isLoading ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <span>Sign In to Vault</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>
                </form>

                {/* Pre-configured profiles section */}
                <div className="pt-4 border-t border-stone-200 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Or Sign In with Pre-Configured Profile:
                  </span>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handlePersonaSelect('aarav')}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 group ${
                        activePersonaKey === 'aarav' || activePersonaKey === 'elena'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={DEMO_PERSONAS.aarav.avatar}
                        alt={DEMO_PERSONAS.aarav.name}
                        className="w-9 h-9 rounded-full object-cover border border-emerald-500/40 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-900 truncate">
                            {DEMO_PERSONAS.aarav.name}
                          </h4>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 shrink-0">
                            Registered Owner
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 truncate">
                          4 Passports • 2 Verified Repairs • Invoices
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePersonaSelect('priya')}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 group ${
                        activePersonaKey === 'priya' || activePersonaKey === 'liam'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={DEMO_PERSONAS.priya.avatar}
                        alt={DEMO_PERSONAS.priya.name}
                        className="w-9 h-9 rounded-full object-cover border border-stone-300 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-900 truncate">
                            {DEMO_PERSONAS.priya.name}
                          </h4>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 shrink-0">
                            Fleet Lead
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 truncate">
                          4 Passports • Mobile & Imaging Fleet
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePersonaSelect('vikram')}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 group ${
                        activePersonaKey === 'vikram' || activePersonaKey === 'alex'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={DEMO_PERSONAS.vikram.avatar}
                        alt={DEMO_PERSONAS.vikram.name}
                        className="w-9 h-9 rounded-full object-cover border border-amber-400 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-900 truncate">
                            {DEMO_PERSONAS.vikram.name}
                          </h4>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 shrink-0">
                            Technician
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 truncate">
                          4 Lab Assets • Pending Service Submissions
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security & Vault Privacy Notice */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200/80 text-center space-y-1 text-xs">
          <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Zero-Knowledge Custodian Privacy Guaranteed</span>
          </div>
          <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
            Ownership records and documents are cryptographically isolated to your authenticated custodian identity.
          </p>
        </div>
      </div>
    </div>
  );
}
