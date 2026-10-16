'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRightLeft,
  ShieldCheck,
  Lock,
  Check,
  AlertCircle,
  Package,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClaimTransferPage() {
  const params = useParams();
  const router = useRouter();
  const { getTransferByToken, acceptTransfer } = useReLife();

  const token = params.token as string;
  const transfer = getTransferByToken(token);

  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState(transfer ? transfer.toRecipientEmail : '');
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  if (!transfer) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-stone-900">Transfer Request Invalid or Expired</h1>
        <p className="text-xs text-stone-500">
          This custody transfer token could not be verified. Please ask the owner to generate a fresh transfer link.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 text-white"
        >
          Return to ReLife Home
        </Link>
      </div>
    );
  }

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerName || !newOwnerEmail) return;

    const success = acceptTransfer(token, newOwnerName, newOwnerEmail);
    if (success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setAcceptedSuccess(true);
      setTimeout(() => {
        router.push(`/products/${transfer.productId}`);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Chain of Custody Transfer
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Claim Digital Product Passport
          </h1>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            <strong>{transfer.fromOwnerName}</strong> has initiated the transfer of custody for this verified hardware asset to you.
          </p>
        </div>

        {/* Product Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={transfer.productImage}
            alt={transfer.productName}
            className="w-20 h-20 rounded-2xl object-cover border border-stone-200 shadow-2xs shrink-0"
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              {transfer.brand}
            </span>
            <h3 className="text-base font-bold text-stone-900">{transfer.productName}</h3>
            <p className="text-xs text-stone-500">{transfer.model}</p>
            <span className="text-[10px] font-mono text-stone-400 mt-1 block">
              Transfer Mode: <strong className="capitalize">{transfer.transferType.replace('_', ' ')}</strong>
            </span>
          </div>
        </div>

        {/* Privacy Safeguards Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Transferred to You</span>
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-800">
              <li>Verified lifetime repair ledger</li>
              <li>Product Health Score</li>
              <li>Active warranty coverage</li>
              <li>New ownership milestone</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 text-stone-800 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-stone-900">
              <Lock className="w-4 h-4 text-stone-600" />
              <span>Redacted for Privacy</span>
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-stone-600">
              <li>Previous owner payment bills</li>
              <li>Personal residential address</li>
              <li>Private owner notes</li>
            </ul>
          </div>
        </div>

        {/* Claim Form */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          {acceptedSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Passport Successfully Transferred!</h3>
              <p className="text-xs text-stone-500">
                You are now the recognized caretaker. Redirecting to your passport...
              </p>
            </div>
          ) : (
            <form onSubmit={handleAccept} className="space-y-4 text-xs">
              <h2 className="text-sm font-bold text-stone-900">Enter Your Custodian Details</h2>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Sterling"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Your Email Address</label>
                <input
                  type="email"
                  required
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept & Claim Digital Product Passport</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
