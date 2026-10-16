'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { Product, ResaleDisclosureSettings } from '@/lib/types';
import { Sliders, X, Shield, Eye, Check } from 'lucide-react';

interface ResaleSettingsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ResaleSettingsModal({ product, isOpen, onClose }: ResaleSettingsModalProps) {
  const { updateResaleDisclosure } = useReLife();
  const [settings, setSettings] = useState<ResaleDisclosureSettings>(
    product.resaleDisclosure || {
      showSerialNumber: true,
      showPurchasePrice: false,
      showFullTimeline: true,
      showDocumentProofs: true,
      showHealthScoreBreakdown: true,
      showTechnicianNotes: true,
      customPublicNote: '',
    }
  );
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof ResaleDisclosureSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateResaleDisclosure(product.id, settings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Resale Passport Controls</h3>
              <p className="text-xs text-stone-500">Configure what prospective buyers can inspect.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
          <div className="space-y-3">
            {[
              {
                key: 'showSerialNumber',
                label: 'Show Full Hardware Serial Number',
                desc: 'Allows buyers to check OEM activation lock and warranty databases.',
              },
              {
                key: 'showPurchasePrice',
                label: 'Disclose Original Purchase Price',
                desc: 'Shows what you originally paid for the device.',
              },
              {
                key: 'showFullTimeline',
                label: 'Include Complete Repair Timeline',
                desc: 'Displays all logged service dates, replaced parts, and costs.',
              },
              {
                key: 'showDocumentProofs',
                label: 'Show Document Verification Proofs',
                desc: 'Proves receipts exist without exposing your billing address.',
              },
              {
                key: 'showTechnicianNotes',
                label: 'Disclose Technician Inspection Notes',
                desc: 'Shares detailed workshop diagnostic commentary.',
              },
            ].map(({ key, label, desc }) => (
              <label
                key={key}
                className="flex items-start justify-between gap-3 p-3 rounded-xl border border-stone-200/80 hover:bg-stone-50 cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-stone-900 block">{label}</span>
                  <span className="text-[11px] text-stone-500 leading-snug">{desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(settings[key as keyof ResaleDisclosureSettings])}
                  onChange={() => handleToggle(key as keyof ResaleDisclosureSettings)}
                  className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Public Seller Statement / Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Clean condition, always housed in case. Includes original OEM charger."
              value={settings.customPublicNote || ''}
              onChange={(e) => setSettings({ ...settings, customPublicNote: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-emerald-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white flex items-center gap-1.5 shadow-xs"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Disclosures</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
