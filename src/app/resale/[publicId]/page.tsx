'use client';

import React from 'react';
import { useReLife } from '@/lib/store';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Printer,
  QrCode,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Wrench,
  FileCheck,
  Calendar,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { HealthGauge } from '@/components/ui/health-gauge';
import { ProvenanceBadge, CategoryBadge, WarrantyBadge } from '@/components/ui/badge';
import { getWarrantyInfo } from '@/lib/calculations';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function SmartResalePassportPage() {
  const params = useParams();
  const { getProductByPublicId } = useReLife();

  const product = getProductByPublicId(params.publicId as string);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-xl font-bold text-stone-900">Resale Report Not Found</h1>
        <Link href="/" className="text-xs text-emerald-800 underline">
          Go to Home
        </Link>
      </div>
    );
  }

  const warranty = getWarrantyInfo(product.warrantyExpiryDate);
  const disclosure = product.resaleDisclosure || {
    showSerialNumber: true,
    showPurchasePrice: false,
    showFullTimeline: true,
    showDocumentProofs: true,
    showHealthScoreBreakdown: true,
    showTechnicianNotes: true,
  };

  // Calculate Evidence Coverage Rating
  const totalRepairs = product.repairs.length;
  const verifiedRepairs = product.repairs.filter(
    (r) => r.verificationBadge === 'technician-verified' || r.verificationBadge === 'document-backed'
  ).length;
  const evidenceCoverage =
    totalRepairs === 0 ? 100 : Math.round((verifiedRepairs / totalRepairs) * 100);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] py-8 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation & Print Controls */}
        <div className="no-print flex items-center justify-between pb-4 border-b border-stone-200">
          <Link
            href={`/products/${product.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Digital Passport</span>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 shadow-2xs transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>Print / Save as PDF</span>
            </button>
            <Link
              href={`/passport/${product.publicId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <span>Public QR Scan</span>
            </Link>
          </div>
        </div>

        {/* Certified Second-Hand Vehicle-Style Passport Report */}
        <div className="print-page bg-white rounded-3xl border border-stone-300 shadow-sm p-6 sm:p-10 space-y-8">
          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-stone-900">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Official Provenance Certificate
                </span>
                <span className="text-[11px] font-mono text-stone-400">
                  REF: {product.publicId}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight mt-1">
                ReLife Smart Resale Passport
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Independent Lifecycle Pedigree & Documented Maintenance Record for Second-Hand Buyers
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Evidence Coverage
              </span>
              <span className="text-2xl font-black text-emerald-700">{evidenceCoverage}%</span>
              <span className="text-[10px] text-stone-500 block">Verified documentation</span>
            </div>
          </div>

          {/* Product Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4">
              <div className="rounded-2xl overflow-hidden aspect-video sm:aspect-square bg-stone-100 border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {product.brand}
                </span>
                <h2 className="text-xl font-bold text-stone-900">{product.name}</h2>
                <p className="text-xs text-stone-500">{product.model}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Condition Tier
                  </span>
                  <span className="font-bold text-stone-800 capitalize">{product.condition}</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Serial Number
                  </span>
                  <span className="font-mono font-medium text-stone-800">
                    {disclosure.showSerialNumber ? product.serialNumber : 'Redacted for Privacy'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Warranty Status
                  </span>
                  <span className="font-bold text-stone-800 capitalize">
                    {warranty.status === 'active'
                      ? `Active (${warranty.daysRemaining}d)`
                      : warranty.status === 'expiring_soon'
                      ? `Expiring (${warranty.daysRemaining}d)`
                      : 'Expired'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    First Registered
                  </span>
                  <span className="font-medium text-stone-800">
                    {formatDate(product.purchaseDate)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Current Health
                  </span>
                  <span className="font-black text-emerald-700">
                    {product.healthScore} / 100 ({product.healthBreakdown?.tier || 'Good'})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Chain of Custody
                  </span>
                  <span className="font-medium text-stone-800">
                    {product.ownershipHistory.length} Previous Caretaker(s)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Disclosure Statement */}
          {disclosure.customPublicNote && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Seller Statement & Care Commentary
              </span>
              <p className="text-stone-700 leading-relaxed italic">
                &ldquo;{disclosure.customPublicNote}&rdquo;
              </p>
            </div>
          )}

          {/* Documented Service Ledger */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                Documented Service & Repair History ({product.repairs.length} Records)
              </h3>
              <span className="text-xs text-stone-400">Chronological Audit</span>
            </div>

            {product.repairs.length === 0 ? (
              <p className="text-xs text-stone-500 italic">
                No repairs recorded. Factory original components intact.
              </p>
            ) : (
              <div className="divide-y divide-stone-200 border border-stone-200 rounded-2xl overflow-hidden text-xs">
                {product.repairs.map((repair) => (
                  <div key={repair.id} className="p-4 space-y-2 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ProvenanceBadge badge={repair.verificationBadge} size="sm" />
                        <span className="font-bold text-stone-900">{repair.issueSummary}</span>
                      </div>
                      <span className="font-medium text-stone-500">{formatDate(repair.date)}</span>
                    </div>

                    <p className="text-stone-600">
                      <strong>Diagnosis:</strong> {repair.diagnosis || 'Maintenance verified.'}
                    </p>

                    {repair.partsReplaced && repair.partsReplaced.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center pt-1">
                        <span className="text-[10px] uppercase font-bold text-stone-400">
                          OEM Parts:
                        </span>
                        {repair.partsReplaced.map((part, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px]"
                          >
                            {part.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {disclosure.showTechnicianNotes && repair.verificationDetails && (
                      <div className="pt-1 text-[11px] text-emerald-800 font-medium">
                        ✓ Inspected by: {repair.verificationDetails.verifiedBy} (
                        {repair.verificationDetails.shopName})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Environmental Pedigree */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-950 block">
                Circular Environmental Pedigree
              </span>
              <p className="text-emerald-800 text-[11px]">
                By purchasing this maintained second-hand item, you directly avoid{' '}
                <strong>{product.eWasteAvoidedKg} kg</strong> of e-waste and{' '}
                <strong>{product.carbonAvoidedKg} kg</strong> of embodied CO₂ emissions.
              </p>
            </div>
            <div className="text-right shrink-0 font-mono text-[11px] text-emerald-900">
              Verified by ReLife Carbon Standard
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-6 border-t border-stone-200 text-[11px] text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>ReLife Digital Product Passport • Decentralized Resale Certificate</span>
            <span>Cryptographically Verified & Sealed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
