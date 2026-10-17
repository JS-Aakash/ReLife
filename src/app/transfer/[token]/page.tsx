'use client';

import React, { useState, useEffect } from 'react';
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
  User,
  Shield,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClaimTransferPage() {
  const params = useParams();
  const router = useRouter();
  const { getTransferByToken, acceptTransfer, currentUser } = useReLife();

  const token = params.token as string;
  const transfer = getTransferByToken(token);

  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  // Pre-fill from current user if logged in
  useEffect(() => {
    if (currentUser) {
      setNewOwnerName(currentUser.name);
      setNewOwnerEmail(currentUser.email);
    } else if (transfer) {
      setNewOwnerEmail(transfer.toRecipientEmail);
    }
  }, [currentUser, transfer]);

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

  const isAlreadyAccepted = transfer.status === 'accepted';

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerName || !newOwnerEmail || !confirmCheckbox) return;

    const success = acceptTransfer(token, newOwnerName, newOwnerEmail);
    if (success) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      setAcceptedSuccess(true);
      setTimeout(() => {
        router.push(`/products/${transfer.productId}`);
      }, 2200);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Chain of Custody Handshake
          </span>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Claim Digital Product Passport
          </h1>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            <strong>{transfer.fromOwnerName}</strong> has initiated the transfer of custody for this verified hardware asset to you.
          </p>
        </div>

        {/* Product Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={transfer.productImage}
            alt={transfer.productName}
            className="w-20 h-20 rounded-2xl object-cover border border-stone-200 shadow-2xs shrink-0 self-center sm:self-auto"
          />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              {transfer.brand}
            </span>
            <h3 className="text-base font-bold text-stone-900 truncate">{transfer.productName}</h3>
            <p className="text-xs text-stone-500 truncate">{transfer.model}</p>
            <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                Mode: <strong className="capitalize">{transfer.transferType.replace('_', ' ')}</strong>
              </span>
              {isAlreadyAccepted && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                  Transferred & Sealed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Safeguards Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
              <li>Credit card & pricing history</li>
              <li>Personal residential address</li>
              <li>Private owner notes</li>
            </ul>
          </div>
        </div>

        {/* Claim Form or Already Claimed Notice */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
          {acceptedSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Passport Successfully Transferred!</h3>
              <p className="text-xs text-stone-500">
                You are now the recognized caretaker. Redirecting to your personal passport...
              </p>
            </div>
          ) : isAlreadyAccepted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">This Transfer Has Been Completed</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                This asset was accepted and permanently sealed into the recipient&apos;s digital passport fleet.
              </p>
              <Link
                href={`/products/${transfer.productId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors"
              >
                View Transferred Passport →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleAccept} className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-stone-900">Recipient Acceptance Form</h2>
                {currentUser && (
                  <span className="text-[11px] text-emerald-800 font-medium">
                    Logged in as: <strong>{currentUser.name}</strong>
                  </span>
                )}
              </div>

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

              {/* Explicit Legal / Registry Acceptance Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span className="text-[11px] text-emerald-950 leading-relaxed">
                  <strong>Explicit Recipient Confirmation:</strong> I confirm receipt of this hardware item and accept custodianship. I acknowledge that previous owner purchase receipts and payment cards will be permanently redacted for privacy.
                </span>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!confirmCheckbox || !newOwnerName || !newOwnerEmail}
                  className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 whitespace-normal sm:whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Accept Custody & Claim Passport</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
