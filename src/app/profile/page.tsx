'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
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
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function ProfilePage() {
  const { currentUser, products, resetToDemoData } = useReLife();
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Account & Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Manage your custodian profile, alert preferences, and data synchronization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: User Profile Card (4 Cols) */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-600 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">{currentUser.name}</h3>
              <p className="text-xs text-stone-500">{currentUser.email}</p>
              <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-2">
                Custodian (Consumer Role)
              </span>
            </div>

            <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Assets</span>
                <span className="font-bold text-stone-800">{products.length}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Status</span>
                <span className="font-bold text-emerald-700">Verified</span>
              </div>
            </div>
          </div>

          {/* Data Persistence Telemetry */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Storage Architecture</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="font-semibold text-stone-800 block">
                {isSupabaseConfigured ? 'Supabase Connected' : 'Client Persistent Engine (Active)'}
              </span>
              <p className="text-[11px] text-stone-500 leading-snug">
                {isSupabaseConfigured
                  ? 'Authenticated PostgreSQL & Row-Level Security active.'
                  : 'State seamlessly synced to browser LocalStorage. Page reloads will not erase your fleet.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Preferences & Demo Controls (8 Cols) */}
        <div className="md:col-span-8 space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-5 text-xs">
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
                  {
                    key: 'weeklyEcoSummary',
                    label: 'Weekly Circular Economy Digest',
                    desc: 'Summary of e-waste avoided and lifespan extension across your registered items.',
                  },
                ].map(({ key, label, desc }) => (
                  <label
                    key={key}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50 cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-stone-800 block">{label}</span>
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

          {/* Hackathon Judge & Demo Controls */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>Hackathon Demonstration & Data Management</span>
            </h2>

            <p className="text-stone-500 leading-relaxed">
              Use these tools during live judge evaluations to reset to factory demo seed data or backup your fleet.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className={`px-4 py-2.5 rounded-xl font-semibold border transition-all flex items-center gap-2 ${
                  resetConfirm
                    ? 'border-amber-400 bg-amber-50 text-amber-900 animate-pulse'
                    : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-stone-500" />
                <span>{resetConfirm ? 'Click again to confirm reset' : 'Reset to Sample Seed Data'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-2.5 rounded-xl font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-stone-500" />
                <span>Export Fleet JSON Backup</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
