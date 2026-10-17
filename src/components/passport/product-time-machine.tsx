'use client';

import React, { useState, useMemo } from 'react';
import { Product, RepairRecord, DocumentItem } from '@/lib/types';
import {
  Clock,
  Sparkles,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Calendar,
  DollarSign,
  FileText,
  UserCheck,
  Award,
  ChevronRight,
  TrendingUp,
  Package,
  Layers,
  Sliders,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Check,
  Play,
  RotateCcw,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { getWarrantyInfo } from '@/lib/calculations';
import Link from 'next/link';

interface ProductTimeMachineProps {
  product: Product;
}

export type TimelineEventType = 'purchase' | 'warranty' | 'fault' | 'repair' | 'part' | 'transfer' | 'milestone';

export interface TimelineEvent {
  id: string;
  date: string;
  type: TimelineEventType;
  title: string;
  subtitle: string;
  description: string;
  cost?: number;
  healthDelta?: number; // e.g. +14% or -10%
  healthScoreAfter: number;
  actor?: string;
  badge?: string;
  documents?: DocumentItem[];
  parts?: { name: string; cost: number; partNumber?: string }[];
  verified?: boolean;
}

export function ProductTimeMachine({ product }: ProductTimeMachineProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'repairs' | 'warranty' | 'transfers'>('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [scrubberIndex, setScrubberIndex] = useState<number>(-1); // -1 means all up to present
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const warranty = useMemo(() => getWarrantyInfo(product.warrantyExpiryDate), [product]);

  // Construct comprehensive chronological timeline
  const allEvents: TimelineEvent[] = useMemo(() => {
    const list: TimelineEvent[] = [];

    // 1. Initial Inception / Purchase
    list.push({
      id: 'event-purchase',
      date: product.purchaseDate,
      type: 'purchase',
      title: 'Initial Commercial Purchase & Vault Registration',
      subtitle: `${product.seller || 'Authorized Retailer'} • ${formatCurrency(product.purchasePrice, product.purchaseCurrency)}`,
      description: `Registered with OEM serial ${product.serialNumber || 'N/A'}. First-party ownership token established with 100% factory baseline health.`,
      cost: product.purchasePrice,
      healthDelta: 0,
      healthScoreAfter: 100,
      actor: product.seller || 'Authorized Retailer',
      badge: 'OEM Inception',
      verified: true,
      documents: product.documents.filter((d) => d.fileType === 'invoice' || d.isVerifiedReceipt),
    });

    // 2. Warranty Milestone
    if (product.warrantyExpiryDate) {
      const isPast = new Date(product.warrantyExpiryDate).getTime() < Date.now();
      list.push({
        id: 'event-warranty',
        date: product.warrantyExpiryDate,
        type: 'warranty',
        title: isPast ? 'Manufacturer Warranty Expiration' : 'Commercial Warranty Milestone',
        subtitle: `${product.warrantyMonths || 12}-Month Coverage Window`,
        description: isPast
          ? 'Standard 12-month commercial guarantee concluded. Statutory conformity provisions and verified repair passport remain active.'
          : 'Active commercial warranty protections remain in effect for parts and labor.',
        healthDelta: -5,
        healthScoreAfter: 95,
        actor: product.brand,
        badge: isPast ? 'Milestone' : 'Active Protection',
        verified: true,
      });
    }

    // 3. Repairs, Faults & Replaced Parts
    product.repairs.forEach((repair, idx) => {
      // Pre-repair symptom / fault event
      if (repair.symptoms) {
        list.push({
          id: `event-fault-${repair.id}`,
          date: new Date(new Date(repair.date).getTime() - 86400000 * 3).toISOString().split('T')[0],
          type: 'fault',
          title: 'Defect / Anomaly Reported by Custodian',
          subtitle: repair.issueSummary,
          description: repair.symptoms,
          healthDelta: -16,
          healthScoreAfter: 78,
          actor: 'Registered Custodian',
          badge: 'Reported Defect',
          verified: false,
        });
      }

      // Certified Repair & Parts Replacement Event
      list.push({
        id: `event-repair-${repair.id}`,
        date: repair.date,
        type: 'repair',
        title: 'Certified Service & Component Refresh',
        subtitle: `${repair.technicianOrShopName} • ${formatCurrency(repair.cost || 0)}`,
        description: `${repair.diagnosis || repair.issueSummary}. Restored OEM tolerances; extended estimated useful lifespan by +${repair.usefulLifeExtensionMonths || 12} months.`,
        cost: repair.cost,
        healthDelta: +16,
        healthScoreAfter: 94,
        actor: repair.technicianOrShopName,
        badge: repair.verificationBadge,
        verified: repair.verificationBadge === 'technician-verified',
        parts: repair.partsReplaced,
        documents: product.documents.filter((d) => d.fileType === 'repair_receipt'),
      });
    });

    // 4. Ownership Transfers
    product.ownershipHistory.forEach((tx, idx) => {
      if (tx.transferType !== 'original_purchase') {
        list.push({
          id: `event-transfer-${tx.id || idx}`,
          date: tx.startDate,
          type: 'transfer',
          title: 'Custody Chain & Ownership Transfer',
          subtitle: `Caretaker: ${tx.ownerName} (${tx.ownerEmailMasked})`,
          description: `Permanent cryptographic passport custody transferred via ${tx.transferType.replace('_', ' ')}. ${tx.transferNote || 'Verified maintenance ledger integrity maintained.'}`,
          healthDelta: 0,
          healthScoreAfter: product.healthScore,
          actor: tx.ownerName,
          badge: 'Tamper-Evident Handoff',
          verified: true,
        });
      }
    });

    // 5. Present Day State
    list.push({
      id: 'event-present',
      date: new Date().toISOString().split('T')[0],
      type: 'milestone',
      title: 'Current Operational Health & Telemetry',
      subtitle: `Health Score: ${product.healthScore}/100 • Condition: ${product.condition.toUpperCase()}`,
      description: `Asset remains active in registry. Lifetime environmental savings: ${product.carbonAvoidedKg || 240} kg CO₂e avoided, ${product.eWasteAvoidedKg || 2.1} kg e-waste prevented.`,
      healthDelta: 0,
      healthScoreAfter: product.healthScore,
      actor: 'ReLife Sentinel',
      badge: 'Active Registry',
      verified: true,
    });

    // Sort chronologically
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [product, warranty]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      if (selectedFilter === 'repairs') return ev.type === 'repair' || ev.type === 'fault' || ev.type === 'part';
      if (selectedFilter === 'warranty') return ev.type === 'warranty' || ev.type === 'purchase';
      if (selectedFilter === 'transfers') return ev.type === 'transfer';
      return true;
    });
  }, [allEvents, selectedFilter]);

  // Current active index in scrubber
  const effectiveIndex = scrubberIndex === -1 ? filteredEvents.length - 1 : scrubberIndex;
  const currentScrubbedEvent = filteredEvents[effectiveIndex] || filteredEvents[filteredEvents.length - 1];

  // Selected event for detail drawer
  const activeEvent = useMemo(() => {
    if (!selectedEventId) return currentScrubbedEvent;
    return allEvents.find((e) => e.id === selectedEventId) || currentScrubbedEvent;
  }, [selectedEventId, allEvents, currentScrubbedEvent]);

  // Animated Playback Scrubber
  const handlePlayTimeline = () => {
    setIsPlaying(true);
    setScrubberIndex(0);
    setSelectedEventId(null);

    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      if (idx >= filteredEvents.length) {
        clearInterval(interval);
        setIsPlaying(false);
        setScrubberIndex(-1);
      } else {
        setScrubberIndex(idx);
      }
    }, 1200);
  };

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'purchase':
        return <Package className="w-4 h-4 text-emerald-700" />;
      case 'warranty':
        return <ShieldCheck className="w-4 h-4 text-blue-700" />;
      case 'fault':
        return <ShieldAlert className="w-4 h-4 text-amber-700" />;
      case 'repair':
        return <Wrench className="w-4 h-4 text-emerald-700" />;
      case 'transfer':
        return <UserCheck className="w-4 h-4 text-indigo-700" />;
      case 'milestone':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      default:
        return <Clock className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-8">
      {/* Time Machine Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white flex items-center justify-center shadow-md shrink-0">
            <Clock className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Product Time Machine
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider">
                Interactive Provenance
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Scrub across the physical asset&apos;s lifecycle from factory purchase to certified repairs and present telemetry.
            </p>
          </div>
        </div>

        {/* Playback & Reset Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePlayTimeline}
            disabled={isPlaying}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white transition-colors shadow-2xs disabled:opacity-50 whitespace-nowrap"
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
            <span>{isPlaying ? 'Playing Journey...' : 'Play Time Machine'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setScrubberIndex(-1);
              setSelectedEventId(null);
            }}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
            title="Reset to Present Day"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Health Score Graph Trajectory Card */}
      <div className="bg-gradient-to-r from-stone-950 via-[#071912] to-emerald-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block">
              Health Trajectory at Event: {formatDate(currentScrubbedEvent.date)}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white font-mono">
                {currentScrubbedEvent.healthScoreAfter} / 100
              </span>
              <span className="text-xs text-emerald-300 font-semibold">
                {currentScrubbedEvent.healthDelta !== 0 && currentScrubbedEvent.healthDelta !== undefined ? (
                  currentScrubbedEvent.healthDelta > 0 ? (
                    `+${currentScrubbedEvent.healthDelta}% after restoration`
                  ) : (
                    `${currentScrubbedEvent.healthDelta}% degraded before repair`
                  )
                ) : (
                  'Stable telemetry'
                )}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-emerald-200/80 font-mono space-y-1">
            <p>Active Event: <span className="text-white font-bold">{currentScrubbedEvent.title}</span></p>
            <p>Custodian: <span className="text-emerald-400 font-bold">{currentScrubbedEvent.actor || product.brand}</span></p>
          </div>
        </div>

        {/* Visual Multi-step Scrubber Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>Inception ({formatDate(product.purchaseDate)})</span>
            <span>Present State ({formatDate(new Date().toISOString().split('T')[0])})</span>
          </div>

          <input
            type="range"
            min={0}
            max={filteredEvents.length - 1}
            value={effectiveIndex}
            onChange={(e) => {
              setScrubberIndex(Number(e.target.value));
              setSelectedEventId(filteredEvents[Number(e.target.value)].id);
            }}
            className="w-full accent-emerald-400 h-2 bg-stone-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between pt-1 overflow-x-auto gap-2">
            {filteredEvents.map((ev, i) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => {
                  setScrubberIndex(i);
                  setSelectedEventId(ev.id);
                }}
                className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all whitespace-nowrap ${
                  i === effectiveIndex
                    ? 'bg-emerald-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {formatDate(ev.date).split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1">Filter:</span>
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Milestones ({allEvents.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('repairs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === 'repairs'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Repairs & Parts ({allEvents.filter((e) => e.type === 'repair' || e.type === 'fault').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('warranty')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === 'warranty'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Warranty & Inception
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('transfers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === 'transfers'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Ownership Transfers ({allEvents.filter((e) => e.type === 'transfer').length})
          </button>
        </div>

        <span className="text-[11px] text-stone-400">Click any milestone to inspect</span>
      </div>

      {/* Main Dual-Column Timeline & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (7 Cols): Vertical Event Track */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
            {filteredEvents.map((ev, index) => {
              const isSelected = activeEvent?.id === ev.id;
              const isScrubbedPast = index <= effectiveIndex;

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEventId(ev.id);
                    setScrubberIndex(index);
                  }}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                      : isScrubbedPast
                      ? 'border-stone-200 bg-white hover:border-emerald-300 hover:shadow-2xs'
                      : 'border-dashed border-stone-200 bg-stone-50/50 opacity-60'
                  }`}
                >
                  {/* Timeline Bullet Node */}
                  <div
                    className={`absolute -left-6 top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : isScrubbedPast
                        ? 'border-emerald-600 bg-white'
                        : 'border-stone-300 bg-stone-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                  </div>

                  {/* Event Content Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
                        {getEventIcon(ev.type)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-stone-400 block font-semibold">
                          {formatDate(ev.date)}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900 leading-tight">
                          {ev.title}
                        </h4>
                      </div>
                    </div>

                    {ev.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 shrink-0">
                        {ev.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {ev.description}
                  </p>

                  {/* Quick Metadata Tags */}
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    {ev.cost !== undefined && ev.cost > 0 && (
                      <span className="font-semibold text-stone-900 font-mono">
                        Spend: {formatCurrency(ev.cost)}
                      </span>
                    )}
                    {ev.parts && ev.parts.length > 0 && (
                      <span className="text-emerald-800 font-medium">
                        {ev.parts.length} OEM Part(s) Replaced
                      </span>
                    )}
                    {ev.verified && (
                      <span className="text-emerald-700 font-medium flex items-center gap-0.5 ml-auto">
                        <Check className="w-3 h-3" /> Provenance Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (5 Cols): Selected Event Deep Inspector Panel */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="bg-stone-50 rounded-3xl border border-stone-200 p-6 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Lifecycle Node Inspector</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200">
                {activeEvent.type.toUpperCase()}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-emerald-800 font-semibold block">
                {formatDate(activeEvent.date)}
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-0.5">
                {activeEvent.title}
              </h3>
              <p className="text-xs text-stone-500 mt-1">{activeEvent.subtitle}</p>
            </div>

            {/* Narrative Description */}
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 text-xs text-stone-700 leading-relaxed space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Record Details</span>
              <p>{activeEvent.description}</p>
            </div>

            {/* Replaced Parts Inspection (if repair) */}
            {activeEvent.parts && activeEvent.parts.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-stone-500 block">
                  Replaced Components & OEM Part Numbers
                </span>
                <div className="space-y-1.5">
                  {activeEvent.parts.map((part, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-stone-800 block">{part.name}</span>
                        {part.partNumber && (
                          <span className="text-[10px] font-mono text-stone-400 block">
                            Part #: {part.partNumber}
                          </span>
                        )}
                      </div>
                      <span className="font-bold font-mono text-stone-700">{formatCurrency(part.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached Evidence & Proofs */}
            {activeEvent.documents && activeEvent.documents.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-stone-500 block">
                  Attached Documentary Proofs ({activeEvent.documents.length})
                </span>
                <div className="space-y-1.5">
                  {activeEvent.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs group hover:border-emerald-400 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-medium text-stone-800 truncate">{doc.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 shrink-0 ml-2">{doc.fileSize}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cryptographic Chain Integrity Stamp */}
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>SHA-256 Provenance Ledger Certified</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-normal">
                This historical milestone is anchored to UID <code className="font-mono text-stone-700 font-bold">{product.publicId}</code> with immutable custody hash.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
