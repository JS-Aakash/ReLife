'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ProductCategory, ProductCondition } from '@/lib/types';
import { calculateHealthScore } from '@/lib/calculations';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  UploadCloud,
  FileText,
  Shield,
  Check,
  ArrowLeft,
  Scan,
  Package,
  Calendar,
  DollarSign,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { InvoiceScannerModal } from '@/components/scanner/invoice-scanner-modal';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ExtractedInvoiceData } from '@/lib/ai-service';

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useReLife();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [autoFilledNotice, setAutoFilledNotice] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState<ProductCategory>('laptop');
  const [condition, setCondition] = useState<ProductCondition>('excellent');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [seller, setSeller] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const handleAutoFill = (data: ExtractedInvoiceData) => {
    if (data.productName) setName(data.productName);
    if (data.brand) setBrand(data.brand);
    if (data.model) setModel(data.model);
    if (data.serialNumber) setSerialNumber(data.serialNumber);
    if (data.category) setCategory(data.category);
    if (data.purchasePrice) setPurchasePrice(String(data.purchasePrice));
    if (data.purchaseDate) setPurchaseDate(data.purchaseDate);
    if (data.seller) setSeller(data.seller);
    if (data.warrantyMonths) setWarrantyMonths(String(data.warrantyMonths));
    setDescription(`Extracted via AI Document Scanner from ${data.seller || 'purchase receipt'}. Digital passport credentials established.`);
    setAutoFilledNotice(`Auto-filled: ${data.brand ? data.brand + ' ' : ''}${data.productName} (${data.category})`);
    setScannerOpen(false);
  };

  // Default images by category
  const defaultImages: Record<ProductCategory, string> = {
    laptop: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    smartphone: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80',
    tablet: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    bicycle: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    appliance: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
    audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    gaming: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    other: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
  };

  const hasStartedInput = Boolean(name.trim() || brand.trim() || purchasePrice);

  const previewHealth = calculateHealthScore(
    purchaseDate || new Date().toISOString().split('T')[0],
    category,
    Number(purchasePrice) || 500,
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand) return;

    const expiryDate = new Date(
      new Date(purchaseDate).getTime() + Number(warrantyMonths) * 30.5 * 86400000
    )
      .toISOString()
      .split('T')[0];

    const finalImage = imageUrl || defaultImages[category];

    const newProd = addProduct({
      name,
      brand,
      model: model || name,
      serialNumber: serialNumber || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      category,
      condition,
      purchasePrice: Number(purchasePrice) || 0,
      purchaseCurrency: 'USD',
      purchaseDate,
      seller: seller || 'Authorized Dealer',
      warrantyMonths: Number(warrantyMonths) || 12,
      warrantyExpiryDate: expiryDate,
      imageUrl: finalImage,
      description,
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

    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    router.push(`/products/${newProd.id}`);
  };

  return (
    <ProtectedRoute title="Register New Hardware Passport" description="Sign in as an authenticated custodian to establish tamper-evident digital product passports.">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assets</span>
        </Link>
      </div>

      {/* Header with AI Scanner Promo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Register New Product Passport
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Establish a permanent digital identity with tamper-proof QR code and warranty ledger.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 transition-all shadow-xs shrink-0 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Auto-Fill from Receipt (AI)</span>
        </button>
      </div>

      {/* Auto-filled Notification Banner */}
      {autoFilledNotice && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between text-xs animate-in fade-in shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <span className="font-bold">Hardware specs auto-populated from receipt!</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">{autoFilledNotice}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAutoFilledNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-700" />
            <span>1. Core Hardware Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Product Title</label>
              <input
                type="text"
                required
                placeholder="e.g. MacBook Pro 16-inch M1 Max, Specialized Sirrus X 4.0"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Brand / Manufacturer</label>
              <input
                type="text"
                required
                placeholder="e.g. Apple, Specialized, Dyson, Sony"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Model / Sub-model</label>
              <input
                type="text"
                placeholder="e.g. A2485, 2021 Model, 32GB RAM"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Hardware Serial Number</label>
              <input
                type="text"
                placeholder="e.g. C02G4103MD6R (or leave blank to auto-generate)"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Product Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              >
                <option value="laptop">Laptop / Workstation</option>
                <option value="smartphone">Smartphone</option>
                <option value="tablet">Tablet</option>
                <option value="bicycle">Bicycle & Mobility</option>
                <option value="appliance">Home Appliance</option>
                <option value="audio">Audio & Headphones</option>
                <option value="camera">Camera & Optics</option>
                <option value="gaming">Gaming Console</option>
                <option value="other">Other Device</option>
              </select>
            </div>
          </div>
        </div>

        {/* Purchase & Warranty Details */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            <span>2. Purchase & Warranty Terms</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Purchase Date</label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Purchase Price ($)</label>
              <input
                type="number"
                placeholder="e.g. 1499"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Warranty Term (Months)</label>
              <input
                type="number"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Vendor / Store Name</label>
              <input
                type="text"
                placeholder="e.g. Apple Regent Street, Best Buy, Specialized Dealer"
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Initial Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600"
              >
                <option value="mint">Mint (Like New)</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real-time Health Preview */}
        <div className="bg-emerald-950 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
              {hasStartedInput ? 'Estimated Baseline Health' : 'Dynamic Lifecycle Health Engine'}
            </span>
            <h3 className="text-base font-bold">
              {hasStartedInput ? (
                <>
                  Projected Health Score: <span className="text-emerald-400 font-extrabold">{previewHealth.overallScore} / 100</span>{' '}
                  <span className="text-stone-300 font-normal">({previewHealth.tier})</span>
                </>
              ) : (
                <span className="text-stone-300">
                  Health Score: <span className="text-emerald-400 font-semibold">Calculated on input</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-stone-300 max-w-lg">
              {hasStartedInput
                ? `Calculated dynamically from ${category} lifecycle benchmarks and ${condition} condition. Adding verified maintenance records will further improve durability rating.`
                : 'Enter your hardware title, brand, and condition above to preview the real-time health score & lifecycle longevity projection.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !brand.trim()}
            className={`px-6 py-3 rounded-2xl font-bold text-xs transition-all shadow-sm shrink-0 flex items-center justify-center gap-2 whitespace-nowrap ${
              name.trim() && brand.trim()
                ? 'bg-emerald-400 hover:bg-emerald-300 text-stone-950 cursor-pointer'
                : 'bg-emerald-950/60 border border-emerald-800 text-emerald-400/60 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>Establish Passport</span>
          </button>
        </div>
      </form>

      {/* Bill Scanner Modal */}
      <InvoiceScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onExtracted={handleAutoFill}
      />
    </div>
    </ProtectedRoute>
  );
}
