'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  QrCode,
  Shield,
  ShieldCheck,
  Wrench,
  Clock,
  Leaf,
  DollarSign,
  FileText,
  Lock,
  ArrowRightLeft,
  Sliders,
  Sparkles,
  Printer,
  Share2,
  Trash2,
  ExternalLink,
  Info,
  Calendar,
  Check,
} from 'lucide-react';
import { HealthGauge, ExplainableHealthFactors } from '@/components/ui/health-gauge';
import { WarrantyBadge, CategoryBadge, ProvenanceBadge } from '@/components/ui/badge';
import { QRCard } from '@/components/ui/qr-card';
import { RepairTimeline } from '@/components/passport/repair-timeline';
import { DocumentVault } from '@/components/passport/document-vault';
import { TransferModal } from '@/components/passport/transfer-modal';
import { ResaleSettingsModal } from '@/components/passport/resale-settings-modal';
import { DPPCertificateModal } from '@/components/passport/dpp-certificate-modal';
import { ResaleValuationWidget } from '@/components/passport/resale-valuation-widget';
import { getWarrantyInfo } from '@/lib/calculations';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Award } from 'lucide-react';

export default function ProductPassportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getProductById, deleteProduct, togglePublicShare } = useReLife();

  const [activeTab, setActiveTab] = useState<'repairs' | 'documents' | 'history'>('repairs');
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [resaleModalOpen, setResaleModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const product = getProductById(params.id as string);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Product Passport Not Found</h2>
        <p className="text-xs text-stone-500">
          The requested product ID does not exist or has been transferred.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 text-white"
        >
          Return to Assets
        </Link>
      </div>
    );
  }

  const warranty = getWarrantyInfo(product.warrantyExpiryDate);
  const totalRepairCost = product.repairs.reduce((acc, r) => acc + (r.cost || 0), 0);

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
      return;
    }
    deleteProduct(product.id);
    router.push('/products');
  };

  return (
    <ProtectedRoute title="Private Product Custodian Vault" description="Sign in to view original purchase bills, private maintenance records, and initiate ownership transfers.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {product.publicId}
              </span>
              <CategoryBadge category={product.category} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              {product.name}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setCertificateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100 transition-colors shadow-2xs whitespace-nowrap shrink-0"
            title="View & Export Official EU ESPR Passport Certificate"
          >
            <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Official Certificate</span>
          </button>

          <button
            onClick={() => setResaleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors shadow-2xs whitespace-nowrap shrink-0"
            title="Configure Resale Disclosures"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>Resale Settings</span>
          </button>

          <button
            onClick={() => setTransferModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors shadow-2xs whitespace-nowrap shrink-0"
            title="Initiate Ownership Transfer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>Transfer Custody</span>
          </button>

          <Link
            href={`/products/${product.id}/repair`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <Wrench className="w-3.5 h-3.5 shrink-0" />
            <span>Log Repair</span>
          </Link>

          <button
            onClick={handleDelete}
            className={`p-2 rounded-xl border transition-colors shrink-0 ${
              deleteConfirm
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-stone-200 text-stone-400 hover:text-red-600 hover:bg-red-50'
            }`}
            title="Delete Passport"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* Main Grid: Overview & QR Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Columns: Hardware Overview & Health */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hardware Header Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row gap-6">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-video sm:w-56 sm:h-44 bg-stone-100 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=1000&q=80';
                }}
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-900/80 text-white backdrop-blur-xs">
                Condition: {product.condition}
              </span>
            </div>

            {/* Specifications & Pedigree */}
            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {product.brand}
                </span>
                <h2 className="text-lg font-bold text-stone-900 leading-snug">
                  {product.model}
                </h2>
                {product.description && (
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Serial Number
                  </span>
                  <span className="font-mono font-medium text-stone-700 truncate block">
                    {product.serialNumber}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Purchase Date
                  </span>
                  <span className="font-medium text-stone-700">
                    {formatDate(product.purchaseDate)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Purchase Price
                  </span>
                  <span className="font-medium text-stone-700">
                    {formatCurrency(product.purchasePrice, product.purchaseCurrency)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">
                    Merchant
                  </span>
                  <span className="font-medium text-stone-700 truncate block">
                    {product.seller || 'Authorized Retailer'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">
                    Warranty Status
                  </span>
                  <WarrantyBadge status={warranty.status} daysRemaining={warranty.daysRemaining} />
                </div>
              </div>
            </div>
          </div>

          {/* Explainable Health Score Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
              <HealthGauge score={product.healthScore} size="md" showLabel={true} />

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 text-teal-900 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                    E-Waste Avoided
                  </span>
                  <span className="text-base font-black text-teal-900">
                    {product.eWasteAvoidedKg} kg
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    CO₂e Avoided
                  </span>
                  <span className="text-base font-black text-emerald-900">
                    {product.carbonAvoidedKg} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Transparent Factor Breakdown */}
            <ExplainableHealthFactors breakdown={product.healthBreakdown} />
          </div>

          {/* Circular Resale & Asset Preservation Valuation */}
          <ResaleValuationWidget product={product} />

          {/* Tabs for Timeline, Documents, and Ownership Chain */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto">
              {[
                { key: 'repairs', label: `Repair Ledger (${product.repairs.length})`, icon: Wrench },
                { key: 'documents', label: `Document Vault (${product.documents.length})`, icon: FileText },
                { key: 'history', label: `Ownership Chain (${product.ownershipHistory.length})`, icon: ShieldCheck },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === key
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Active Tab Panel */}
            {activeTab === 'repairs' && (
              <RepairTimeline productId={product.id} repairs={product.repairs} isOwner={true} />
            )}

            {activeTab === 'documents' && (
              <DocumentVault productId={product.id} documents={product.documents} isOwner={true} />
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Chain of Custody & Ownership</h3>
                  <p className="text-xs text-stone-500">
                    Auditable transfer history preserving provenance without leaking personal bills.
                  </p>
                </div>

                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
                  {product.ownershipHistory.map((milestone, idx) => (
                    <div key={milestone.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900">
                            {milestone.ownerName}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                            {milestone.ownerEmailMasked}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Current Caretaker
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500">
                          Transfer Mode: <span className="capitalize">{milestone.transferType.replace('_', ' ')}</span>
                          {milestone.transferNote && ` • ${milestone.transferNote}`}
                        </p>
                      </div>
                      <span className="text-xs text-stone-400 font-medium shrink-0">
                        Since {formatDate(milestone.startDate)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Columns: QR Code Identity & Quick AI Copilot */}
        <div className="lg:col-span-4 space-y-6">
          {/* Prominent QR Code Card */}
          <QRCard
            publicId={product.publicId}
            productName={product.name}
            serialNumber={product.serialNumber}
          />

          {/* Quick Repair vs Replace Copilot Promotion Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-3xl p-6 text-white shadow-md space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Diagnose Fault with AI</h3>
                <span className="text-[10px] text-emerald-300 font-medium">Repair vs. Replace Copilot</span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Experiencing an issue with your {product.brand} {product.model}? Check if a repair makes financial & ecological sense before discarding.
            </p>

            <Link
              href={`/copilot?productId=${product.id}`}
              className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs whitespace-nowrap"
            >
              <span>Diagnose {product.brand} Now</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>

          {/* Privacy & Resale Passport Preview Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3.5 text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-stone-900">Privacy Safeguards</h3>
            </div>
            <p className="text-stone-500 leading-relaxed">
              When anyone scans the QR sticker on this physical item, they access the public-safe view. Invoices, personal addresses, and financial amounts remain locked in your vault.
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-stone-600 font-medium">Public Safe URL:</span>
              <Link
                href={`/passport/${product.publicId}`}
                target="_blank"
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                <span>/passport/{product.publicId.slice(0, 10)}...</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransferModal
        product={product}
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
      />

      <ResaleSettingsModal
        product={product}
        isOpen={resaleModalOpen}
        onClose={() => setResaleModalOpen(false)}
      />

      <DPPCertificateModal
        product={product}
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
      />
    </div>
    </ProtectedRoute>
  );
}
