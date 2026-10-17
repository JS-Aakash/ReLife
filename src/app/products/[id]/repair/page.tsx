'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { VerificationBadge, RepairPart } from '@/lib/types';
import confetti from 'canvas-confetti';
import {
  Wrench,
  ArrowLeft,
  ShieldCheck,
  FileCheck,
  UserCheck,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  PackageCheck,
  Sparkles,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function LogRepairPage() {
  const params = useParams();
  const router = useRouter();
  const { getProductById, addRepair } = useReLife();

  const product = getProductById(params.id as string);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [issueSummary, setIssueSummary] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [technicianOrShopName, setTechnicianOrShopName] = useState('');
  const [cost, setCost] = useState('');
  const [warrantyClaim, setWarrantyClaim] = useState(false);
  const [verificationBadge, setVerificationBadge] = useState<VerificationBadge>('technician-verified');
  const [verifiedBy, setVerifiedBy] = useState('');
  const [technicianLicense, setTechnicianLicense] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [usefulLifeExtensionMonths, setUsefulLifeExtensionMonths] = useState('24');
  const [notes, setNotes] = useState('');

  // Itemized parts list
  const [parts, setParts] = useState<RepairPart[]>([
    { name: '', partNumber: '', cost: 0 },
  ]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900">Product Not Found</h2>
        <Link href="/products" className="text-xs text-emerald-800 underline mt-2 block">
          Return to Assets
        </Link>
      </div>
    );
  }

  const handleAddPart = () => {
    setParts((prev) => [...prev, { name: '', partNumber: '', cost: 0 }]);
  };

  const handleRemovePart = (index: number) => {
    setParts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePartChange = (index: number, field: keyof RepairPart, value: any) => {
    setParts((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueSummary || !technicianOrShopName) return;

    const validParts = parts.filter((p) => p.name.trim().length > 0);

    addRepair(product.id, {
      date,
      issueSummary,
      symptoms,
      diagnosis,
      technicianOrShopName,
      cost: Number(cost) || 0,
      partsReplaced: validParts,
      warrantyClaim,
      verificationBadge,
      verificationDetails:
        verificationBadge === 'technician-verified'
          ? {
              verifiedBy: verifiedBy || technicianOrShopName,
              technicianLicense,
              shopName: technicianOrShopName,
              shopAddress,
              verifiedAt: new Date().toISOString(),
              verificationNotes: notes,
            }
          : undefined,
      usefulLifeExtensionMonths: Number(usefulLifeExtensionMonths) || 12,
      ownerApproved: true,
      notes,
    });

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
    });

    router.push(`/products/${product.id}`);
  };

  return (
    <ProtectedRoute title="Record Product Maintenance" description="Sign in as the verified hardware custodian to seal repair events into the digital passport.">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {product.name}</span>
        </Link>
      </div>

      <div className="pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Record Maintenance or Repair
            </h1>
            <p className="text-xs text-stone-500">
              Preserve provenance by sealing an immutable repair milestone to {product.brand} {product.model}.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Core Repair Information */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
            1. Issue & Diagnostics
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Issue Summary / Work Undertaken
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Battery Replacement & Fan Dust Clean, Drivetrain 11-speed Overhaul"
                value={issueSummary}
                onChange={(e) => setIssueSummary(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Service Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Service Provider / Workshop Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple Authorized Service, Apex Velo, DIY Self-Service"
                  value={technicianOrShopName}
                  onChange={(e) => setTechnicianOrShopName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Reported Symptoms</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Battery capacity at 78%, fan noise under high compute load"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Technician Diagnosis / Root Cause
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Degraded Li-ion pack, dust buildup on thermal heat pipes"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Provenance Badge Selection */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
            2. Provenance & Trust Level
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                badge: 'technician-verified' as VerificationBadge,
                label: 'Technician Verified',
                desc: 'Inspected by certified workshop or professional mechanic.',
                icon: ShieldCheck,
              },
              {
                badge: 'document-backed' as VerificationBadge,
                label: 'Document Backed',
                desc: 'Self-logged with invoice or parts receipt proof.',
                icon: FileCheck,
              },
              {
                badge: 'owner-reported' as VerificationBadge,
                label: 'Owner Reported',
                desc: 'Self-serviced or maintenance without third-party proof.',
                icon: UserCheck,
              },
            ].map(({ badge, label, desc, icon: Icon }) => (
              <label
                key={badge}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  verificationBadge === badge
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-4 h-4 text-emerald-700" />
                    <input
                      type="radio"
                      name="badge"
                      checked={verificationBadge === badge}
                      onChange={() => setVerificationBadge(badge)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="font-bold text-stone-900 block">{label}</span>
                  <span className="text-[11px] text-stone-500 mt-1 block leading-snug">{desc}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Technician license details (shown if technician-verified) */}
          {verificationBadge === 'technician-verified' && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                Technician Credentials
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Technician Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. David Keller (ACMT #88412)"
                    value={verifiedBy}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Shop / Workshop Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 42 Silicon Way, Austin, TX"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-stone-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cost & Replaced Parts */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              3. Costs & Replaced Components
            </h2>
            <button
              type="button"
              onClick={handleAddPart}
              className="inline-flex items-center gap-1 text-emerald-800 font-semibold hover:underline whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Add Part</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Total Repair Cost ($)</label>
              <input
                type="number"
                placeholder="e.g. 219"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Estimated Life Extension (Months)
              </label>
              <input
                type="number"
                value={usefulLifeExtensionMonths}
                onChange={(e) => setUsefulLifeExtensionMonths(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={warrantyClaim}
                onChange={(e) => setWarrantyClaim(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600"
              />
              <span className="font-semibold text-stone-800">
                Work completed under warranty claim ($0 out-of-pocket)
              </span>
            </label>
          </div>

          {/* Itemized Parts */}
          <div className="space-y-2 pt-2">
            <span className="font-semibold text-stone-700 block">Itemized Replacement Parts:</span>
            {parts.map((part, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-0 rounded-xl bg-stone-50 sm:bg-transparent border sm:border-0 border-stone-200"
              >
                <input
                  type="text"
                  placeholder="Part Name (e.g. OEM Battery Pack)"
                  value={part.name}
                  onChange={(e) => handlePartChange(idx, 'name', e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Part # (optional)"
                    value={part.partNumber || ''}
                    onChange={(e) => handlePartChange(idx, 'partNumber', e.target.value)}
                    className="flex-1 sm:w-28 sm:flex-none text-xs font-mono px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Cost ($)"
                    value={part.cost || ''}
                    onChange={(e) => handlePartChange(idx, 'cost', Number(e.target.value))}
                    className="w-24 text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  />
                  {parts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePart(idx)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-lg shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/products/${product.id}`}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold whitespace-nowrap shrink-0"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Seal Record to Passport</span>
          </button>
        </div>
      </form>
    </div>
    </ProtectedRoute>
  );
}
