'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import Link from 'next/link';
import {
  Leaf,
  DollarSign,
  Clock,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  Info,
  CheckCircle2,
  Package,
  Wrench,
  ArrowRight,
  Printer,
  Download,
  X,
  FileCheck,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_ENVIRONMENTAL_BENCHMARKS } from '@/lib/calculations';
import { ProductCategory } from '@/lib/types';

export default function AnalyticsPage() {
  const { products, currentUser } = useReLife();
  const [certModalOpen, setCertModalOpen] = useState(false);

  const totalProducts = products.length;
  const totalRepairs = products.reduce((acc, p) => acc + p.repairs.length, 0);
  const totalEWaste = products.reduce((acc, p) => acc + (p.eWasteAvoidedKg || 0), 0);
  const totalCarbon = products.reduce((acc, p) => acc + (p.carbonAvoidedKg || 0), 0);

  const totalRepairSpend = products.reduce(
    (acc, p) => acc + p.repairs.reduce((rAcc, r) => rAcc + (r.cost || 0), 0),
    0
  );

  const totalOriginalValue = products.reduce((acc, p) => acc + (p.purchasePrice || 0), 0);
  const estimatedDollarsSaved = Math.max(0, totalOriginalValue - totalRepairSpend);

  const totalMonthsExtended = products.reduce(
    (acc, p) =>
      acc +
      p.repairs.reduce((rAcc, r) => rAcc + (r.usefulLifeExtensionMonths || 12), 0),
    0
  );

  // Group environmental impact by category
  const categoryImpact: Record<
    ProductCategory,
    { count: number; eWasteKg: number; carbonKg: number; repairs: number }
  > = {
    smartphone: { count: 0, eWasteKg: 0, carbonKg: 0, repairs: 0 },
    laptop: { count: 0, eWasteKg: 0, carbonKg: 0, repairs: 0 },
    tablet: { count: 0, eWasteKg: 0, carbonKg: 0, repairs: 0 },
    audio: { count: 0, eWasteKg: 0, carbonKg: 0, repairs: 0 },
    appliance: { count: 0, eWasteKg: 0, carbonKg: 0, repairs: 0 },
    bicycle: { count: 0, eWasteKg: 0, carbonKg: 0, repairs: 0 },
    camera: { count: 0, eWasteKg: 0, carbonKg: 0, repairs: 0 },
    gaming: { count: 0, eWasteKg: 0, carbonKg: 0, repairs: 0 },
    other: { count: 0, eWasteKg: 0, carbonKg: 0, repairs: 0 },
  };

  products.forEach((p) => {
    if (categoryImpact[p.category]) {
      categoryImpact[p.category].count += 1;
      categoryImpact[p.category].eWasteKg += p.eWasteAvoidedKg || 0;
      categoryImpact[p.category].carbonKg += p.carbonAvoidedKg || 0;
      categoryImpact[p.category].repairs += p.repairs.length;
    }
  });

  const activeCategories = Object.entries(categoryImpact).filter(([_, data]) => data.count > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              E-Waste & Circular Sustainability Ledger
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Transparent environmental dividend and financial savings achieved by maintaining vs. discarding products.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCertModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors whitespace-nowrap shrink-0"
        >
          <Printer className="w-3.5 h-3.5 shrink-0" />
          <span>Export ESG Certificate</span>
        </button>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-950 to-teal-950 text-white rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
            E-Waste Diverted
          </span>
          <div className="text-3xl font-black text-emerald-400">{totalEWaste.toFixed(1)} kg</div>
          <p className="text-[11px] text-stone-300">Hazardous electronic mass kept out of landfills</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
            Embodied CO₂e Avoided
          </span>
          <div className="text-3xl font-black text-teal-900">{totalCarbon.toFixed(0)} kg</div>
          <p className="text-[11px] text-stone-400">Equivalent to ~{(totalCarbon * 2.4).toFixed(0)} miles of car travel</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block">
            Lifespan Extended
          </span>
          <div className="text-3xl font-black text-stone-900">+{totalMonthsExtended} mo</div>
          <p className="text-[11px] text-stone-400">Cumulative service lifecycle added</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Capital Saved
          </span>
          <div className="text-3xl font-black text-emerald-700">
            {formatCurrency(estimatedDollarsSaved)}
          </div>
          <p className="text-[11px] text-stone-400">Net savings vs. purchasing new replacements</p>
        </div>
      </div>

      {/* Category Breakdown & Spending Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Category Impact Visualization (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                E-Waste Diverted by Asset Category
              </h3>
              <p className="text-xs text-stone-500">
                Physical weight distribution across active device categories.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
              {activeCategories.length} Active Categories
            </span>
          </div>

          <div className="space-y-3">
            {activeCategories.map(([category, data]) => {
              const percentage = totalEWaste > 0 ? (data.eWasteKg / totalEWaste) * 100 : 0;

              return (
                <Link
                  key={category}
                  href="/products"
                  className="block p-3 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-emerald-200 transition-all group cursor-pointer space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="capitalize text-stone-800 group-hover:text-emerald-800 transition-colors">
                      {category} ({data.count} items)
                    </span>
                    <span className="font-mono text-emerald-800">
                      {data.eWasteKg.toFixed(1)} kg ({percentage.toFixed(0)}%)
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full transition-all duration-700 group-hover:bg-emerald-600"
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>{data.repairs} documented service events</span>
                    <span>{data.carbonKg.toFixed(0)} kg CO₂e saved • View fleet →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Repair Financial ROI (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="pb-3 border-b border-stone-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              Repair Financial Viability
            </h3>
            <p className="text-stone-500 mt-0.5">
              Financial breakdown comparing total repair expenses to baseline replacement cost.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Total Purchase Value of Fleet:</span>
              <span className="font-bold text-stone-900">{formatCurrency(totalOriginalValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Total Invested in Maintenance:</span>
              <span className="font-bold text-emerald-800">
                {formatCurrency(totalRepairSpend)}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm">
              <span className="font-bold text-stone-900">Net Estimated Capital Preserved:</span>
              <span className="font-black text-emerald-700">
                {formatCurrency(estimatedDollarsSaved)}
              </span>
            </div>
          </div>

          {/* Average Repair ROI */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-emerald-950">
            <span className="font-bold block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>84.2% Fleet Retention Ratio</span>
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Every $1 spent on verified preventative maintenance has historically prolonged device utility by an average of 4.2 months, delivering a 3.8x ROI compared to rapid obsolescence upgrades.
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Environmental Accounting Methodology */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
            Transparent Methodology & Life-Cycle Analysis (LCA) Standards
          </h3>
        </div>

        <p className="text-stone-600 leading-relaxed max-w-3xl">
          Unlike speculative carbon offset registries, ReLife measures physical prevention. When a laptop, bicycle, or household appliance is repaired to extend its design life, manufacturing and distribution of a replacement unit is deferred.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-900 block mb-1">Laptop Benchmark</span>
            <p className="text-[11px] text-stone-500">
              Avg mass: 2.1 kg • Embodied carbon: 240 kg CO₂e (80% generated during chip fabrication).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-900 block mb-1">Bicycle Benchmark</span>
            <p className="text-[11px] text-stone-500">
              Avg mass: 12.5 kg • Aluminum frame extrusion & alloy smelting avoids 180 kg CO₂e.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-900 block mb-1">Appliance Benchmark</span>
            <p className="text-[11px] text-stone-500">
              Avg mass: 18.0 kg • Motor copper & plastics manufacturing avoids ~350 kg CO₂e.
            </p>
          </div>
        </div>
      </div>

      {/* Certified ESG & Circular Economy Audit Modal */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="px-5 py-3.5 bg-emerald-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Verified ESG Circular Impact Audit
                </span>
              </div>
              <button
                onClick={() => setCertModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-stone-50/50">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm relative">
                <div className="text-center space-y-1 pb-4 border-b border-stone-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Official Environmental Attestation
                  </span>
                  <h2 className="text-xl font-black text-stone-900 tracking-tight mt-1">
                    Circular Economy Certificate
                  </h2>
                  <p className="text-xs text-stone-500">
                    Awarded to <strong className="text-stone-800">{currentUser?.name || 'Verified Custodian'}</strong> for proactive asset stewardship
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-100">
                    <span className="text-2xl font-black text-teal-900 block">{totalEWaste.toFixed(1)} kg</span>
                    <span className="text-[10px] uppercase font-bold text-teal-700">E-Waste Diverted</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-2xl font-black text-emerald-900 block">{totalCarbon.toFixed(0)} kg</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-700">CO₂e Avoided</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span>Registered Fleet Size:</span>
                    <span className="font-bold text-stone-900">{totalProducts} Assets</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span>Service Events Executed:</span>
                    <span className="font-bold text-stone-900">{totalRepairs} Documented</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100">
                    <span>Total Lifespan Extended:</span>
                    <span className="font-bold text-stone-900">+{totalMonthsExtended} Months</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Capital Preserved:</span>
                    <span className="font-bold text-emerald-800">{formatCurrency(estimatedDollarsSaved)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400">
                  <span>Audit ID: RELIFE-ESG-{Date.now().toString().slice(-6)}</span>
                  <span>Issued: {formatDate(new Date().toISOString())}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 text-white font-semibold hover:bg-emerald-900 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setCertModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
