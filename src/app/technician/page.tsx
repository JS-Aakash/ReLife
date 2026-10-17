'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import Link from 'next/link';
import {
  Wrench,
  ShieldCheck,
  PackageCheck,
  Check,
  X,
  Plus,
  Trash2,
  Clock,
  ExternalLink,
  Info,
  Building,
  UserCheck,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RepairPart } from '@/lib/types';
import confetti from 'canvas-confetti';

export default function TechnicianPortalPage() {
  const {
    products,
    serviceSubmissions,
    submitTechnicianRepair,
    approveTechnicianRepair,
    rejectTechnicianRepair,
  } = useReLife();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [shopName, setShopName] = useState('Apex Velo & Tech Works');
  const [technicianName, setTechnicianName] = useState('Marcus Vance (Certified Master Technician)');
  const [technicianContact, setTechnicianContact] = useState('service@apexvelo.com');
  const [issueSummary, setIssueSummary] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [laborCost, setLaborCost] = useState('85');
  const [notes, setNotes] = useState('');
  const [warrantyClaim, setWarrantyClaim] = useState(false);
  const [repairDate, setRepairDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Itemized parts
  const [parts, setParts] = useState<RepairPart[]>([
    { name: '', partNumber: '', cost: 0 },
  ]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleAddPart = () => {
    setParts((prev) => [...prev, { name: '', partNumber: '', cost: 0 }]);
  };

  const handleRemovePart = (idx: number) => {
    setParts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePartChange = (idx: number, field: keyof RepairPart, val: any) => {
    setParts((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !issueSummary) return;

    const validParts = parts.filter((p) => p.name.trim().length > 0);
    const partsCostTotal = validParts.reduce((acc, p) => acc + (p.cost || 0), 0);
    const totalCost = Number(laborCost) + partsCostTotal;

    submitTechnicianRepair({
      productId: selectedProduct.id,
      publicId: selectedProduct.publicId,
      productName: selectedProduct.name,
      shopName,
      technicianName,
      technicianContact,
      issueSummary,
      diagnosis,
      partsReplaced: validParts,
      laborCost: Number(laborCost) || 0,
      partsCost: partsCostTotal,
      totalCost,
      repairDate,
      warrantyClaim,
      notes,
    });

    setSubmittedSuccess(true);
    setIssueSummary('');
    setDiagnosis('');
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  const handleApprove = (id: string) => {
    approveTechnicianRepair(id);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Authorized Service Provider & Technician Portal
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Independent workshops and authorized technicians can submit digitally certified repair records for customer validation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Intake Submission Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-700" />
                <span>Submit Service Record for Digital Seal</span>
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Technician Mode
              </span>
            </div>

            {submittedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <h4 className="font-bold">Record Submitted to Owner Queue</h4>
                  <p className="text-[11px] text-emerald-700">
                    The customer has received an instant notification to review and seal this record into their permanent passport.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Customer Asset (Passport Registry)
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600 bg-stone-50/50"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand}) • Public ID: {p.publicId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Repair Shop / Workshop
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Technician Name & Certifications
                  </label>
                  <input
                    type="text"
                    required
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Issue Summary & Work Performed
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Logic Board Ultrasonic Clean, Drivetrain Tuning, Roller Replacement"
                  value={issueSummary}
                  onChange={(e) => setIssueSummary(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Technical Diagnosis & Calibration Benchmarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Conductive mineral salts cleared. Battery resistance tested at 24mΩ."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              {/* Labor Cost & Parts Cost */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Labor Cost ($)</label>
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Service Date</label>
                  <input
                    type="date"
                    value={repairDate}
                    onChange={(e) => setRepairDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              {/* Parts Installed */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700">OEM Parts Installed:</span>
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="text-emerald-800 font-semibold hover:underline"
                  >
                    + Add Part
                  </button>
                </div>

                {parts.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Part Name"
                      value={p.name}
                      onChange={(e) => handlePartChange(idx, 'name', e.target.value)}
                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-stone-300"
                    />
                    <input
                      type="text"
                      placeholder="Part #"
                      value={p.partNumber || ''}
                      onChange={(e) => handlePartChange(idx, 'partNumber', e.target.value)}
                      className="w-24 text-xs font-mono px-3 py-1.5 rounded-lg border border-stone-300"
                    />
                    <input
                      type="number"
                      placeholder="Cost ($)"
                      value={p.cost || ''}
                      onChange={(e) => handlePartChange(idx, 'cost', Number(e.target.value))}
                      className="w-20 text-xs px-3 py-1.5 rounded-lg border border-stone-300"
                    />
                    {parts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePart(idx)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={warrantyClaim}
                    onChange={(e) => setWarrantyClaim(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-semibold text-stone-800">
                    Billed under Authorized Manufacturer Warranty
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors whitespace-nowrap shrink-0"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Transmit Verified Service Record to Owner</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Pending Owner Approval Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  Owner Approval Queue
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                {serviceSubmissions.filter((s) => s.status === 'pending_owner_approval').length} Pending
              </span>
            </div>

            <p className="text-stone-500 leading-relaxed">
              When a technician submits a record, the product owner must review and grant permission to seal the record into the permanent ledger.
            </p>

            {serviceSubmissions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 text-center text-stone-400">
                No technician submissions pending. Try submitting a repair on the left to see the workflow in action!
              </div>
            ) : (
              <div className="space-y-3">
                {serviceSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{sub.productName}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          sub.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="space-y-1 text-stone-600">
                      <p className="font-medium text-stone-800">{sub.issueSummary}</p>
                      <p className="text-[11px] text-stone-500">
                        Technician: {sub.technicianName} ({sub.shopName})
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="font-bold text-stone-900">
                          Total: {formatCurrency(sub.totalCost)}
                        </span>
                        <span className="text-stone-400">{formatDate(sub.repairDate)}</span>
                      </div>
                    </div>

                    {sub.status === 'pending_owner_approval' && (
                      <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-end gap-2">
                        <button
                          onClick={() => rejectTechnicianRepair(sub.id)}
                          className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 font-medium whitespace-nowrap shrink-0"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(sub.id)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold flex items-center gap-1.5 shadow-2xs whitespace-nowrap shrink-0"
                        >
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Approve & Seal to Passport</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
