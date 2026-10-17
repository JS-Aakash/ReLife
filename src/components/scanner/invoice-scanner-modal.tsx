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
  ArrowLeft,
  Eye,
  Maximize2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface SampleReceipt {
  id: string;
  name: string;
  fileName: string;
  imagePath: string;
  badge: string;
  seller: string;
  price: string;
  date: string;
  category: ProductCategory;
  specs: string;
  receiptNo: string;
}

export const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'bike',
    name: 'Firefox Raid 29" Receipt',
    fileName: 'BicycleReceipt.png',
    imagePath: '/Products/BicycleReceipt.png',
    badge: 'Bicycle & Mobility',
    seller: 'Decathlon',
    price: '$299.00',
    date: '10 Oct 2026',
    category: 'bicycle',
    specs: '21 Speed Alloy Frame',
    receiptNo: 'CY20261016',
  },
  {
    id: 'laptop',
    name: 'Apple MacBook Air 13-inch',
    fileName: 'LaptopReceipt.png',
    imagePath: '/Products/LaptopReceipt.png',
    badge: 'Laptop / PC',
    seller: 'TechHub Electronics',
    price: '$1,199.00',
    date: '10 Oct 2026',
    category: 'laptop',
    specs: 'M2 Chip, 8GB RAM, 256GB SSD',
    receiptNo: '#TRX20261016',
  },
  {
    id: 'phone',
    name: 'iQOO Neo 7 Pro 5G Bill',
    fileName: 'PhoneReceipt.png',
    imagePath: '/Products/PhoneReceipt.png',
    badge: 'Smartphone',
    seller: 'Amazon',
    price: '$449.00',
    date: '10 Oct 2026',
    category: 'smartphone',
    specs: '12GB RAM, 256GB ROM',
    receiptNo: '#IQ20261016',
  },
];

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
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [previewingReceipt, setPreviewingReceipt] = useState<SampleReceipt | null>(null);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
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

  const triggerScan = async (sampleName?: string, base64Payload?: string) => {
    setScanning(true);
    setScanStep('Analyzing document typography and OCR layers...');

    try {
      const response = await fetch('/api/ai/scan-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: sampleName || selectedFileName || 'invoice.pdf',
          imageBase64OrText: base64Payload || undefined,
        }),
      });

      setScanStep('Extracting vendor, serial numbers, and warranty terms with Gemini AI...');

      if (response.ok) {
        const data: ExtractedInvoiceData = await response.json();
        setExtractedData(data);
        setProductName(data.productName);
        setBrand(data.brand);
        setModel(data.model);
        setSerialNumber(data.serialNumber);
        setPurchasePrice(String(data.purchasePrice || ''));
        setPurchaseDate(data.purchaseDate || new Date().toISOString().split('T')[0]);
        setSeller(data.seller || '');
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
      setScanning(true);
      setScanStep('Reading document pixels and preparing vision model...');

      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawDataUrl = ev.target?.result as string;
        setImagePreviewUrl(rawDataUrl);

        if (file.type.startsWith('image/')) {
          const img = new Image();
          img.onload = () => {
            const MAX_DIM = 1600;
            let width = img.width;
            let height = img.height;
            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.88);
              triggerScan(file.name, compressed);
            } else {
              triggerScan(file.name, rawDataUrl);
            }
          };
          img.onerror = () => {
            triggerScan(file.name, rawDataUrl);
          };
          img.src = rawDataUrl;
        } else {
          // PDFs or other file types
          triggerScan(file.name, rawDataUrl);
        }
      };
      reader.onerror = () => {
        triggerScan(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanSample = async (sample: SampleReceipt) => {
    setSelectedFileName(sample.fileName);
    setImagePreviewUrl(sample.imagePath);
    setPreviewingReceipt(null);
    setScanning(true);
    setScanStep('Loading document image & preparing AI vision pipeline...');

    try {
      const res = await fetch(sample.imagePath);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        triggerScan(sample.fileName, base64);
      };
      reader.onerror = () => {
        triggerScan(sample.fileName);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load sample image blob', err);
      triggerScan(sample.fileName);
    }
  };

  const handleApplyToForm = () => {
    if (onExtracted) {
      onExtracted({
        productName: productName || 'Hardware Asset',
        brand: brand || 'Manufacturer',
        model: model || productName,
        serialNumber: serialNumber || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
        purchasePrice: Number(purchasePrice) || 0,
        purchaseCurrency: 'USD',
        seller: seller || 'Retailer',
        warrantyMonths: Number(warrantyMonths) || 12,
        category,
        confidenceScore: extractedData?.confidenceScore || 0.98,
        source: extractedData?.source || 'ai_vision',
      });
      onClose();
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
          : category === 'camera'
          ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8 shadow-2xl border border-stone-200">
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

        {previewingReceipt && !extractedData && !scanning ? (
          /* High-Resolution Document Preview View */
          <div className="py-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <button
                type="button"
                onClick={() => setPreviewingReceipt(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Document Selection</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {previewingReceipt.badge}
                </span>
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="Enlarge receipt"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Enlarge</span>
                </button>
              </div>
            </div>

            {/* Document Frame */}
            <div
              onClick={() => setIsZoomModalOpen(true)}
              className="relative rounded-2xl border border-stone-200 bg-stone-50/70 overflow-hidden shadow-xs cursor-zoom-in group max-h-[360px] flex items-center justify-center p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewingReceipt.imagePath}
                alt={previewingReceipt.name}
                className="max-h-[330px] w-auto max-w-full object-contain rounded-xl shadow-2xs group-hover:scale-[1.01] transition-transform duration-200"
              />
              <div className="absolute bottom-4 right-4 bg-stone-900/80 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <Eye className="w-3.5 h-3.5" />
                <span>Click to View Full-Size</span>
              </div>
            </div>

            {/* Metadata Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Merchant</span>
                <span className="font-semibold text-stone-800 truncate block">{previewingReceipt.seller}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Invoice Total</span>
                <span className="font-bold text-emerald-800">{previewingReceipt.price}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Date</span>
                <span className="font-semibold text-stone-800">{previewingReceipt.date}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Receipt No.</span>
                <span className="font-mono text-[11px] text-stone-700">{previewingReceipt.receiptNo}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setPreviewingReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Choose Another
              </button>
              <button
                type="button"
                onClick={() => handleScanSample(previewingReceipt)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:shadow-md"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Analyse Receipt with AI</span>
              </button>
            </div>
          </div>
        ) : !extractedData ? (
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
                {scanning ? 'Analyzing Document with AI...' : 'Drop Invoice or Receipt here'}
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {scanning
                  ? scanStep
                  : 'Supports PNG, JPG, or PDF bills. Extracts vendor, warranty, and model information.'}
              </p>
            </div>

            {/* Verified Sample Receipts with Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Sample Receipts (Preview & Analyse)
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">Click any card to preview full document</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_RECEIPTS.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => setPreviewingReceipt(sample)}
                    className="p-3 rounded-2xl border border-stone-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all text-xs group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-stone-100 mb-2.5 border border-stone-200/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sample.imagePath}
                          alt={sample.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-900/85 text-white backdrop-blur-xs">
                            {sample.badge}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] font-bold bg-white/95 text-stone-900 px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
                            <Eye className="w-3 h-3 text-emerald-700" />
                            <span>Preview</span>
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-stone-900 group-hover:text-emerald-900 block leading-snug">
                          {sample.name}
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-stone-500">
                          <span>{sample.seller}</span>
                          <span className="font-bold text-emerald-800">{sample.price}</span>
                        </div>
                        <span className="text-[10px] text-stone-400 block truncate">
                          {sample.specs}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewingReceipt(sample);
                        }}
                        className="text-[11px] font-semibold text-stone-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScanSample(sample);
                        }}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Analyse</span>
                      </button>
                    </div>
                  </div>
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
                onClick={() => {
                  setExtractedData(null);
                  setImagePreviewUrl(null);
                }}
                className="text-[11px] text-emerald-800 font-medium hover:underline"
              >
                Scan another document
              </button>
            </div>

            {/* Document Thumbnail Preview */}
            {imagePreviewUrl && (
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <img
                  src={imagePreviewUrl}
                  alt="Scanned document"
                  className="w-14 h-14 object-cover rounded-lg border border-stone-200 shadow-2xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-stone-800 truncate">
                    {selectedFileName || 'Uploaded Document'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Optical text & metadata parsed with Gemini AI Vision</span>
                  </div>
                </div>
              </div>
            )}

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

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 whitespace-nowrap shrink-0 cursor-pointer text-center"
              >
                Cancel
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {onExtracted && (
                  <button
                    type="button"
                    onClick={handleApplyToForm}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 shadow-2xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Auto-Fill into Passport Form</span>
                  </button>
                )}

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Confirm & Create Passport</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* High-Resolution Document Zoom Lightbox */}
      {isZoomModalOpen && previewingReceipt && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative space-y-4 max-h-[95vh] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2 min-w-0">
                <Receipt className="w-5 h-5 text-emerald-700 shrink-0" />
                <h4 className="text-sm font-bold text-stone-900 truncate">{previewingReceipt.name}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                  {previewingReceipt.badge}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-3 bg-stone-50 rounded-2xl border border-stone-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewingReceipt.imagePath}
                alt={previewingReceipt.name}
                className="w-full h-auto max-h-[62vh] object-contain rounded-xl shadow-xs"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
              <div className="text-xs text-stone-500">
                Merchant: <span className="font-semibold text-stone-800">{previewingReceipt.seller}</span> • Total:{' '}
                <span className="font-bold text-emerald-800">{previewingReceipt.price}</span> • Date:{' '}
                <span className="font-semibold text-stone-800">{previewingReceipt.date}</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Close Zoom
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsZoomModalOpen(false);
                    handleScanSample(previewingReceipt);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Analyse with AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
