'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  QrCode,
  Wrench,
  Calendar,
  ExternalLink,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
} from 'lucide-react';
import { HealthGauge, ExplainableHealthFactors } from '@/components/ui/health-gauge';
import { ProvenanceBadge, WarrantyBadge, CategoryBadge } from '@/components/ui/badge';
import { DPPCertificateModal } from '@/components/passport/dpp-certificate-modal';
import { getWarrantyInfo } from '@/lib/calculations';
import { formatDate } from '@/lib/utils';

export default function PublicPassportPage() {
  const params = useParams();
  const { getProductByPublicId } = useReLife();
  const [activeTab, setActiveTab] = useState<'repairs' | 'health'>('repairs');
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);

  const product = getProductByPublicId(params.publicId as string);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-stone-900">Unregistered or Inactive Passport</h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          The passport identifier <code className="font-mono bg-stone-100 px-2 py-0.5 rounded">{params.publicId}</code> could not be located in the ReLife Registry.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 text-white"
        >
          <span>Go to ReLife Home</span>
        </Link>
      </div>
    );
  }

  const warranty = getWarrantyInfo(product.warrantyExpiryDate);

  return (
    <div className="min-h-screen bg-[#F7F6F0] pb-16">
      {/* Official Tamper-Evident Header Banner */}
      <div className="bg-emerald-950 text-emerald-200 border-b border-emerald-900/60 py-3 px-4 text-center text-xs font-medium">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Verified Public Safe Passport • Official ReLife Registry Authenticity Check Passed
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Main Public Passport Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                  Public Identity: {product.publicId}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {product.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/products/${product.id}/time-machine`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-100 transition-colors shadow-2xs whitespace-nowrap shrink-0"
                title="Explore Lifetime Provenance in Interactive Time Machine"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                <span>Time Machine</span>
              </Link>

              <button
                onClick={() => setCertificateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100 transition-colors shadow-2xs whitespace-nowrap shrink-0"
                title="View & Export Official EU ESPR Passport Certificate"
              >
                <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Official Certificate</span>
              </button>
              <CategoryBadge category={product.category} />
              <WarrantyBadge status={warranty.status} daysRemaining={warranty.daysRemaining} />
            </div>
          </div>

          {/* Product Hero Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5">
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-100 border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-7 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">Brand</span>
                  <span className="font-semibold text-stone-800">{product.brand}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">Model</span>
                  <span className="font-semibold text-stone-800 truncate block">{product.model}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">Hardware ID</span>
                  <span className="font-mono font-medium text-stone-700">
                    {product.resaleDisclosure?.showSerialNumber
                      ? product.serialNumber
                      : 'SN-•••••••• (Redacted)'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">Verified Condition</span>
                  <span className="font-semibold text-stone-800 capitalize">{product.condition}</span>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-500 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Protected:</strong> Personal invoices, receipts, and owner contact details are strictly redacted from this public verification view.
                </span>
              </div>
            </div>
          </div>

          {/* Health Score & Circular Economy Metrics */}
          <div className="pt-4 border-t border-stone-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Health Index
                  </span>
                  <span className="text-xl font-black text-stone-900">{product.healthScore}</span>
                  <span className="text-xs text-stone-500"> / 100</span>
                </div>
                <HealthGauge score={product.healthScore} size="sm" showLabel={false} />
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                  E-Waste Diverted
                </span>
                <span className="text-xl font-black text-teal-900">{product.eWasteAvoidedKg} kg</span>
                <span className="text-xs text-teal-700 block mt-0.5">Physical landfill mass saved</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  CO₂e Avoided
                </span>
                <span className="text-xl font-black text-emerald-900">{product.carbonAvoidedKg} kg</span>
                <span className="text-xs text-emerald-700 block mt-0.5">Embodied manufacturing carbon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Public Verified Repair History Timeline */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Public Service & Maintenance Ledger ({product.repairs.length})
              </h2>
              <p className="text-xs text-stone-500">
                Cryptographically linked service events recorded throughout this product&apos;s lifetime.
              </p>
            </div>
            <Link
              href={`/resale/${product.publicId}`}
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>Smart Resale Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {product.repairs.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              No historical repair events have been logged for this hardware yet.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {product.repairs.map((repair) => (
                <div
                  key={repair.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ProvenanceBadge badge={repair.verificationBadge} size="sm" />
                      <span className="font-semibold text-stone-900">{repair.issueSummary}</span>
                    </div>
                    <span className="text-stone-400 font-medium">{formatDate(repair.date)}</span>
                  </div>

                  <p className="text-stone-600 leading-relaxed">
                    Diagnosis: {repair.diagnosis || 'Routine maintenance and inspection completed.'}
                  </p>

                  {repair.partsReplaced && repair.partsReplaced.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        Parts Replaced:
                      </span>
                      {repair.partsReplaced.map((part, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-700 text-[11px]"
                        >
                          {part.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {repair.verificationDetails?.verifiedBy && (
                    <div className="pt-1 text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Inspected by {repair.verificationDetails.verifiedBy}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Claim / Resale Callout */}
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold">Purchasing this product second-hand?</h3>
            <p className="text-xs text-stone-400 max-w-md">
              Ask the current seller to initiate an Ownership Transfer. You will receive the permanent digital passport and warranty records.
            </p>
          </div>

          <Link
            href={`/resale/${product.publicId}`}
            className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs shrink-0 text-center transition-colors shadow-sm whitespace-nowrap"
          >
            Inspect Resale Passport →
          </Link>
        </div>
      </div>

      <DPPCertificateModal
        product={product}
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
      />
    </div>
  );
}
