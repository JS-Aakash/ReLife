'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useReLife } from '@/lib/store';
import { Product, DocumentItem } from '@/lib/types';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  ShieldAlert,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Mail,
  Printer,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText,
  Clock,
  Laptop,
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
  Building,
  RotateCcw,
} from 'lucide-react';
import { getWarrantyInfo } from '@/lib/calculations';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

function WarrantyRescueContent() {
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('productId');

  const { products, addDocument } = useReLife();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [faultCategory, setFaultCategory] = useState<string>('hardware_malfunction');
  const [faultDate, setFaultDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [symptomSummary, setSymptomSummary] = useState<string>('');
  const [detailedDescription, setDetailedDescription] = useState<string>('');
  const [uploadedEvidence, setUploadedEvidence] = useState<{ name: string; size: string; type: string }[]>([]);
  const [isEditingDraft, setIsEditingDraft] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [copiedPackage, setCopiedPackage] = useState<boolean>(false);

  // Set default product selection
  useEffect(() => {
    if (preselectedProductId && products.some((p) => p.id === preselectedProductId)) {
      setSelectedProductId(preselectedProductId);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [preselectedProductId, products, selectedProductId]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || products[0] || null,
    [products, selectedProductId]
  );

  const warranty = useMemo(() => {
    if (!selectedProduct) return null;
    return getWarrantyInfo(selectedProduct.warrantyExpiryDate);
  }, [selectedProduct]);

  // Evidence Checklist Audit
  const auditResults = useMemo(() => {
    if (!selectedProduct) return null;

    const hasInvoice = selectedProduct.documents.some(
      (d) => d.fileType === 'invoice' || d.isVerifiedReceipt
    );
    const hasSerial = Boolean(selectedProduct.serialNumber && selectedProduct.serialNumber.trim().length > 3);
    const hasDefectDetails = detailedDescription.trim().length >= 30;
    const hasEvidencePhoto = uploadedEvidence.length > 0;
    const hasPastRepairRecords = selectedProduct.repairs.length > 0;

    let score = 0;
    if (hasInvoice) score += 35;
    if (hasSerial) score += 25;
    if (hasDefectDetails) score += 20;
    if (hasEvidencePhoto) score += 20;

    return {
      hasInvoice,
      hasSerial,
      hasDefectDetails,
      hasEvidencePhoto,
      hasPastRepairRecords,
      readinessScore: score,
    };
  }, [selectedProduct, detailedDescription, uploadedEvidence]);

  // Manufacturer support directory lookup
  const manufacturerInfo = useMemo(() => {
    if (!selectedProduct) return { email: 'support@manufacturer.com', portal: 'support.manufacturer.com' };
    const brand = selectedProduct.brand.toLowerCase();
    if (brand.includes('apple')) {
      return { email: 'applecare-support@apple.com', portal: 'support.apple.com/warranty' };
    } else if (brand.includes('specialized')) {
      return { email: 'ridercare@specialized.com', portal: 'specialized.com/warranty' };
    } else if (brand.includes('fluke')) {
      return { email: 'service.desk@fluke.com', portal: 'fluke.com/support/repairs' };
    } else if (brand.includes('dyson')) {
      return { email: 'help@dyson.com', portal: 'dyson.com/support' };
    } else if (brand.includes('dell')) {
      return { email: 'prosupport@dell.com', portal: 'dell.com/support/home' };
    } else if (brand.includes('sony')) {
      return { email: 'support.electronics@sony.com', portal: 'sony.com/electronics/support' };
    } else if (brand.includes('weller')) {
      return { email: 'weller-service@apex-tools.com', portal: 'weller-tools.com/service' };
    }
    return { email: `support@${brand.replace(/[^a-z0-9]/g, '')}.com`, portal: `support.${brand.replace(/[^a-z0-9]/g, '')}.com` };
  }, [selectedProduct]);

  // Formal Email & Claim Subject & Body
  const defaultSubject = useMemo(() => {
    if (!selectedProduct) return 'Warranty Service Claim';
    return `[WARRANTY CLAIM] Formal Request for Warranty Service - ${selectedProduct.brand} ${selectedProduct.name} (SN: ${selectedProduct.serialNumber || 'N/A'})`;
  }, [selectedProduct]);

  const defaultEmailBody = useMemo(() => {
    if (!selectedProduct) return '';
    return `Attn: ${selectedProduct.brand} Warranty & Authorized Service Department,

I am writing to formally submit a warranty claim regarding my ${selectedProduct.brand} ${selectedProduct.name}, purchased on ${formatDate(selectedProduct.purchaseDate)} from ${selectedProduct.seller || 'Authorized Retailer'}.

PRODUCT IDENTIFICATION:
• Item Name: ${selectedProduct.name}
• Brand & Model: ${selectedProduct.brand} / ${selectedProduct.model}
• Serial Number: ${selectedProduct.serialNumber || 'N/A'}
• Purchase Date: ${formatDate(selectedProduct.purchaseDate)} (Original Price: ${formatCurrency(selectedProduct.purchasePrice, selectedProduct.purchaseCurrency)})
• ReLife Product Passport UID: ${selectedProduct.publicId}

DEFECT & MALFUNCTION REPORT:
• Symptom Summary: ${symptomSummary || 'Non-conforming hardware fault'}
• Date Fault First Observed: ${faultDate}
• Detailed Diagnostic Observations:
${detailedDescription || 'The product exhibits manufacturing defect symptoms under normal, compliant operating conditions. No accidental liquid damage, drop impact, or unapproved third-party structural alterations have occurred.'}

ATTACHED EVIDENCE & PROOFS:
1. Proof of Purchase Invoice / Tax Receipt: ${auditResults?.hasInvoice ? 'Attached (Verified OEM Receipt)' : 'Enclosed in dossier'}
2. Serial Number & Hardware Tag Verification: Authenticated
3. Evidence Attachments: ${uploadedEvidence.length > 0 ? uploadedEvidence.map((e) => e.name).join(', ') : 'Photographic documentation of defect attached'}
${selectedProduct.repairs.length > 0 ? `4. Authorized Historical Service Record: ${selectedProduct.repairs.length} certified repair log(s) on file.` : ''}

Under standard warranty terms and statutory consumer conformity provisions, I request an authorization for warranty inspection, repair, or replacement with genuine OEM components.

Please provide return merchandise authorization (RMA) instructions and service ticket dispatch.

Sincerely,
Hardware Custodian
ReLife Certified Passport Holder`;
  }, [selectedProduct, symptomSummary, faultDate, detailedDescription, auditResults, uploadedEvidence]);

  const [emailSubject, setEmailSubject] = useState(defaultSubject);
  const [emailBody, setEmailBody] = useState(defaultEmailBody);

  // Sync default email draft when product/symptoms change
  useEffect(() => {
    setEmailSubject(defaultSubject);
    setEmailBody(defaultEmailBody);
  }, [defaultSubject, defaultEmailBody]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(manufacturerInfo.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handlePrintPackage = () => {
    window.print();
  };

  const handleSimulateEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newItems = Array.from(files).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
      type: f.type,
    }));
    setUploadedEvidence((prev) => [...prev, ...newItems]);
  };

  if (!selectedProduct) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-lg font-bold text-stone-800">No Products Registered Yet</h2>
        <p className="text-xs text-stone-500">Register an asset in your vault to generate automated warranty claim packages.</p>
        <Link href="/products/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold">
          Register New Product
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner (Hidden on Print) */}
      <div className="print:hidden space-y-3 pb-6 border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">Warranty Rescue</h1>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Compile proof dossiers, audit missing statutory documents, and generate manufacturer-ready warranty packages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrintPackage}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white transition-colors shadow-2xs whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 text-stone-300" />
              <span>Export Claim PDF Package</span>
            </button>
          </div>
        </div>

        {/* Legal Disclaimer Advisory (Critical requirement) */}
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300/80 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed text-[11px]">
            <span className="font-bold">Statutory Claim & Evidence Advisory:</span> ReLife compiles verifiable hardware telemetry, authentic purchase receipts, and statutory claim drafts. ReLife is not a warranty underwriter or claims adjuster; final warranty eligibility and repair coverage are determined solely by the manufacturer or authorized service provider under applicable commercial or statutory guarantees.
          </div>
        </div>
      </div>

      {/* Main Grid: Builder Controls & Claim Package */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Product Selection & Fault Form (Hidden on Print) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          {/* Step 1: Asset Selector */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">1</span>
                <span>Select Target Asset</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">{products.length} registered</span>
            </div>

            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 bg-stone-50 font-medium focus:outline-emerald-600"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} {p.name} ({p.serialNumber || p.publicId})
                </option>
              ))}
            </select>

            {/* Selected Product Snapshot Card */}
            {selectedProduct && (
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div className="min-w-0 flex-1 text-xs space-y-0.5">
                  <span className="font-bold text-stone-900 block truncate">{selectedProduct.name}</span>
                  <p className="text-[10px] text-stone-500 font-mono truncate">
                    SN: {selectedProduct.serialNumber || 'N/A'} • {selectedProduct.seller || 'Merchant'}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${warranty?.status === 'active'
                      ? 'bg-emerald-100 text-emerald-900'
                      : warranty?.status === 'expiring_soon'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-200 text-stone-700'
                      }`}>
                      {warranty?.label || 'Warranty Active'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Purchased {formatDate(selectedProduct.purchaseDate)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Fault Diagnostic Inputs */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-4">
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Describe Hardware Defect</span>
            </span>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Issue Category</label>
                <select
                  value={faultCategory}
                  onChange={(e) => setFaultCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 bg-stone-50 focus:outline-emerald-600"
                >
                  <option value="hardware_malfunction">Electrical / Component Malfunction</option>
                  <option value="battery_power">Battery Degradation / Power System</option>
                  <option value="display_visual">Screen Artifacts / Display Defect</option>
                  <option value="mechanical">Structural / Mechanical Failure</option>
                  <option value="thermal">Thermal Throttling / Fan Overheating</option>
                  <option value="connectivity">Port / Connection Failure</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Date First Observed</label>
                <input
                  type="date"
                  value={faultDate}
                  onChange={(e) => setFaultDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 bg-stone-50 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Short Symptom Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Battery drains rapidly under 40% and shuts down"
                  value={symptomSummary}
                  onChange={(e) => setSymptomSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 bg-stone-50 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Detailed Technical Symptoms</label>
                <textarea
                  rows={4}
                  placeholder="Describe step-by-step behavior, error codes, environmental conditions, and attempted standard restarts..."
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 bg-stone-50 focus:outline-emerald-600"
                />
              </div>

              {/* Upload Extra Evidence Files */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Attach Photo or Video Evidence</label>
                <label className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-stone-50 transition-colors">
                  <Upload className="w-5 h-5 text-stone-400 mb-1" />
                  <span className="text-[11px] font-semibold text-stone-700">Click to attach photo or test logs</span>
                  <span className="text-[9px] text-stone-400">PNG, JPG, PDF up to 25MB</span>
                  <input type="file" multiple onChange={handleSimulateEvidenceUpload} className="hidden" />
                </label>

                {uploadedEvidence.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadedEvidence.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-[11px] text-emerald-900 border border-emerald-200">
                        <span className="truncate">{f.name}</span>
                        <span className="font-mono text-stone-400 shrink-0 ml-2">{f.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Evidence Audit & Manufacturer Claim Dossier */}
        <div className="lg:col-span-7 space-y-6">
          {/* Missing Document & Readiness Audit */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-2xs space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-700" />
                  <span>Statutory Evidence & Missing Document Audit</span>
                </h3>
                <p className="text-xs text-stone-500">Automated check against OEM warranty claim submission criteria.</p>
              </div>

              {/* Readiness Meter */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block font-bold uppercase">Claim Strength</span>
                  <span className="text-sm font-black text-emerald-900 font-mono">
                    {auditResults?.readinessScore}% / 100%
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border-3 border-emerald-600 flex items-center justify-center font-bold text-xs text-emerald-800 bg-emerald-50">
                  {auditResults?.readinessScore}%
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className={`p-3 rounded-2xl border flex items-start gap-2.5 ${auditResults?.hasInvoice ? 'bg-emerald-50/70 border-emerald-300' : 'bg-red-50/70 border-red-300'
                }`}>
                {auditResults?.hasInvoice ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-stone-900">
                    {auditResults?.hasInvoice ? 'Confirmed OEM Invoice' : 'Missing Purchase Invoice'}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {auditResults?.hasInvoice ? 'Authentic bill in document vault.' : 'Attach receipt to validate 1st-party custody.'}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border flex items-start gap-2.5 ${auditResults?.hasSerial ? 'bg-emerald-50/70 border-emerald-300' : 'bg-amber-50/70 border-amber-300'
                }`}>
                {auditResults?.hasSerial ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-stone-900">
                    {auditResults?.hasSerial ? 'Serial Number Confirmed' : 'Serial Number Missing'}
                  </span>
                  <span className="text-[11px] text-stone-500 font-mono">
                    {selectedProduct.serialNumber || 'Required for hardware service ticket.'}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border flex items-start gap-2.5 ${auditResults?.hasDefectDetails ? 'bg-emerald-50/70 border-emerald-300' : 'bg-stone-50 border-stone-200'
                }`}>
                {auditResults?.hasDefectDetails ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-stone-900">Diagnostic Details</span>
                  <span className="text-[11px] text-stone-500">
                    {auditResults?.hasDefectDetails ? 'Detailed symptoms documented.' : 'Enter symptom description on left.'}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border flex items-start gap-2.5 ${auditResults?.hasEvidencePhoto ? 'bg-emerald-50/70 border-emerald-300' : 'bg-stone-50 border-stone-200'
                }`}>
                {auditResults?.hasEvidencePhoto ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-stone-900">Visual Evidence</span>
                  <span className="text-[11px] text-stone-500">
                    {uploadedEvidence.length > 0 ? `${uploadedEvidence.length} file(s) attached.` : 'Upload photo/video for faster RMA approval.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Official Formal Claim Dossier (Printable Layout) */}
          <div
            id="warranty-claim-dossier"
            className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0"
          >
            {/* Dossier Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    OFFICIAL WARRANTY SERVICE DOSSIER
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    ESPR-RMA-2026
                  </span>
                </div>
                <h2 className="text-xl font-black text-stone-900 tracking-tight mt-1">
                  Warranty Claim & Evidence Package
                </h2>
                <p className="text-xs text-stone-500">
                  Compiled via ReLife Open Product Passport Registry Protocol
                </p>
              </div>

              {/* Manufacturer Target Dispatch Badge */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-right text-xs">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">Recipient</span>
                <span className="font-bold text-stone-800 block truncate">{selectedProduct.brand} Service Dept</span>
                <span className="text-[10px] font-mono text-emerald-700">{manufacturerInfo.email}</span>
              </div>
            </div>

            {/* Factual Data Breakdown (Confirmed vs Assumption) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Purchase Date</span>
                <span className="font-bold text-stone-900">{formatDate(selectedProduct.purchaseDate)}</span>
                <span className="text-[9px] text-emerald-700 font-medium block flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Confirmed Fact
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Serial Number</span>
                <span className="font-bold text-stone-900 font-mono truncate block">{selectedProduct.serialNumber || 'N/A'}</span>
                <span className="text-[9px] text-emerald-700 font-medium block flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Confirmed Fact
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Warranty Period</span>
                <span className="font-bold text-stone-900">{selectedProduct.warrantyMonths || 12} Months</span>
                <span className="text-[9px] text-stone-500 block">OEM Commercial Terms</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Fault Assessment</span>
                <span className="font-bold text-stone-900 capitalize">{faultCategory.replace('_', ' ')}</span>
                <span className="text-[9px] text-amber-700 font-medium block">Owner-Reported Claim</span>
              </div>
            </div>

            {/* Editable Email / Cover Letter Draft */}
            <div className="space-y-3">
              <div className="flex items-center justify-between print:hidden">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Editable Claim Correspondence Draft</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied' : 'Copy Text'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenMailClient}
                    className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 font-semibold ml-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Email App</span>
                  </button>
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Subject Line</span>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-stone-50 focus:outline-emerald-600"
                />
              </div>

              {/* Letter Body Textarea */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Letter Body</span>
                <textarea
                  rows={12}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-stone-300 font-mono text-xs text-stone-800 bg-stone-50/50 leading-relaxed focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Official Dossier Declaration Signature Bar (For Printed PDF) */}
            <div className="pt-6 border-t border-dashed border-stone-200 grid grid-cols-2 gap-6 text-xs text-stone-500">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Custodian Affirmation</span>
                <p className="text-[10px] leading-tight text-stone-500">
                  I hereby certify that all facts and attached invoices are genuine and truthful to the best of my knowledge.
                </p>
                <div className="pt-4 border-b border-stone-300 w-36" />
                <span className="text-[9px] text-stone-400 block">Authorized Owner Signature</span>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Cryptographic Passport Stamp</span>
                <span className="font-mono text-[10px] text-emerald-800 font-bold block">{selectedProduct.publicId}</span>
                <span className="text-[9px] text-stone-400 block">Tamper-Evident SHA-256 Ledger Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WarrantyRescuePage() {
  return (
    <ProtectedRoute
      title="Warranty Rescue & Claims Vault"
      description="Sign in to your custodian account to access purchase bills, warranty dates, and compile official warranty claims."
    >
      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" /></div>}>
        <WarrantyRescueContent />
      </Suspense>
    </ProtectedRoute>
  );
}
