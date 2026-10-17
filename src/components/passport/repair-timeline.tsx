'use client';

import React, { useState } from 'react';
import { RepairRecord } from '@/lib/types';
import { ProvenanceBadge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Wrench,
  Calendar,
  DollarSign,
  PackageCheck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  Plus,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { useReLife } from '@/lib/store';
import { RepairImpactReceiptModal } from '@/components/receipt/repair-impact-receipt-modal';

interface RepairTimelineProps {
  productId: string;
  repairs: RepairRecord[];
  isOwner?: boolean;
}

export function RepairTimeline({ productId, repairs, isOwner = true }: RepairTimelineProps) {
  const { getProductById } = useReLife();
  const product = getProductById(productId);
  const [selectedReceiptRepair, setSelectedReceiptRepair] = useState<RepairRecord | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(
    repairs.length > 0 ? repairs[0].id : null
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (repairs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
          <Wrench className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-stone-800">No Service Records Logged</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
          This product has no recorded maintenance or repairs yet. Keep a permanent lifetime log to increase resale value and maintainability.
        </p>
        {isOwner && (
          <Link
            href={`/products/${productId}/repair`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Log First Repair or Service</span>
          </Link>
        )}
      </div>
    );
  }

  // Sort repairs newest first
  const sortedRepairs = [...repairs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-stone-900">Lifetime Repair & Service Ledger</h3>
          <p className="text-xs text-stone-500">
            Immutable chronological timeline of all maintenance, diagnostics, and part replacements.
          </p>
        </div>
        {isOwner && (
          <Link
            href={`/products/${productId}/repair`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white transition-colors shadow-2xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Log Repair</span>
          </Link>
        )}
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-stone-200">
        {sortedRepairs.map((repair, idx) => {
          const isExpanded = expandedId === repair.id;
          const isVerified = repair.verificationBadge === 'technician-verified';
          const isDocBacked = repair.verificationBadge === 'document-backed';

          return (
            <div key={repair.id} className="relative group">
              {/* Timeline marker icon */}
              <div
                className={`absolute -left-[30px] top-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isVerified
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : isDocBacked
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-stone-400 bg-stone-100 text-stone-600'
                }`}
              >
                {isVerified ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <Wrench className="w-3 h-3" />
                )}
              </div>

              {/* Record Card */}
              <div className="bg-white rounded-xl border border-stone-200 hover:border-stone-300 transition-all shadow-xs overflow-hidden">
                <div
                  onClick={() => toggleExpand(repair.id)}
                  className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ProvenanceBadge badge={repair.verificationBadge} size="sm" />
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(repair.date)}
                      </span>
                      {repair.warrantyClaim && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          Warranty Claim
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-stone-900 leading-snug">
                      {repair.issueSummary}
                    </h4>
                    <p className="text-xs text-stone-500">
                      Serviced by: <span className="font-medium text-stone-700">{repair.technicianOrShopName}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="text-right">
                      <span className="text-xs text-stone-400 block">Total Cost</span>
                      <span className="text-sm font-bold text-stone-900">
                        {repair.cost > 0 ? formatCurrency(repair.cost) : 'Free / Under Warranty'}
                      </span>
                    </div>

                    {product && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReceiptRepair(repair);
                        }}
                        title="View & Share Repair Impact Receipt"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                    )}

                    <button
                      className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      aria-label="Expand details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-stone-100 bg-stone-50/50 space-y-3.5 text-xs">
                    {/* Symptoms & Diagnosis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                          Reported Symptoms
                        </span>
                        <p className="text-stone-700 leading-relaxed">
                          {repair.symptoms || 'No specific symptoms entered.'}
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                          Technician Diagnosis
                        </span>
                        <p className="text-stone-700 leading-relaxed">
                          {repair.diagnosis || 'Standard routine check and replacement.'}
                        </p>
                      </div>
                    </div>

                    {/* Replaced Parts List */}
                    {repair.partsReplaced && repair.partsReplaced.length > 0 && (
                      <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2 flex items-center gap-1.5">
                          <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Installed Replacement Parts ({repair.partsReplaced.length})</span>
                        </span>
                        <div className="divide-y divide-stone-100">
                          {repair.partsReplaced.map((part, pIdx) => (
                            <div key={pIdx} className="py-1.5 flex items-center justify-between">
                              <div>
                                <span className="font-medium text-stone-800">{part.name}</span>
                                {part.partNumber && (
                                  <span className="text-[10px] font-mono text-stone-400 ml-2">
                                    PN: {part.partNumber}
                                  </span>
                                )}
                              </div>
                              <span className="font-medium text-stone-700">
                                {part.cost > 0 ? formatCurrency(part.cost) : 'Included'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verification Details Seal */}
                    {repair.verificationDetails && (
                      <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-emerald-900 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-semibold block text-emerald-950">
                            Digital Service Seal
                          </span>
                          {repair.verificationDetails.verifiedBy && (
                            <p className="text-[11px] text-emerald-800">
                              Inspecting Agent: {repair.verificationDetails.verifiedBy}
                            </p>
                          )}
                          {repair.verificationDetails.shopAddress && (
                            <p className="text-[11px] text-emerald-700">
                              Workshop Location: {repair.verificationDetails.shopAddress}
                            </p>
                          )}
                          {repair.verificationDetails.verificationNotes && (
                            <p className="text-[11px] text-emerald-800 italic mt-1">
                              &ldquo;{repair.verificationDetails.verificationNotes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Useful life extension badge */}
                    <div className="flex items-center justify-between text-stone-500 pt-1 text-[11px]">
                      <span>
                        Calculated Lifecycle Extension:{' '}
                        <strong className="text-emerald-700">
                          +{repair.usefulLifeExtensionMonths || 12} months
                        </strong>
                      </span>
                      <span className="text-stone-400 font-mono text-[10px]">
                        ID: {repair.id.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Repair Impact Receipt Modal */}
      {product && (
        <RepairImpactReceiptModal
          isOpen={!!selectedReceiptRepair}
          onClose={() => setSelectedReceiptRepair(null)}
          data={selectedReceiptRepair ? { product, repair: selectedReceiptRepair } : null}
        />
      )}
    </div>
  );
}
