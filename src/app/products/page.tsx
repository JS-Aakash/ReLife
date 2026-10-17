'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import Link from 'next/link';
import {
  Search,
  Filter,
  Plus,
  Scan,
  QrCode,
  Wrench,
  Shield,
  Clock,
  ArrowUpDown,
  FileText,
  Copy,
  Check,
  Package,
} from 'lucide-react';
import { HealthGauge } from '@/components/ui/health-gauge';
import { WarrantyBadge, CategoryBadge } from '@/components/ui/badge';
import { getWarrantyInfo } from '@/lib/calculations';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ProductCategory } from '@/lib/types';
import { InvoiceScannerModal } from '@/components/scanner/invoice-scanner-modal';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function ProductsPage() {
  const { products } = useReLife();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWarranty, setSelectedWarranty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'health' | 'newest' | 'repairs' | 'price'>('health');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: { label: string; value: string }[] = [
    { label: 'All Assets', value: 'all' },
    { label: 'Laptops', value: 'laptop' },
    { label: 'Smartphones', value: 'smartphone' },
    { label: 'Bicycles', value: 'bicycle' },
    { label: 'Appliances', value: 'appliance' },
    { label: 'Audio', value: 'audio' },
  ];

  // Filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    const warrantyInfo = getWarrantyInfo(product.warrantyExpiryDate);
    const matchesWarranty =
      selectedWarranty === 'all' ||
      (selectedWarranty === 'active' && warrantyInfo.status === 'active') ||
      (selectedWarranty === 'expiring_soon' && warrantyInfo.status === 'expiring_soon') ||
      (selectedWarranty === 'expired' && warrantyInfo.status === 'expired');

    return matchesSearch && matchesCategory && matchesWarranty;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'health') return b.healthScore - a.healthScore;
    if (sortBy === 'newest')
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'repairs') return b.repairs.length - a.repairs.length;
    if (sortBy === 'price') return b.purchasePrice - a.purchasePrice;
    return 0;
  });

  const handleCopySerial = (serial: string, id: string) => {
    navigator.clipboard.writeText(serial);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ProtectedRoute title="My Registered Assets" description="Sign in to view and manage your authenticated digital product passports and ownership certificates.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Registered Assets</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Browse, manage, and inspect the living digital identity of each product in your fleet.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setScannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors shadow-2xs whitespace-nowrap shrink-0"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>AI Bill Scan</span>
          </button>

          <Link
            href="/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Register Product</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by brand, model, product name, or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600 bg-stone-50/50"
            />
          </div>

          {/* Warranty Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedWarranty}
              onChange={(e) => setSelectedWarranty(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="all">Warranty: All Statuses</option>
              <option value="active">Active Only</option>
              <option value="expiring_soon">Expiring Soon (&lt;30d)</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-emerald-600 bg-stone-50/50 text-stone-700 font-medium"
            >
              <option value="health">Sort: Highest Health Score</option>
              <option value="newest">Sort: Recently Registered</option>
              <option value="repairs">Sort: Most Repairs Logged</option>
              <option value="price">Sort: Purchase Price</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs pt-1 border-t border-stone-100">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.value
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">No products match your criteria</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              Try adjusting your search query or clear filters to view registered product passports.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedWarranty('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => {
            const warranty = getWarrantyInfo(product.warrantyExpiryDate);

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Image & Category */}
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-stone-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-900/80 text-white backdrop-blur-xs">
                        {product.category}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <WarrantyBadge
                        status={warranty.status}
                        daysRemaining={warranty.daysRemaining}
                      />
                    </div>
                  </div>

                  {/* Product Title & Brand */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      {product.brand}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{product.model}</p>
                  </div>

                  {/* Serial Number & Warranty Metadata */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Serial / Hardware ID
                      </span>
                      <span className="font-mono font-medium text-stone-700">
                        {product.serialNumber}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopySerial(product.serialNumber, product.id)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-md transition-colors"
                      title="Copy Serial Number"
                    >
                      {copiedId === product.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Health Score Gauge & Stats */}
                  <div className="flex items-center justify-between pt-1">
                    <HealthGauge score={product.healthScore} size="sm" showLabel={true} />

                    <div className="text-right text-xs">
                      <span className="text-stone-400 block text-[10px] font-semibold uppercase">
                        Service Ledger
                      </span>
                      <span className="font-bold text-stone-800">
                        {product.repairs.length} records
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/passport/${product.publicId}`}
                      target="_blank"
                      className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
                      title="Open Public Safe Passport"
                    >
                      <QrCode className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/resale/${product.publicId}`}
                      className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
                      title="View Resale Passport"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                  </div>

                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs text-center transition-colors shadow-2xs whitespace-nowrap"
                  >
                    Open Passport →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bill Scanner Modal */}
      <InvoiceScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
    </ProtectedRoute>
  );
}
