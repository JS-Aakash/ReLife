'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { DEMO_PERSONAS } from '@/lib/auth-personas';
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
      }, 500);
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
      }, 500);
    } else {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  const handlePersonaSelect = (personaKey: 'elena' | 'liam' | 'alex') => {
    loginAsDemo(personaKey);
    setSuccessMessage(`Signed in as ${DEMO_PERSONAS[personaKey].name}!`);
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#0a261c] to-[#071912] p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-400 block">
                ReLife Vault Access
              </span>
              <h2 className="text-lg font-black tracking-tight text-white">
                {tab === 'signup' ? 'Create Custodian Account' : 'Sign In to Your Fleet'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-emerald-200/80 leading-relaxed">
            Access your private digital product passports, invoices, warranty alerts, and repair ledger.
          </p>

          {/* Cloud Sync Status Badge */}
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>
              {isSupabaseConfigured
                ? 'Supabase Cloud Auth & Row Level Security Active'
                : 'Secure Encrypted Vault Active'}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-1 text-xs font-semibold text-stone-600 shrink-0">
          <button
            onClick={() => { setTab('signin'); setErrorMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all whitespace-nowrap ${
              tab === 'signin' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setErrorMessage(null); }}
            className={`flex-1 py-2 rounded-xl transition-all whitespace-nowrap ${
              tab === 'signup' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
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
                        setEmail('elena@relife-demo.org');
                        setPassword('demo123');
                      }}
                      className="text-[10px] text-emerald-700 hover:underline font-semibold whitespace-nowrap"
                    >
                      Fill Elena Credentials
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

              {/* Pre-configured profiles */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Or Sign In with Pre-Configured Profile:
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('elena')}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-2.5 group ${
                      activePersonaKey === 'elena'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={DEMO_PERSONAS.elena.avatar}
                      alt={DEMO_PERSONAS.elena.name}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-900 truncate">Elena Rostova</span>
                        <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-emerald-100 text-emerald-900 shrink-0">
                          Owner
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 block truncate">
                        3 Passports • Verified Repairs
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('liam')}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-2.5 group ${
                      activePersonaKey === 'liam'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={DEMO_PERSONAS.liam.avatar}
                      alt={DEMO_PERSONAS.liam.name}
                      className="w-8 h-8 rounded-full object-cover border border-stone-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-900 truncate">Liam Sterling</span>
                        <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-blue-100 text-blue-900 shrink-0">
                          Buyer
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 block truncate">
                        Recipient Account • Ready for Custody Transfer
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePersonaSelect('alex')}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-2.5 group ${
                      activePersonaKey === 'alex'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={DEMO_PERSONAS.alex.avatar}
                      alt={DEMO_PERSONAS.alex.name}
                      className="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-stone-900 truncate">Alex Rivera</span>
                        <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-amber-100 text-amber-900 shrink-0">
                          Technician
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 block truncate">
                        Certified Technician Portal
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
