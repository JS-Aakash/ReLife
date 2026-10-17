'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReLife } from '@/lib/store';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ProductTimeMachine } from '@/components/passport/product-time-machine';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { CategoryBadge, WarrantyBadge } from '@/components/ui/badge';
import { getWarrantyInfo } from '@/lib/calculations';

export default function ProductTimeMachinePage() {
  const params = useParams();
  const router = useRouter();
  const { getProductById } = useReLife();

  const productId = params.id as string;
  const product = getProductById(productId);

  if (!product) {
    return (
      <ProtectedRoute
        title="Product Time Machine"
        description="View interactive historical provenance and lifetime milestones."
      >
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <Clock className="w-12 h-12 text-stone-400 mx-auto" />
          <h2 className="text-xl font-bold text-stone-900">Product Passport Not Found</h2>
          <p className="text-xs text-stone-500">
            The requested hardware asset could not be located in your authenticated custodian vault.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Fleet</span>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const warranty = getWarrantyInfo(product.warrantyExpiryDate);

  return (
    <ProtectedRoute
      title="Product Time Machine"
      description="View interactive historical provenance, health trajectory, component replacements, and lifetime milestones."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <Link
              href={`/products/${product.id}`}
              className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors shrink-0"
              title="Return to Product Passport"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {product.publicId}
                </span>
                <CategoryBadge category={product.category} />
                <WarrantyBadge status={warranty.status} daysRemaining={warranty.daysRemaining} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-1 flex items-center gap-2">
                <span>{product.name}</span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-600" />
                  Time Machine Active
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link
              href={`/warranty-rescue?productId=${product.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs whitespace-nowrap"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>Warranty Rescue</span>
            </Link>

            <Link
              href={`/products/${product.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors shadow-2xs whitespace-nowrap"
            >
              <span>Back to Passport</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Standalone Interactive Time Machine Engine */}
        <ProductTimeMachine product={product} />
      </div>
    </ProtectedRoute>
  );
}
