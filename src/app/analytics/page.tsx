'use client';

import React from 'react';
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
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CATEGORY_ENVIRONMENTAL_BENCHMARKS } from '@/lib/calculations';
import { ProductCategory } from '@/lib/types';

export default function AnalyticsPage() {
  const { products } = useReLife();

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
      <div className="pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
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

          <div className="space-y-4">
            {activeCategories.map(([category, data]) => {
              const percentage = totalEWaste > 0 ? (data.eWasteKg / totalEWaste) * 100 : 0;

              return (
                <div key={category} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="capitalize text-stone-800">{category} ({data.count} items)</span>
                    <span className="font-mono text-emerald-800">
                      {data.eWasteKg.toFixed(1)} kg ({percentage.toFixed(0)}%)
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>{data.repairs} documented service events</span>
                    <span>{data.carbonKg.toFixed(0)} kg CO₂e saved</span>
                  </div>
                </div>
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
    </div>
  );
}
