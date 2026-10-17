'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  QrCode,
  Sparkles,
  Leaf,
  Wrench,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Scan,
  DollarSign,
  Package,
  Calendar,
  CheckCircle2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { HealthGauge } from '@/components/ui/health-gauge';
import { WarrantyBadge, ProvenanceBadge } from '@/components/ui/badge';
import { getWarrantyInfo } from '@/lib/calculations';
import { formatCurrency, formatDate } from '@/lib/utils';
import { InvoiceScannerModal } from '@/components/scanner/invoice-scanner-modal';
import { HardwareScannerModal } from '@/components/scanner/hardware-scanner-modal';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  const router = useRouter();
  const { products, reminders, toggleReminder } = useReLife();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [hardwareScannerOpen, setHardwareScannerOpen] = useState(false);

  // Compute aggregate statistics
  const totalProducts = products.length;
  const totalRepairs = products.reduce((acc, p) => acc + p.repairs.length, 0);
  const totalRepairSpend = products.reduce(
    (acc, p) => acc + p.repairs.reduce((rAcc, r) => rAcc + (r.cost || 0), 0),
    0
  );
  const totalEWaste = products.reduce((acc, p) => acc + (p.eWasteAvoidedKg || 0), 0);
  const totalCarbon = products.reduce((acc, p) => acc + (p.carbonAvoidedKg || 0), 0);

  // Warranties expiring soon (< 30 days) or active
  const expiringProducts = products.filter((p) => {
    const info = getWarrantyInfo(p.warrantyExpiryDate);
    return info.status === 'expiring_soon';
  });

  // Recent repairs across all products
  const allRepairsWithProduct = products
    .flatMap((p) =>
      p.repairs.map((r) => ({
        ...r,
        productId: p.id,
        productName: p.name,
        productBrand: p.brand,
        productImage: p.imageUrl,
        productPublicId: p.publicId,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <ProtectedRoute title="Custodian Dashboard" description="Sign in to view your private product passports, telemetry, warranty alerts, and repair logs.">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">Passport Command Center</h1>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Fleet Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Real-time telemetry, lifetime provenance, and circular maintainability metrics across all registered assets.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setHardwareScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors shadow-2xs whitespace-nowrap shrink-0"
              title="Scan QR Code or Tap Physical NFC Tag"
            >
              <Scan className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Scan Tag / NFC</span>
            </button>

            <button
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors shadow-2xs whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>AI Bill Scanner</span>
            </button>

            <Link
              href="/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* KPI Statistic Cards - Interactive Clickable Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Assets */}
          <Link
            href="/products"
            className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-1 hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer block group"
          >
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-800 transition-colors">
                Registered Assets
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100 transition-colors">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-stone-900 group-hover:text-emerald-950">{totalProducts}</div>
            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
              <span>100% with living QR</span>
              <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">Browse →</span>
            </div>
          </Link>

          {/* Card 2: Warranty Alert */}
          <Link
            href="/reminders"
            className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-1 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer block group"
          >
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-amber-800 transition-colors">
                Expiring Warranties
              </span>
              <div className={`p-1.5 rounded-lg ${expiringProducts.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}`}>
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700">{expiringProducts.length}</div>
            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
              <span>{expiringProducts.length > 0 ? '<30 days action' : 'All protected'}</span>
              <span className="text-amber-700 font-semibold group-hover:translate-x-0.5 transition-transform">Schedule →</span>
            </div>
          </Link>

          {/* Card 3: Repairs Sealed */}
          <Link
            href="/technician"
            className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-1 hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer block group"
          >
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-800 transition-colors">
                Repairs Sealed
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100 transition-colors">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-stone-900 group-hover:text-emerald-950">{totalRepairs}</div>
            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
              <span>Spend: {formatCurrency(totalRepairSpend)}</span>
              <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">Ledger →</span>
            </div>
          </Link>

          {/* Card 4: E-Waste Diverted */}
          <Link
            href="/analytics"
            className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs space-y-1 hover:border-teal-400 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer block group"
          >
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-teal-800 transition-colors">
                E-Waste Diverted
              </span>
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-800 group-hover:bg-teal-100 transition-colors">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-teal-800">{totalEWaste.toFixed(1)} kg</div>
            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
              <span>{totalCarbon.toFixed(0)} kg CO₂e saved</span>
              <span className="text-teal-700 font-semibold group-hover:translate-x-0.5 transition-transform">Metrics →</span>
            </div>
          </Link>
        </div>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Product Fleet List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900">Registered Product Passports</h2>
                <p className="text-xs text-stone-500">Living passports with real-time health index and verified timeline.</p>
              </div>
              <Link
                href="/products"
                className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {products.map((product) => {
                const warranty = getWarrantyInfo(product.warrantyExpiryDate);

                return (
                  <div
                    key={product.id}
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0 group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=1000&q=80';
                        }}
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                            {product.category}
                          </span>
                          <WarrantyBadge status={warranty.status} daysRemaining={warranty.daysRemaining} />
                        </div>
                        <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-800 transition-colors truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-stone-500">
                          <span>{product.brand}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-stone-400">
                            {product.serialNumber}
                          </span>
                          <span>•</span>
                          <span>{product.repairs.length} repair(s)</span>
                        </div>
                      </div>
                    </div>

                    {/* Health Score & Quick Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100 shrink-0">
                      <HealthGauge score={product.healthScore} size="sm" showLabel={false} />

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/copilot?productId=${product.id}`}
                          className="p-1.5 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-600 hover:text-emerald-800 transition-colors"
                          title="Diagnose with AI Copilot"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-700" />
                        </Link>

                        <Link
                          href={`/passport/${product.publicId}`}
                          target="_blank"
                          className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                          title="View Public Safe QR Profile"
                        >
                          <QrCode className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/products/${product.id}`}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow-2xs whitespace-nowrap shrink-0"
                        >
                          Passport →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Alerts & Recent Repairs (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Urgent Reminders Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    Maintenance Schedules
                  </h3>
                </div>
                <Link href="/reminders" className="text-xs text-emerald-800 font-semibold hover:underline">
                  View all ({reminders.length})
                </Link>
              </div>

              <div className="space-y-2.5">
                {reminders.slice(0, 3).map((reminder) => (
                  <div
                    key={reminder.id}
                    onClick={() => router.push(`/products/${reminder.productId}`)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group space-y-1.5 text-xs ${reminder.completed
                        ? 'bg-stone-50 border-stone-200/60 opacity-60'
                        : 'bg-stone-50/80 border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReminder(reminder.id);
                          }}
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${reminder.completed
                              ? 'bg-emerald-700 border-emerald-700 text-white'
                              : 'border-stone-300 hover:border-emerald-600 bg-white'
                            }`}
                          title={reminder.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {reminder.completed && <Check className="w-3 h-3" />}
                        </button>
                        <span className={`font-semibold truncate group-hover:text-emerald-800 transition-colors ${reminder.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                          {reminder.title}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${reminder.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : reminder.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                      >
                        {reminder.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 leading-snug line-clamp-2 pl-6">
                      {reminder.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-400 pl-6 pt-0.5">
                      <span>Target: {formatDate(reminder.dueDate)}</span>
                      <span className="text-emerald-700 font-medium group-hover:underline">Open Passport →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Repairs Timeline Feed */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                    Recent Service Seals
                  </h3>
                </div>
                <Link href="/analytics" className="text-xs text-emerald-800 font-semibold hover:underline">
                  Analytics
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                {allRepairsWithProduct.slice(0, 3).map((repair) => (
                  <div
                    key={repair.id}
                    onClick={() => router.push(`/products/${repair.productId}`)}
                    className="p-3 rounded-xl border border-stone-200/80 space-y-1 hover:border-emerald-300 hover:bg-stone-50/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900 group-hover:text-emerald-800 transition-colors truncate">
                        {repair.productName}
                      </span>
                      <span className="font-medium text-stone-600">
                        {repair.cost > 0 ? formatCurrency(repair.cost) : 'Under Warranty'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">{repair.issueSummary}</p>
                    <div className="flex items-center justify-between pt-1">
                      <ProvenanceBadge badge={repair.verificationBadge} size="sm" />
                      <span className="text-[10px] text-stone-400">{formatDate(repair.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bill Scanner Modal */}
        <InvoiceScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />

        {/* Hardware QR & NFC Tap Scanner Modal */}
        <HardwareScannerModal isOpen={hardwareScannerOpen} onClose={() => setHardwareScannerOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
