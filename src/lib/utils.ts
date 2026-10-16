import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ProductCategory } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function timeAgo(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return `${Math.floor(diffSec / 2592000)}mo ago`;
}

export function getCategoryLabel(category: ProductCategory): string {
  const map: Record<ProductCategory, string> = {
    smartphone: 'Smartphone',
    laptop: 'Laptop / PC',
    tablet: 'Tablet',
    audio: 'Audio & Headphones',
    appliance: 'Home Appliance',
    bicycle: 'Bicycle & Mobility',
    camera: 'Camera & Optics',
    gaming: 'Gaming Console',
    other: 'General Device',
  };
  return map[category] || 'Product';
}

export function generatePublicId(brand: string, model: string): string {
  const cleanBrand = (brand || 'item').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
  const cleanModel = (model || 'pass').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `rl-${cleanBrand}-${cleanModel}-${randomSuffix}`;
}

export function generateId(): string {
  return 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
