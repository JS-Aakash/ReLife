'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { ExtractedInvoiceData } from '@/lib/ai-service';
import { ProductCategory, ProductCondition } from '@/lib/types';
import {
  Sparkles,
  UploadCloud,
  FileText,
  Check,
  AlertCircle,
  X,
  Loader2,
  Scan,
  ShieldCheck,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InvoiceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted?: (data: ExtractedInvoiceData) => void;
}

export function InvoiceScannerModal({ isOpen, onClose, onExtracted }: InvoiceScannerModalProps) {
  const router = useRouter();
  const { addProduct } = useReLife();

  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [scanStep, setScanStep] = useState<string>('');

  // Editable Form fields
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [seller, setSeller] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [category, setCategory] = useState<ProductCategory>('laptop');
  const [condition, setCondition] = useState<ProductCondition>('mint');

  if (!isOpen) return null;

  const triggerScan = async (sampleName?: string) => {
    setScanning(true);
    setScanStep('Analyzing document typography and OCR layers...');

    try {
      const response = await fetch('/api/ai/scan-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: sampleName || selectedFileName || 'invoice.pdf',
        }),
      });

      setScanStep('Extracting vendor, serial numbers, and warranty terms...');

      if (response.ok) {
        const data: ExtractedInvoiceData = await response.json();
        setExtractedData(data);
        setProductName(data.productName);
        setBrand(data.brand);
        setModel(data.model);
        setSerialNumber(data.serialNumber);
        setPurchasePrice(String(data.purchasePrice));
        setPurchaseDate(data.purchaseDate);
        setSeller(data.seller);
        setWarrantyMonths(String(data.warrantyMonths || 12));
        setCategory(data.category || 'other');
      }
    } catch (e) {
      console.error('Scan error', e);
    } finally {
      setScanning(false);
      setScanStep('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      triggerScan(file.name);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !brand) return;

    const expiryDate = new Date(
      new Date(purchaseDate || Date.now()).getTime() + Number(warrantyMonths) * 30.5 * 86400000
    )
      .toISOString()
      .split('T')[0];

    const newProd = addProduct({
      name: productName,
      brand,
      model,
      serialNumber,
      category,
      purchasePrice: Number(purchasePrice) || 0,
      purchaseCurrency: 'USD',
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      seller: seller || 'Retail Store',
      warrantyMonths: Number(warrantyMonths) || 12,
      warrantyExpiryDate: expiryDate,
      condition,
      imageUrl:
        category === 'bicycle'
          ? 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'
          : category === 'smartphone'
          ? 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80'
          : category === 'audio'
          ? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
          : category === 'appliance'
          ? 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      description: `Registered via AI Bill Scanner (${seller || 'Store'}). Permanent digital passport established.`,
      isPubliclyShared: true,
      resaleDisclosure: {
        showSerialNumber: true,
        showPurchasePrice: false,
        showFullTimeline: true,
        showDocumentProofs: true,
        showHealthScoreBreakdown: true,
        showTechnicianNotes: true,
      },
    });

    onClose();
    router.push(`/products/${newProd.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-900 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-stone-900">AI Bill & Invoice Scanner</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  OCR Engine
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Upload receipts to auto-populate hardware specs, warranty period, and purchase date.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!extractedData ? (
          <div className="py-6 space-y-6">
            {/* Upload Box */}
            <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center bg-stone-50/60 hover:bg-emerald-50/30 hover:border-emerald-500/60 transition-all cursor-pointer relative">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                disabled={scanning}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-emerald-700 flex items-center justify-center mx-auto mb-3 border border-stone-200">
                {scanning ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <h4 className="text-sm font-semibold text-stone-800">
                {scanning ? 'Analyzing Document...' : 'Drop Invoice or Receipt here'}
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {scanning
                  ? scanStep
                  : 'Supports PNG, JPG, or PDF bills. Extracts vendor, warranty, and model information.'}
              </p>
            </div>

            {/* Quick Demo Templates */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Or test with sample receipts:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    name: 'Apple Store Receipt (iPhone)',
                    file: 'apple_store_iphone_receipt.pdf',
                    badge: 'Smartphone',
                  },
                  {
                    name: 'Trek Bicycle Dealership Bill',
                    file: 'trek_bike_purchase_bill.pdf',
                    badge: 'Bicycle',
                  },
                  {
                    name: 'Best Buy Electronics (Laptop)',
                    file: 'bestbuy_dell_laptop_invoice.pdf',
                    badge: 'Laptop',
                  },
                ].map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => {
                      setSelectedFileName(sample.file);
                      triggerScan(sample.file);
                    }}
                    disabled={scanning}
                    className="p-3 text-left rounded-xl border border-stone-200 bg-white hover:border-emerald-600 hover:shadow-xs transition-all text-xs group"
                  >
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">
                      {sample.badge}
                    </span>
                    <span className="font-semibold text-stone-800 group-hover:text-emerald-900 block leading-snug">
                      {sample.name}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-1 block">Click to auto-scan</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Editable Extraction Review Form */
          <form onSubmit={handleSaveProduct} className="py-4 space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-emerald-950">
                  Extraction Complete ({Math.round(extractedData.confidenceScore * 100)}% Confidence)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setExtractedData(null)}
                className="text-[11px] text-emerald-800 font-medium hover:underline"
              >
                Scan another document
              </button>
            </div>

            <p className="text-stone-500 text-xs">
              Review extracted attributes and make corrections before creating the product passport:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Model / Specs</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Product Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                >
                  <option value="smartphone">Smartphone</option>
                  <option value="laptop">Laptop / PC</option>
                  <option value="tablet">Tablet</option>
                  <option value="audio">Audio & Headphones</option>
                  <option value="appliance">Home Appliance</option>
                  <option value="bicycle">Bicycle & Mobility</option>
                  <option value="camera">Camera & Optics</option>
                  <option value="gaming">Gaming Console</option>
                  <option value="other">Other Device</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Purchase Price ($)</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Merchant / Seller</label>
                <input
                  type="text"
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Warranty Period (Months)</label>
                <input
                  type="number"
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 whitespace-nowrap shrink-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>Confirm & Create Passport</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
