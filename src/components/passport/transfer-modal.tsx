'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { Product } from '@/lib/types';
import {
  ArrowRightLeft,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Info,
  X,
  Users,
} from 'lucide-react';
import Link from 'next/link';

interface TransferModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function TransferModal({ product, isOpen, onClose }: TransferModalProps) {
  const { initiateTransfer } = useReLife();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [transferType, setTransferType] = useState<'private_sale' | 'gift' | 'other'>('private_sale');
  const [agreedPrice, setAgreedPrice] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) return;

    const request = initiateTransfer(
      product.id,
      recipientEmail,
      transferType,
      agreedPrice ? Number(agreedPrice) : undefined
    );

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setGeneratedLink(`${origin}/transfer/${request.token}`);
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Transfer Digital Passport</h3>
              <p className="text-xs text-stone-500">
                Hand off immutable ownership and service history to the new caretaker.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!generatedLink ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* What is transferred vs redacted summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950">
                <span className="font-semibold block mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Preserved & Transferred
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-800">
                  <li>Full verified repair ledger</li>
                  <li>Health Score & benchmarks</li>
                  <li>Original specs & serial number</li>
                  <li>Chain of custody milestone</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-stone-100/80 border border-stone-200 text-stone-800">
                <span className="font-semibold block mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-stone-600" />
                  Redacted & Protected
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-stone-600">
                  <li>Private payment card bills</li>
                  <li>Original purchase invoice</li>
                  <li>Personal address & contacts</li>
                  <li>Private maintenance notes</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                required
                placeholder="newowner@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Transfer Mode
                </label>
                <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                >
                  <option value="private_sale">Second-Hand Sale</option>
                  <option value="gift">Gift / Donation</option>
                  <option value="other">Other Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Agreed Price (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1200"
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 whitespace-nowrap shrink-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs whitespace-nowrap shrink-0"
              >
                Generate Transfer Link
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                <Check className="w-5 h-5 text-emerald-700" />
              </div>
              <h4 className="text-sm font-bold text-emerald-950">Transfer Invitation Ready</h4>
              <p className="text-xs text-emerald-800 mt-1">
                Send this secure authorization link to <strong>{recipientEmail}</strong>. When they accept, the passport custodian will transfer seamlessly.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Secure Handshake URL (Valid for 7 days)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full text-xs font-mono px-3 py-2 bg-white rounded-lg border border-stone-300 text-stone-700 select-all"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 bg-white rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 shrink-0"
                  title="Copy Link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <Link
                href={generatedLink.replace(/^https?:\/\/[^/]+/, '')}
                target="_blank"
                className="text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <span>Open Recipient Acceptance Page</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </Link>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium bg-stone-900 text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
