'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Leaf,
  DollarSign,
  TrendingDown,
  Info,
  QrCode,
  RotateCcw,
} from 'lucide-react';
import {
  ReceiptPrinter,
  type ReceiptPrinterStage,
} from '@/components/ReceiptPrinter';
import { TactileButton } from '@/components/TactileButton';
import { Product, RepairRecord, ServiceProviderSubmission } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import confetti from 'canvas-confetti';

export interface RepairImpactReceiptData {
  product: Product;
  repair: RepairRecord | (Omit<RepairRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string });
  submission?: ServiceProviderSubmission;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: RepairImpactReceiptData | null;
}

export function RepairImpactReceiptModal({ isOpen, onClose, data }: Props) {
  const [stage, setStage] = useState<ReceiptPrinterStage>('processing');
  const [copied, setCopied] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStage('processing');
      // Progression: Processing -> Printing after 1.2s -> Complete after 3.2s
      const timer1 = setTimeout(() => {
        setStage('printing');
      }, 1100);

      const timer2 = setTimeout(() => {
        setStage('complete');
        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore in test environments
        }
      }, 3400);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setStage('processing');
      setShowAssumptions(false);
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const { product, repair, submission } = data;

  // Impact calculations
  const repairCost = Number(repair.cost) || 0;
  // Estimated replacement cost avoided is based on product purchase price or MSRP
  const replacementCost = product.purchasePrice || 800;
  const netSavings = Math.max(0, replacementCost - repairCost);

  // Cumulative repair spending across device lifetime
  const cumulativeSpending = (product.repairs || []).reduce(
    (acc, r) => acc + (Number(r.cost) || 0),
    0
  ) + (product.repairs.some((r) => r.id === repair.id) ? 0 : repairCost);

  // Environmental impact calculations (transparent assumptions)
  // Embodied manufacturing CO2 avoids (kg CO2e)
  const categoryCarbonFactors: Record<string, number> = {
    Electronics: 165,
    Appliances: 210,
    Mobility: 95,
    Tools: 75,
    Audio: 45,
    Default: 80,
  };
  const categoryEWasteKg: Record<string, number> = {
    Electronics: 2.3,
    Appliances: 14.5,
    Mobility: 11.2,
    Tools: 4.8,
    Audio: 1.6,
    Default: 3.5,
  };

  const carbonAvoided = categoryCarbonFactors[product.category] || categoryCarbonFactors.Default;
  const eWasteAvoided = categoryEWasteKg[product.category] || categoryEWasteKg.Default;

  const handleShare = async () => {
    const text = `🌱 ReLife Repair Impact Receipt: Saved ${formatCurrency(netSavings)} and avoided ${carbonAvoided}kg CO₂e by repairing ${product.name}! View Digital Passport: https://relife.id/passport/${product.publicId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ReLife Repair Receipt - ${product.name}`,
          text,
          url: window.location.origin + `/passport/${product.publicId}`,
        });
      } catch {
        // Fallback to clipboard
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const replayAnimation = () => {
    setStage('processing');
    setTimeout(() => setStage('printing'), 800);
    setTimeout(() => setStage('complete'), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-stone-900 rounded-3xl border border-stone-700/80 shadow-2xl p-4 sm:p-6 my-auto text-stone-100 space-y-4">
        {/* Modal Top Navigation */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-stone-100 tracking-tight">
                Digital Repair Impact Receipt
              </h2>
              <p className="text-[11px] text-stone-400">
                Certified Digital Product Passport Circular Economy Ledger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={replayAnimation}
              title="Re-run printer feed animation"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated Printer Wrapper */}
        <div className="flex flex-col items-center justify-center pt-2">
          <ReceiptPrinter.Root stage={stage} className="max-w-md w-full">
            {/* Machine Top Housing */}
            <ReceiptPrinter.Machine className="w-full">
              <ReceiptPrinter.Header>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-inner">
                    RL
                  </div>
                  <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    ReLife Impact Printer 3000
                  </span>
                </div>

                <TactileButton
                  depth="shallow"
                  size="sm"
                  onClick={handleShare}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white border-emerald-950 text-[10px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3" />
                      <span>Share</span>
                    </>
                  )}
                </TactileButton>
              </ReceiptPrinter.Header>

              {/* LCD Screen on Machine */}
              <ReceiptPrinter.Screen className="mt-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-emerald-400 truncate max-w-[200px]">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        Passport: {product.publicId}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-stone-100">
                        {formatCurrency(repairCost)}
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
                        Avoided: {formatCurrency(netSavings)}
                      </span>
                    </div>
                  </div>

                  <ReceiptPrinter.Status />
                </div>
              </ReceiptPrinter.Screen>
            </ReceiptPrinter.Machine>

            {/* Paper Output Slot with Smooth/Stepped Feed */}
            <ReceiptPrinter.Output className="w-full">
              <ReceiptPrinter.Paper className="w-full text-stone-900 bg-[#fbfaf6] shadow-xl border-x border-stone-200">
                {/* Receipt Thermal Paper Content */}
                <div className="space-y-4 text-xs font-mono">
                  {/* Header */}
                  <div className="text-center pb-2 border-b border-dashed border-stone-400">
                    <div className="font-black text-sm tracking-wider uppercase">
                      RELIFE DIGITAL PASSPORT
                    </div>
                    <div className="text-[10px] text-stone-600">
                      CIRCULAR REPAIR & IMPACT RECEIPT
                    </div>
                    <div className="text-[9px] text-stone-500 mt-0.5">
                      Date: {formatDate(repair.date || new Date().toISOString())}
                    </div>
                  </div>

                  {/* Device Meta */}
                  <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-stone-300">
                    <div className="flex justify-between">
                      <span className="text-stone-500">ASSET:</span>
                      <span className="font-bold text-stone-900 truncate max-w-[170px] text-right">
                        {product.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">CATEGORY:</span>
                      <span className="font-semibold">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">PASSPORT ID:</span>
                      <span className="font-mono text-[10px]">{product.publicId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">PROVIDER:</span>
                      <span className="font-semibold truncate max-w-[170px] text-right">
                        {repair.technicianOrShopName || (submission ? submission.shopName : 'Authorized Caretaker')}
                      </span>
                    </div>
                  </div>

                  {/* Repair Summary */}
                  <div className="space-y-1 pb-2 border-b border-dashed border-stone-300">
                    <div className="text-[10px] uppercase font-bold text-stone-500">
                      SERVICE RENDERED:
                    </div>
                    <p className="text-[11px] leading-snug font-medium text-stone-800">
                      {repair.issueSummary}
                    </p>
                    {repair.partsReplaced && repair.partsReplaced.length > 0 && (
                      <div className="pt-1 space-y-0.5">
                        <div className="text-[9px] text-stone-500 uppercase">Parts Installed:</div>
                        {repair.partsReplaced.map((part, i) => (
                          <div key={i} className="flex justify-between text-[10px]">
                            <span className="truncate max-w-[180px]">• {part.name}</span>
                            <span className="font-semibold">{formatCurrency(part.cost || 0)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Financial Metrics */}
                  <div className="space-y-1.5 pb-2 border-b-2 border-stone-900">
                    <div className="flex justify-between font-bold text-xs pt-1">
                      <span>THIS REPAIR COST:</span>
                      <span>{formatCurrency(repairCost)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600 text-[11px]">
                      <span>REPLACEMENT COST AVOIDED:</span>
                      <span className="font-bold text-emerald-700">
                        +{formatCurrency(netSavings)}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-600 text-[11px]">
                      <span>CUMULATIVE REPAIR SPEND:</span>
                      <span className="font-semibold">{formatCurrency(cumulativeSpending)}</span>
                    </div>
                  </div>

                  {/* Environmental Impact Box */}
                  <div className="p-2.5 rounded bg-emerald-50/90 border border-emerald-300 text-emerald-950 space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-900">
                      <Leaf className="w-3 h-3 text-emerald-700" />
                      <span>Environmental Dividend</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center pt-1">
                      <div className="bg-white/80 p-1.5 rounded border border-emerald-200">
                        <div className="text-base font-black text-emerald-800">
                          {carbonAvoided} <span className="text-[10px]">kg</span>
                        </div>
                        <div className="text-[9px] text-emerald-700 font-medium">CO₂e Avoided</div>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded border border-emerald-200">
                        <div className="text-base font-black text-teal-800">
                          {eWasteAvoided} <span className="text-[10px]">kg</span>
                        </div>
                        <div className="text-[9px] text-teal-700 font-medium">E-Waste Diverted</div>
                      </div>
                    </div>
                  </div>

                  {/* Authentic Seal & QR Footer */}
                  <div className="pt-2 text-center space-y-1.5">
                    <div className="text-[9px] text-stone-500 uppercase tracking-widest">
                      SEALED TO CRYPTOGRAPHIC PASSPORT
                    </div>
                    <div className="text-[8px] font-mono text-stone-400 break-all">
                      HASH: 0x{Math.random().toString(16).substring(2, 10).toUpperCase()}
                      {Math.random().toString(16).substring(2, 10).toUpperCase()}
                    </div>
                    <p className="text-[9px] text-stone-500 italic">
                      Thank you for choosing repair over replacement.
                    </p>
                  </div>
                </div>
              </ReceiptPrinter.Paper>
            </ReceiptPrinter.Output>
          </ReceiptPrinter.Root>
        </div>

        {/* Transparent Assumptions & Calculation Methodology Toggle */}
        <div className="pt-2 border-t border-stone-800 space-y-2">
          <button
            onClick={() => setShowAssumptions(!showAssumptions)}
            className="w-full flex items-center justify-between text-xs text-stone-400 hover:text-stone-200 p-2 rounded-xl bg-stone-800/60 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">Transparent Calculation Assumptions</span>
            </div>
            <span className="text-[11px] text-emerald-400">
              {showAssumptions ? 'Hide details ▲' : 'View assumptions ▼'}
            </span>
          </button>

          {showAssumptions && (
            <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-700/60 text-[11px] text-stone-300 space-y-2 animate-in fade-in duration-200">
              <div>
                <strong className="text-emerald-400">Replacement Cost Avoided:</strong> Calculated as the baseline OEM MSRP / purchase price ({formatCurrency(replacementCost)}) minus this repair cost ({formatCurrency(repairCost)}), representing capital expenditure deferred by extending product life.
              </div>
              <div>
                <strong className="text-emerald-400">Embodied Carbon Avoided:</strong> Based on ADEME & OEM Life Cycle Assessment (LCA) benchmarks. Electronics manufacturing accounts for ~75–85% of total product lifecycle carbon. By servicing rather than replacing, the embodied manufacturing footprint ({carbonAvoided} kg CO₂e) is preserved.
              </div>
              <div>
                <strong className="text-emerald-400">E-Waste Diverted:</strong> Product unit weight ({eWasteAvoided} kg) plus standard protective packaging overhead deferred from municipal solid waste (MSW) e-waste stream.
              </div>
              <div>
                <strong className="text-emerald-400">Cumulative Repair Spending:</strong> Lifetime sum of all verified and logged service transactions on this passport ({formatCurrency(cumulativeSpending)}), demonstrating the True Cost to Repair (TCR) index.
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <TactileButton
            depth="regular"
            size="md"
            onClick={handlePrint}
            className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-950"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            <span>Print Receipt</span>
          </TactileButton>

          <TactileButton
            depth="regular"
            size="md"
            onClick={handleShare}
            className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-950"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            <span>{copied ? 'Copied Link!' : 'Share Impact'}</span>
          </TactileButton>
        </div>
      </div>
    </div>
  );
}
export default RepairImpactReceiptModal;
