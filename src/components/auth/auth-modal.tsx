'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { DEMO_PERSONAS, DemoPersonaKey } from '@/lib/auth-personas';
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  Wrench,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, defaultTab = 'signin', onSuccess }: AuthModalProps) {
  const { login, signup, loginAsDemo, activePersonaKey } = useReLife();
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'consumer' | 'technician'>('consumer');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Signed in successfully!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 400);
    } else {
      setErrorMessage(res.error || 'Failed to sign in. Please verify your credentials.');
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
      setSuccessMessage('Account created successfully!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 400);
    } else {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  const handlePersonaSelect = (personaKey: DemoPersonaKey) => {
    loginAsDemo(personaKey);
    setSuccessMessage(`Signed in as ${DEMO_PERSONAS[personaKey].name}!`);
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
    }, 400);
  };

  const autofillPreset = (personaKey: 'aarav' | 'priya' | 'vikram') => {
    if (personaKey === 'aarav') {
      setEmail('aarav.sharma@relife.in');
      setPassword('custodian2026!');
    } else if (personaKey === 'priya') {
      setEmail('priya.patel@relife.in');
      setPassword('fleet2026!');
    } else if (personaKey === 'vikram') {
      setEmail('vikram.malhotra@zenithrepairs.in');
      setPassword('service2026!');
    }
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs p-3 sm:p-4 md:p-6 flex items-start sm:items-center justify-center min-h-screen py-6 sm:py-10">
      {/* Backdrop overlay dismiss */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100vh-3rem)]">
        {/* Compact Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a261c] to-[#071912] px-5 py-4 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-300 block">
                ReLife Vault Access
              </span>
              <h2 className="text-base font-black tracking-tight text-white leading-tight">
                {tab === 'signup' ? 'Create Custodian Account' : 'Sign In to Your Fleet'}
              </h2>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-1 text-xs font-semibold text-stone-600 shrink-0">
          <button
            onClick={() => { setTab('signin'); setErrorMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all whitespace-nowrap ${tab === 'signin' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'hover:text-stone-900'
              }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setErrorMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all whitespace-nowrap ${tab === 'signup' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'hover:text-stone-900'
              }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
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
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all whitespace-nowrap ${role === 'consumer'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                  >
                    Hardware Caretaker
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('technician')}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all whitespace-nowrap ${role === 'technician'
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
                  <span>Provisioning Account...</span>
                ) : (
                  <>
                    <span>Create Secure Passport Account</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Sign In Form */
            <div className="space-y-4">
              {/* Demo autofill preset badges */}
              <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-600">
                  <span className="uppercase tracking-wider">Demo Account Presets</span>
                  <span className="text-emerald-700 font-medium">Click to prefill:</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => autofillPreset('aarav')}
                    className={`px-2 py-1.5 rounded-lg border text-center text-[11px] font-bold transition-all truncate ${email === 'aarav.sharma@relife.in'
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300'
                      }`}
                    title="Aarav Sharma (Registered Owner)"
                  >
                    Aarav (Owner)
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillPreset('priya')}
                    className={`px-2 py-1.5 rounded-lg border text-center text-[11px] font-bold transition-all truncate ${email === 'priya.patel@relife.in'
                      ? 'bg-blue-100 border-blue-400 text-blue-900 shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-blue-300'
                      }`}
                    title="Priya Patel (Fleet Operations Lead)"
                  >
                    Priya (Fleet)
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillPreset('vikram')}
                    className={`px-2 py-1.5 rounded-lg border text-center text-[11px] font-bold transition-all truncate ${email === 'vikram.malhotra@zenithrepairs.in'
                      ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300'
                      }`}
                    title="Vikram Malhotra (Certified Technician)"
                  >
                    Vikram (Tech)
                  </button>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSignIn} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="aarav.sharma@relife.in"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 mt-2 whitespace-nowrap"
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

              {/* Pre-configured profiles (1-Click Instant Sign In) */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Or 1-Click Instant Access (Demo Personas):
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('aarav')}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-2.5 group ${activePersonaKey === 'aarav' || activePersonaKey === 'elena'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                      : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                      }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={DEMO_PERSONAS.aarav.avatar}
                      alt={DEMO_PERSONAS.aarav.name}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-900 truncate">{DEMO_PERSONAS.aarav.name}</span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 shrink-0">
                          Owner
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 block truncate font-mono">
                        aarav.sharma@relife.in • pwd: custodian2026!
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('priya')}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-2.5 group ${activePersonaKey === 'priya' || activePersonaKey === 'liam'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                      : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                      }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={DEMO_PERSONAS.priya.avatar}
                      alt={DEMO_PERSONAS.priya.name}
                      className="w-8 h-8 rounded-full object-cover border border-stone-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-900 truncate">{DEMO_PERSONAS.priya.name}</span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 shrink-0">
                          Fleet Lead
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 block truncate font-mono">
                        priya.patel@relife.in • pwd: fleet2026!
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('vikram')}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-2.5 group ${activePersonaKey === 'vikram' || activePersonaKey === 'alex'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                      : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                      }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={DEMO_PERSONAS.vikram.avatar}
                      alt={DEMO_PERSONAS.vikram.name}
                      className="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-900 truncate">{DEMO_PERSONAS.vikram.name}</span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 shrink-0">
                          Technician
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 block truncate font-mono">
                        vikram.malhotra@zenithrepairs.in • pwd: service2026!
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
