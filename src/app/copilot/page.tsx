'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useReLife } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CopilotDiagnosis } from '@/lib/ai-service';
import {
  Sparkles,
  Wrench,
  AlertTriangle,
  Leaf,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Loader2,
  HelpCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ProductCategory } from '@/lib/types';

function CopilotContent() {
  const { products } = useReLife();
  const searchParams = useSearchParams();
  const preSelectedId = searchParams.get('productId');

  const [selectedProductId, setSelectedProductId] = useState<string>(preSelectedId || (products[0]?.id ?? ''));
  const [customDeviceName, setCustomDeviceName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<ProductCategory>('laptop');
  const [customPrice, setCustomPrice] = useState<string>('1200');
  const [faultDescription, setFaultDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<CopilotDiagnosis | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Dynamic suggested quick prompts based on user's current fleet
  const samplePrompts = React.useMemo(() => {
    if (products.length === 0) {
      return [
        {
          title: 'Swelling / Rapid Battery Drain',
          text: 'Battery health degraded below 75%. Device runs unusually hot and drains from 100% to 20% in an hour.',
          productId: 'custom',
        },
      ];
    }

    return products.slice(0, 4).map((p) => {
      if (p.category === 'laptop' || p.category === 'smartphone') {
        return {
          title: `${p.brand}: Battery & Thermal Throttling`,
          text: `Battery health degraded below 78%. ${p.name} runs unusually hot under moderate load and battery drains rapidly.`,
          productId: p.id,
        };
      }
      if (p.category === 'camera') {
        return {
          title: `${p.brand}: Sensor Shutter & IBIS Error`,
          text: `Sensor stabilization mechanism makes a clicking sound on startup. Shutter occasionally throws camera error code.`,
          productId: p.id,
        };
      }
      if (p.category === 'bicycle') {
        return {
          title: `${p.brand}: Drivetrain Skipping & Hydraulic Bleed`,
          text: `Rear derailleur skipping under load on steep climbs. Hydraulic disc brake lever feels spongy.`,
          productId: p.id,
        };
      }
      if (p.category === 'appliance') {
        return {
          title: `${p.brand}: Motor Pulsing & Filter Restriction`,
          text: `Motor cuts out intermittently in high-output mode with warning indicator. Airflow feels restricted.`,
          productId: p.id,
        };
      }
      if (p.category === 'audio') {
        return {
          title: `${p.brand}: Driver Distortion & Hinge Friction`,
          text: `Intermittent crackle in right driver during bass peaks. Hinge mechanism exhibits mechanical friction.`,
          productId: p.id,
        };
      }
      return {
        title: `${p.brand}: Routine Diagnostic & Inspection`,
        text: `Periodic preventative diagnostic and component wear inspection to ensure optimal efficiency and safety.`,
        productId: p.id,
      };
    });
  }, [products]);

  const handleDiagnose = async (overridePrompt?: string, overrideProduct?: any) => {
    const promptToUse = overridePrompt || faultDescription;
    if (!promptToUse.trim()) return;

    setLoading(true);
    setDiagnosis(null);

    const targetProduct = overrideProduct || selectedProduct;
    const productName = targetProduct ? targetProduct.name : customDeviceName || 'Electronic Device';
    const category = targetProduct ? targetProduct.category : customCategory;
    const price = targetProduct ? targetProduct.purchasePrice : Number(customPrice) || 800;

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          category,
          purchasePrice: price,
          productAgeYears: 2,
          faultDescription: promptToUse,
        }),
      });

      if (response.ok) {
        const result: CopilotDiagnosis = await response.json();
        setDiagnosis(result);
      }
    } catch (e) {
      console.error('Copilot diagnostic error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Repair vs. Replace AI Copilot
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Intelligent diagnostic advisory helping you evaluate repair feasibility, component cost ranges, and circular economics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Device & Symptom Input (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
              1. Select Asset
            </h2>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Choose Registered Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600 bg-stone-50/50"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.brand})
                  </option>
                ))}
                <option value="custom">Other / Custom Device</option>
              </select>
            </div>

            {selectedProductId === 'custom' && (
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Device Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dell XPS 15, iPad Air"
                    value={customDeviceName}
                    onChange={(e) => setCustomDeviceName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                  >
                    <option value="laptop">Laptop</option>
                    <option value="smartphone">Smartphone</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="appliance">Appliance</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Describe the Fault or Symptoms
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe what is failing: e.g. Battery drains rapidly, screen has horizontal glitch lines, drivetrain skipping..."
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <button
              type="button"
              onClick={() => handleDiagnose()}
              disabled={loading || !faultDescription.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Evaluating Diagnostic Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Analyze & Compare Options</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Scenario Buttons */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              Quick Diagnostic Scenarios
            </span>
            <div className="space-y-2">
              {samplePrompts.map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => {
                    const prod = products.find((p) => p.id === sample.productId);
                    setSelectedProductId(sample.productId);
                    setFaultDescription(sample.text);
                    handleDiagnose(sample.text, prod);
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/30 transition-all text-xs group"
                >
                  <span className="font-semibold text-stone-900 group-hover:text-emerald-900 block">
                    {sample.title}
                  </span>
                  <span className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                    {sample.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output: Detailed Diagnostic & Comparison (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!diagnosis ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Copilot Ready for Inquiry</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Select a product or pick a quick diagnostic scenario to receive root-cause analysis, estimated repair costs, and an objective repair vs. replacement evaluation.
              </p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Verdict Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-md flex items-start gap-4">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                    Copilot Advisory Verdict
                  </span>
                  <h3 className="text-lg font-black">{diagnosis.recommendationVerdict}</h3>
                  <p className="text-xs text-stone-300 leading-snug">
                    Root Cause: <strong>{diagnosis.faultSummary}</strong>
                  </p>
                </div>
              </div>

              {/* Economic Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Estimated Repair Range
                  </span>
                  <div className="text-2xl font-black text-stone-900">
                    {formatCurrency(diagnosis.estimatedCostRange.min)} –{' '}
                    {formatCurrency(diagnosis.estimatedCostRange.max)}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Saves approx. <strong>{formatCurrency(diagnosis.economicSavings)}</strong> compared to purchasing a new unit.
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    New Replacement Cost
                  </span>
                  <div className="text-2xl font-black text-stone-700">
                    {formatCurrency(diagnosis.replacementCostEstimate)}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    OEM baseline retail price for equivalent tier hardware.
                  </p>
                </div>
              </div>

              {/* Environmental Impact Box */}
              <div className="bg-emerald-50/70 rounded-3xl border border-emerald-200 p-5 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-bold text-emerald-950">Environmental Dividend of Repair</h4>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-2xl border border-emerald-200/60">
                    <span className="text-base font-black text-emerald-900 block">
                      {diagnosis.environmentalBenefit.eWasteAvoidedKg} kg
                    </span>
                    <span className="text-[10px] text-stone-500">E-Waste Avoided</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-emerald-200/60">
                    <span className="text-base font-black text-emerald-900 block">
                      {diagnosis.environmentalBenefit.co2eAvoidedKg} kg
                    </span>
                    <span className="text-[10px] text-stone-500">CO₂e Diverted</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-emerald-200/60">
                    <span className="text-base font-black text-emerald-900 block">
                      +{diagnosis.environmentalBenefit.lifespanExtensionMonths} mo
                    </span>
                    <span className="text-[10px] text-stone-500">Life Extended</span>
                  </div>
                </div>
              </div>

              {/* Safety Warnings & Root Causes */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4 text-xs">
                {diagnosis.safetyCautions && diagnosis.safetyCautions.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Safety Precautions & Cautions</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900/90 pl-1">
                      {diagnosis.safetyCautions.map((caution, cIdx) => (
                        <li key={cIdx}>{caution}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-stone-900 mb-2">Likely Root Causes</h4>
                  <ul className="space-y-1.5">
                    {diagnosis.likelyRootCauses.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-stone-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {diagnosis.troubleshootingSteps && diagnosis.troubleshootingSteps.length > 0 && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-emerald-700" />
                      <span>Safe Non-Destructive Troubleshooting Steps</span>
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-stone-600 pl-1">
                      {diagnosis.troubleshootingSteps.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Transparency Disclaimer */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[10px] text-stone-500 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>{diagnosis.disclaimer}</span>
                </div>

                {/* Log Repair Shortcut & View Passport */}
                {selectedProduct && (
                  <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Link
                      href={`/products/${selectedProduct.id}`}
                      className="text-stone-600 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>← View {selectedProduct.name} Passport</span>
                    </Link>

                    <Link
                      href={`/products/${selectedProduct.id}/repair`}
                      className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 justify-center shadow-2xs transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5 shrink-0" />
                      <span>Log this repair to passport →</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RepairCopilotPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-20 text-center text-xs text-stone-400">
          Loading Repair Copilot...
        </div>
      }
    >
      <CopilotContent />
    </Suspense>
  );
}
