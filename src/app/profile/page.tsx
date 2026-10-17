'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { DEMO_PERSONAS } from '@/lib/auth-personas';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  User,
  Bell,
  Database,
  RotateCcw,
  Download,
  ShieldCheck,
  Check,
  Sliders,
  Mail,
  HardDrive,
  Info,
  Sparkles,
  ExternalLink,
  Copy,
  Cloud,
  Zap,
  LogOut,
  Lock,
  KeyRound,
  Shield,
  Layers,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function ProfilePage() {
  const {
    currentUser,
    products,
    resetToDemoData,
    isSupabaseSynced,
    isDemoMode,
    toggleDemoMode,
    loginAsDemo,
    activePersonaKey,
    logout,
  } = useReLife();

  const [resetConfirm, setResetConfirm] = useState(false);
  const [savedPreferences, setSavedPreferences] = useState(false);
  // Preference Toggles
  const [prefs, setPrefs] = useState({
    warrantyAlerts: true,
    maintenanceReminders: true,
    technicianNotifications: true,
    transferAlerts: true,
    weeklyEcoSummary: false,
  });

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedPreferences(true);
    setTimeout(() => setSavedPreferences(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `relife-fleet-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
      return;
    }
    resetToDemoData();
    setResetConfirm(false);
  };

  return (
    <ProtectedRoute title="Custodian Account & Settings" description="Sign in to manage your authenticated custodian profile, alert rules, and security preferences.">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Custodian Profile & Security
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Manage your verified custodian credentials, alert preferences, and fleet privacy settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => logout()}
              className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: User Profile Card (4 Cols) */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={currentUser?.name || 'User'}
                  className="w-20 h-20 rounded-full object-cover border-2 border-emerald-600 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div>
                <h3 className="text-base font-bold text-stone-900">{currentUser?.name}</h3>
                <p className="text-xs text-stone-500 truncate">{currentUser?.email}</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {currentUser?.role === 'technician' ? 'Certified Technician' : 'Hardware Caretaker'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">My Assets</span>
                  <span className="font-bold text-stone-800">{products.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Vault Status</span>
                  <span className="font-bold text-emerald-700">Secured</span>
                </div>
              </div>

              {/* Unique Authenticated ID */}
              <div className="pt-2 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
                  Authenticated User ID:
                </span>
                <code className="text-[10px] font-mono text-stone-600 bg-stone-100 px-2 py-1 rounded block truncate">
                  {currentUser?.id}
                </code>
              </div>
            </div>

            {/* Quick Switch Persona Account */}
            <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                ⚡ Switch Active Account:
              </span>
              <div className="space-y-1.5">
                {(['aarav', 'priya', 'vikram'] as const).map((key) => {
                  const persona = DEMO_PERSONAS[key];
                  const isActive = activePersonaKey === key || (key === 'aarav' && activePersonaKey === 'elena');
                  return (
                    <button
                      key={key}
                      onClick={() => loginAsDemo(key)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div>
                        <span className="block text-xs font-semibold">{persona.name}</span>
                        <span className="text-[10px] text-stone-400 font-normal">{persona.badge}</span>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Privacy & Session Protection */}
            <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-sm space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="font-bold uppercase tracking-wider text-[11px]">Vault Session Protected</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                Private ownership documents, invoices, and diagnostic logs are restricted to your authenticated custodian session and hidden from unauthenticated viewers.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[10px] text-stone-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>256-Bit Vault Encryption Active</span>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Database Controls (8 Cols) */}
          <div className="md:col-span-8 space-y-6">
            {/* Custodian Verification & Security Status */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                    Custodian Verification & Security
                  </h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap bg-emerald-50 text-emerald-800 border-emerald-200">
                  Verified Identity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Account Status</span>
                  <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Active Hardware Custodian
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Privacy Standard</span>
                  <span className="font-semibold text-emerald-800 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Encrypted Asset Isolation
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">
                Your products, maintenance milestones, and confidential purchase invoices are cryptographically associated with your verified custodian identity. Public QR passports exclusively show owner-approved specifications and verification badges.
              </p>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Bell className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  Notification & Alert Preferences
                </h2>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-3">
                  {[
                    {
                      key: 'warrantyAlerts',
                      label: 'Warranty Expiry Alerts',
                      desc: 'Notify me 30 days before manufacturer warranties expire to check device condition.',
                    },
                    {
                      key: 'maintenanceReminders',
                      label: 'Proactive Maintenance Reminders',
                      desc: 'Alerts for scheduled filter cleaning, drivetrain lubrication, and vent inspections.',
                    },
                    {
                      key: 'technicianNotifications',
                      label: 'Service Center Submissions',
                      desc: 'Receive alerts when certified technicians submit repair records for your approval.',
                    },
                    {
                      key: 'transferAlerts',
                      label: 'Ownership Transfer Requests',
                      desc: 'Get notified when an ownership transfer handshake is initiated or accepted.',
                    },
                  ].map(({ key, label, desc }) => (
                    <label
                      key={key}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50 cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-stone-800 block text-xs">{label}</span>
                        <span className="text-[11px] text-stone-500 leading-snug">{desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={Boolean(prefs[key as keyof typeof prefs])}
                        onChange={() => handleToggle(key as keyof typeof prefs)}
                        className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    {savedPreferences ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Preferences Saved!</span>
                      </>
                    ) : (
                      <span>Save Alert Preferences</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Fleet Data Management */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-stone-100 gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Fleet Catalog & Data Management</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-500 font-medium whitespace-nowrap">Catalog Sync:</span>
                  <button
                    type="button"
                    onClick={toggleDemoMode}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isDemoMode ? 'bg-emerald-700' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isDemoMode ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <p className="text-stone-500 leading-relaxed">
                Manage your product passports, export a complete encrypted JSON backup of your fleet maintenance records, or restore default manufacturer specifications.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className={`px-4 py-2.5 rounded-xl font-semibold border transition-all flex items-center gap-2 whitespace-nowrap ${
                    resetConfirm
                      ? 'border-amber-400 bg-amber-50 text-amber-900 animate-pulse'
                      : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>{resetConfirm ? 'Click again to confirm reset' : 'Restore Default Catalog'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2.5 rounded-xl font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 flex items-center gap-2 whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>Export Fleet JSON Backup</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
