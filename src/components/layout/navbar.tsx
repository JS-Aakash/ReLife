'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  QrCode,
  Plus,
  Wrench,
  BarChart3,
  Bell,
  Menu,
  X,
  RotateCcw,
  Shield,
  Layers,
  Leaf,
  Clock,
  Compass,
} from 'lucide-react';
import { NotificationDropdown } from './notification-dropdown';
import { useReLife } from '@/lib/store';

export function Navbar() {
  const pathname = usePathname();
  const { resetToDemoData } = useReLife();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Layers },
    { name: 'My Products', href: '/products', icon: QrCode },
    { name: 'Repair Copilot', href: '/copilot', icon: Sparkles, badge: 'AI' },
    { name: 'Reminders', href: '/reminders', icon: Clock },
    { name: 'Sustainability', href: '/analytics', icon: Leaf },
    { name: 'Technician Portal', href: '/technician', icon: Wrench },
  ];

  const handleResetDemo = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
      return;
    }
    resetToDemoData();
    setResetConfirm(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-950 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-stone-900 flex items-center gap-1">
                  Re<span className="text-emerald-700">Life</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded ml-1">
                    Passport
                  </span>
                </span>
                <p className="text-[10px] text-stone-400 font-medium -mt-1 hidden sm:block">
                  The Living Digital Product Passport
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-stone-100 text-stone-900 font-semibold shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1 rounded bg-emerald-100 text-emerald-800">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Reset Demo Data Button */}
            <button
              onClick={handleResetDemo}
              className={`hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                resetConfirm
                  ? 'border-amber-300 bg-amber-50 text-amber-900 animate-pulse'
                  : 'border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50'
              }`}
              title="Reset seeded demo data for hackathon judges"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resetConfirm ? 'Confirm Reset?' : 'Demo Reset'}</span>
            </button>

            {/* Notification Dropdown */}
            <NotificationDropdown />

            {/* Add Product Button */}
            <Link
              href="/products/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={handleResetDemo}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1.5 py-2 px-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resetConfirm ? 'Click again to confirm reset' : 'Reset Sample Data'}</span>
            </button>
            <span className="text-[11px] text-stone-400">ReLife v1.0</span>
          </div>
        </div>
      )}
    </header>
  );
}
