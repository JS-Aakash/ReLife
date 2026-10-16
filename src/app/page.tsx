'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  QrCode,
  Sparkles,
  Leaf,
  Wrench,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  RotateCcw,
  ExternalLink,
  Laptop,
  Bike,
  Smartphone,
  ChevronRight,
  Scan,
} from 'lucide-react';
import { HealthGauge } from '@/components/ui/health-gauge';
import { ProvenanceBadge } from '@/components/ui/badge';
import { InvoiceScannerModal } from '@/components/scanner/invoice-scanner-modal';
import { useReLife } from '@/lib/store';

export default function LandingPage() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const { products } = useReLife();

  const totalRepairs = products.reduce((acc, p) => acc + p.repairs.length, 0);
  const totalEWaste = products.reduce((acc, p) => acc + (p.eWasteAvoidedKg || 0), 0);
  const totalCarbon = products.reduce((acc, p) => acc + (p.carbonAvoidedKg || 0), 0);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 bg-gradient-to-b from-emerald-950 via-[#0a261c] to-[#071912] text-white">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Next-Gen Circular Product Economy</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-stone-100">
                The Living Digital Passport for Every{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                  Physical Product
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed">
                Give your electronics, appliances, and bicycles a permanent tamper-evident digital identity.
                Preserve lifetime maintenance records, verify technician care, make informed repair decisions with AI,
                and turn disposable gadgets into repairable heirlooms.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 group"
                >
                  <span>Explore Demo Fleet</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={() => setScannerOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-stone-200 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <Scan className="w-4 h-4 text-emerald-400" />
                  <span>Scan Receipt with AI</span>
                </button>

                <Link
                  href="/copilot"
                  className="px-5 py-3 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 text-emerald-300 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Repair Copilot</span>
                </Link>
              </div>

              {/* Environmental Counter Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-emerald-900/50 max-w-lg mx-auto lg:mx-0">
                <div>
                  <span className="block text-2xl font-extrabold text-emerald-400">
                    {totalEWaste.toFixed(1)} kg
                  </span>
                  <span className="text-xs text-stone-400">E-Waste Avoided</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-teal-300">
                    {totalCarbon.toFixed(0)} kg
                  </span>
                  <span className="text-xs text-stone-400">CO₂e Diverted</span>
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-stone-200">
                    {totalRepairs}
                  </span>
                  <span className="text-xs text-stone-400">Repairs Documented</span>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Passport Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                {/* Glow effect */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl" />

                <div className="relative rounded-3xl bg-stone-900/90 border border-emerald-500/30 p-6 shadow-2xl backdrop-blur-xl text-stone-100 space-y-5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-widest block">
                          Digital Passport
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          ID: rl-macbook-pro-16-c02g
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                      Live Specimen
                    </span>
                  </div>

                  {/* Product Overview */}
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80"
                      alt="MacBook Pro"
                      className="w-20 h-20 rounded-2xl object-cover border border-stone-700 shadow-md"
                    />
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                        Apple
                      </span>
                      <h3 className="text-base font-bold text-white">MacBook Pro 16&quot; M1 Max</h3>
                      <p className="text-xs text-stone-400">Purchased: Apr 2022 • Workstation</p>
                    </div>
                  </div>

                  {/* Health Score Gauge preview */}
                  <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-stone-300 block">
                        Explainable Health Score
                      </span>
                      <p className="text-[11px] text-stone-400">
                        Battery swapped • 36mo extension
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-400">88</span>
                        <span className="text-xs text-stone-500">/100</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
                        Exceptional
                      </span>
                    </div>
                  </div>

                  {/* Latest Milestone */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                      Latest Sealed Milestone
                    </span>
                    <div className="p-3 rounded-xl bg-stone-800/50 border border-stone-700/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-200">
                          Battery Overhaul & Thermal Seal
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Technician Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400">
                        MacRepairs Pro Lab • ACMT Certificate #88412
                      </p>
                    </div>
                  </div>

                  {/* Explore button inside card */}
                  <Link
                    href="/products/prod-macbook-pro-16"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Full Passport & QR Code</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Innovation Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Hackathon Highlights
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Not a Generic CRUD App. A Purpose-Built Lifecycle Platform.
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            ReLife was crafted to resolve the real friction in the circular economy: trust, repairability, and verifiable pedigree.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Health Score */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Explainable Product Health Score</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              No black-box mystery numbers. Every score reveals the contributing factors: Service Age, Repair Integrity, Fault Recurrence, and Cost-to-Value ratios.
            </p>
            <div className="pt-2 text-xs font-medium text-emerald-800 flex items-center gap-1">
              <span>View breakdown factors</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 2: AI Repair Copilot */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Repair vs. Replace AI Copilot</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Describe symptoms and get actionable troubleshooting, safety warnings for swollen lithium cells, realistic cost estimation, and clear environmental ROI.
            </p>
            <Link
              href="/copilot"
              className="pt-2 text-xs font-medium text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>Launch Diagnostic Copilot</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card 3: Provenance Badges */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Trust & Provenance Seals</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Every service record carries an honest audit badge: <span className="text-emerald-700 font-semibold">Technician Verified</span>, <span className="text-blue-700 font-semibold">Document Backed</span>, or <span className="text-stone-700 font-semibold">Owner Reported</span>.
            </p>
            <Link
              href="/technician"
              className="pt-2 text-xs font-medium text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>Service Provider Intake Portal</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card 4: Smart Resale Passport */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Smart Resale Passport</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Carfax for consumer goods. Share a tamper-evident second-hand report with buyers that redacts private bills, addresses, and card numbers.
            </p>
            <Link
              href="/resale/rl-macbook-pro-16-c02g"
              className="pt-2 text-xs font-medium text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>View Sample Resale Report</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card 5: E-Waste Tracker */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Transparent E-Waste Avoidance</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Calculates real physical kilograms of hazardous landfill mass diverted and embodied CO₂ emissions saved through proactive servicing.
            </p>
            <Link
              href="/analytics"
              className="pt-2 text-xs font-medium text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>View Personal Sustainability</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card 6: AI Bill Scanner */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <Scan className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">AI Bill OCR Scanner</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Extract vendor name, purchase date, price, serial number, and warranty terms from retail receipts with editable confirmation.
            </p>
            <button
              onClick={() => setScannerOpen(true)}
              className="pt-2 text-xs font-medium text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <span>Test Receipt Scanner</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Fleet Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-stone-900">Pre-Seeded Sample Fleet</h3>
            <p className="text-xs text-stone-500">
              Explore live products ready for instant demonstration.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
          >
            <span>View All ({products.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-white rounded-2xl border border-stone-200 hover:border-stone-300 p-4 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-stone-900/80 text-white backdrop-blur-xs">
                    {product.category}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                    {product.brand}
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {product.repairs.length} repair(s) logged
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-900">{product.healthScore}</span>
                  <span className="text-[10px] text-stone-400">Health</span>
                </div>
                <span className="text-xs font-semibold text-emerald-800 group-hover:translate-x-0.5 transition-transform flex items-center">
                  Passport →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Receipt Scanner Modal */}
      <InvoiceScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
}
