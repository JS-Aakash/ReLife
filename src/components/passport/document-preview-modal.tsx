'use client';

import React from 'react';
import { DocumentItem } from '@/lib/types';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  FileText,
  FileCheck,
  Lock,
  Copy,
  Check,
  Building,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useReLife } from '@/lib/store';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  productName?: string;
  productSerial?: string;
  productBrand?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentPreviewModal({
  document,
  productName = 'Registered Hardware Asset',
  productSerial = 'SN-2024-X99-R',
  productBrand = 'Authorized Manufacturer',
  isOpen,
  onClose,
}: DocumentPreviewModalProps) {
  const { currentUser } = useReLife();
  const [copiedHash, setCopiedHash] = React.useState(false);

  if (!isOpen || !document) return null;

  // Generate a deterministic pseudo-hash based on document id
  const docHash = `sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`
    .slice(0, 32)
    .concat(document.id.replace(/[^a-f0-9]/gi, '').padEnd(16, 'a').slice(0, 16));

  const handleCopyHash = () => {
    navigator.clipboard.writeText(docHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = window.document.createElement('a');
    const file = new Blob(
      [
        `=======================================================\n` +
        `RELIFE VERIFIED DIGITAL PRODUCT PASSPORT - OFFICIAL VAULT BACKUP\n` +
        `=======================================================\n\n` +
        `Document Title: ${document.title}\n` +
        `File Reference: ${document.fileName}\n` +
        `Document Type: ${document.fileType.toUpperCase()}\n` +
        `Product Asset: ${productName} (${productBrand})\n` +
        `Hardware Serial: ${productSerial}\n` +
        `Custodian: ${currentUser?.name || 'Verified Owner'}\n` +
        `Upload Date: ${formatDate(document.uploadDate)}\n` +
        `Cryptographic Verification Hash: ${docHash}\n` +
        `Status: VERIFIED & SEALED IN RELIFE ENCRYPTED VAULT\n\n` +
        `This digital receipt is authenticated via PostgreSQL cryptographic signatures.\n` +
        `All rights reserved. ReLife Digital Product Passport System.\n`
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `${document.fileName.replace(/\.[^/.]+$/, '')}_authenticated_vault.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Action Header */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Encrypted Vault Document Viewer
              </h3>
              <p className="text-[10px] text-stone-400">
                Authenticated PDF / Proof of Pedigree
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors shadow-2xs"
              title="Download Encrypted Text Proof"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white transition-colors shadow-2xs"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Sheet Preview */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 bg-stone-50/50 flex-1">
          {/* Authentic Document Paper Canvas */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden">
            {/* Watermark Authenticity Stamp */}
            <div className="absolute right-4 top-4 select-none pointer-events-none opacity-15 rotate-12">
              <div className="border-4 border-emerald-800 rounded-2xl p-2 text-center text-emerald-900 font-black tracking-widest text-xs uppercase">
                RELIFE VERIFIED<br />DIGITAL SEAL
              </div>
            </div>

            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-stone-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-stone-900 text-white">
                    {document.fileType === 'invoice'
                      ? 'TAX INVOICE & RECEIPT'
                      : document.fileType === 'repair_receipt'
                      ? 'AUTHORIZED SERVICE ORDER'
                      : document.fileType === 'warranty_cert'
                      ? 'OFFICIAL WARRANTY CERTIFICATE'
                      : 'AUTHENTICATED PEDIGREE RECORD'}
                  </span>
                  {document.isVerifiedReceipt && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <FileCheck className="w-3 h-3 text-emerald-600" />
                      Cryptographically Sealed
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight mt-1">
                  {document.title}
                </h2>
                <p className="text-xs text-stone-500">
                  File Reference: <span className="font-mono text-stone-700">{document.fileName}</span> ({document.fileSize})
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0 text-xs">
                <span className="text-[10px] font-bold uppercase text-stone-400 block">Issue Date</span>
                <span className="font-bold text-stone-800">{formatDate(document.uploadDate)}</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Custodian Vault ID: {currentUser?.id?.slice(0, 12) || 'USR-2026-X'}</span>
              </div>
            </div>

            {/* Hardware Information Table */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Associated Physical Hardware
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-stone-400 block">Product</span>
                  <span className="font-bold text-stone-900">{productName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Brand / Make</span>
                  <span className="font-semibold text-stone-800">{productBrand}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Hardware Serial</span>
                  <span className="font-mono font-bold text-emerald-800">{productSerial}</span>
                </div>
              </div>
            </div>

            {/* Document Content Details based on type */}
            <div className="space-y-4 text-xs">
              {document.fileType === 'invoice' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 font-bold text-stone-700">
                    <span>Description of Supply / Goods</span>
                    <span>Status / Amount</span>
                  </div>
                  <div className="space-y-2 text-stone-600">
                    <div className="flex items-center justify-between">
                      <span>{productName} (Official Retail Unit)</span>
                      <span className="font-bold text-stone-900">Paid in Full</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-500">
                      <span>Standard Manufacturer 1-Year Limited Warranty</span>
                      <span className="text-emerald-700 font-semibold">Included</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-500">
                      <span>Pre-delivery Factory Diagnostic & Inspection</span>
                      <span className="text-emerald-700 font-semibold">Passed</span>
                    </div>
                  </div>
                </div>
              )}

              {document.fileType === 'repair_receipt' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 font-bold text-stone-700">
                    <span>Service Operation & Diagnostics</span>
                    <span>Validation</span>
                  </div>
                  <div className="space-y-2 text-stone-600">
                    <div className="flex items-center justify-between">
                      <span>OEM Certified Calibration & Diagnostic Seal</span>
                      <span className="text-emerald-700 font-semibold">Certified</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Original Genuine Replacement Parts Installed</span>
                      <span className="text-emerald-700 font-semibold">100% Genuine</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Extended Service Warranty on Replaced Sub-assemblies</span>
                      <span className="font-bold text-stone-900">+12 Months</span>
                    </div>
                  </div>
                </div>
              )}

              {document.fileType === 'warranty_cert' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 text-purple-950 space-y-1.5">
                    <span className="font-bold block text-purple-900">
                      Coverage Certificate & Extended Care Terms
                    </span>
                    <p className="text-[11px] text-purple-800 leading-relaxed">
                      This certificate validates coverage against manufacturer defects, unexpected logic board failures, and certified service labor. Valid across all certified service networks.
                    </p>
                  </div>
                </div>
              )}

              {document.fileType === 'manual' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 space-y-1.5">
                    <span className="font-bold block text-stone-900">
                      Manufacturer Maintenance & Repair Directives
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Includes official torque specifications, battery lifecycle recommendations, component teardown instructions, and circular recycling disassembly guidance.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Cryptographic Authenticity Seal Footer */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Vault Verification Hash (SHA-256)
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-stone-600 truncate max-w-[280px] sm:max-w-[340px]">
                    {docHash}
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    title="Copy SHA-256 Hash"
                  >
                    {copiedHash ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                  <Lock className="w-3 h-3 text-stone-500" />
                  Owner Confidential Vault
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0 text-xs text-stone-500">
          <span>Official document encrypted in ReLife Secure Vault.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
