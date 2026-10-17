'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Shield,
  Layers,
  Leaf,
  Clock,
  User,
  LogOut,
  ChevronDown,
  Check,
  Scan,
} from 'lucide-react';
import { NotificationDropdown } from './notification-dropdown';
import { useReLife } from '@/lib/store';
import { AuthModal } from '@/components/auth/auth-modal';
import { HardwareScannerModal } from '@/components/scanner/hardware-scanner-modal';

export function Navbar() {
  const pathname = usePathname();
  const {
    currentUser,
    isAuthenticated,
    logout,
    loginAsDemo,
    activePersonaKey,
  } = useReLife();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [hardwareScannerOpen, setHardwareScannerOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Layers },
    { name: 'Products', href: '/products', icon: QrCode },
    { name: 'Warranty Rescue', href: '/warranty-rescue', icon: Shield },
    { name: 'Copilot', href: '/copilot', icon: Sparkles, badge: 'AI' },
    { name: 'Reminders', href: '/reminders', icon: Clock },
    { name: 'Sustainability', href: '/analytics', icon: Leaf },
    { name: 'Tech Portal', href: '/technician', icon: Wrench },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-2 xl:gap-4 min-w-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0 mr-1 xl:mr-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-teal-950 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <div className="shrink-0">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-stone-900 flex items-center gap-1">
                  Re<span className="text-emerald-700">Life</span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-100/70 px-1 py-0.5 rounded ml-0.5 hidden sm:inline-block">
                    Passport
                  </span>
                </span>
                <p className="text-[9px] text-stone-400 font-medium -mt-1 hidden 2xl:block">
                  Digital Product Passport
                </p>
              </div>
            </Link>

            {/* Desktop Navigation (xl+ screens, compact and strictly non-overlapping) */}
            <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 shrink-0">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-2 2xl:px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${isActive
                      ? 'bg-emerald-100 text-emerald-900 font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-emerald-50'
                      }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`}
                    />
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

          {/* Right Header Actions (Zero collision with left nav) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Scan Tag / NFC Button */}
            <button
              onClick={() => setHardwareScannerOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-emerald-100 text-stone-700 transition-colors shadow-2xs whitespace-nowrap shrink-0"
              title="Scan Optical QR Code or Simulate Physical NFC Tag"
            >
              <Scan className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="hidden 2xl:inline">Scan Tag</span>
            </button>

            {/* Notification Dropdown */}
            <NotificationDropdown />

            {/* Add Product Button */}
            <Link
              href="/products/new"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors whitespace-nowrap shrink-0"
              title="Register New Product"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Add Product</span>
            </Link>

            {/* User Auth Profile / Dropdown */}
            {isAuthenticated && currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-600/50 shrink-0"
                  />
                  <div className="hidden 2xl:block text-left text-xs leading-none">
                    <span className="font-bold text-stone-900 block truncate max-w-[80px] 2xl:max-w-[110px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-stone-400 capitalize">
                      {currentUser.role === 'technician' ? 'Technician' : 'Verified Owner'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                    {/* User Summary Header */}
                    <div className="p-3 border-b border-stone-100 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-600 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-stone-900 block truncate">
                          {currentUser.name}
                        </span>
                        <span className="text-[11px] text-stone-400 block truncate">
                          {currentUser.email}
                        </span>
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900">
                          {currentUser.role === 'technician' ? 'Certified Technician' : 'Hardware Caretaker'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Account Switcher */}
                    <div className="py-2 border-b border-stone-100">
                      <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Switch Active Account:
                      </span>
                      <button
                        onClick={() => {
                          loginAsDemo('aarav');
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${activePersonaKey === 'aarav' || activePersonaKey === 'elena'
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'hover:bg-stone-50 text-stone-700'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">Aarav Sharma (Registered Owner)</span>
                        </div>
                        {(activePersonaKey === 'aarav' || activePersonaKey === 'elena') && (
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          loginAsDemo('priya');
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${activePersonaKey === 'priya' || activePersonaKey === 'liam'
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'hover:bg-stone-50 text-stone-700'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <span className="truncate">Priya Patel (Fleet Lead)</span>
                        </div>
                        {(activePersonaKey === 'priya' || activePersonaKey === 'liam') && (
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          loginAsDemo('vikram');
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${activePersonaKey === 'vikram' || activePersonaKey === 'alex'
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'hover:bg-stone-50 text-stone-700'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <span className="truncate">Vikram Malhotra (Certified Technician)</span>
                        </div>
                        {(activePersonaKey === 'vikram' || activePersonaKey === 'alex') && (
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        )}
                      </button>
                    </div>

                    {/* Navigation links */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors font-medium"
                      >
                        <User className="w-4 h-4 text-stone-400 shrink-0" />
                        <span>Account & Security Settings</span>
                      </Link>

                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-700 hover:bg-red-50 transition-colors font-medium text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthTab('signin');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthTab('signup');
                    setAuthModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors whitespace-nowrap"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile / Tablet menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 shrink-0"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated && currentUser ? (
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-emerald-600 shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-bold text-xs text-stone-900 block truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-stone-400 block truncate">
                    {currentUser.email}
                  </span>
                </div>
              </div>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                }}
                className="text-xs text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 shrink-0 whitespace-nowrap ml-2"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="p-2 mb-2 flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthTab('signin');
                  setAuthModalOpen(true);
                }}
                className="flex-1 py-2 text-center text-xs font-bold rounded-xl border border-stone-300 hover:bg-stone-50 whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthTab('signup');
                  setAuthModalOpen(true);
                }}
                className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-emerald-800 text-white whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
          )}

          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${isActive
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-stone-700 hover:bg-stone-50'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`}
                  />
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
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultTab={authTab}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Hardware Scanner & NFC Tap Modal */}
      <HardwareScannerModal
        isOpen={hardwareScannerOpen}
        onClose={() => setHardwareScannerOpen(false)}
      />
    </header>
  );
}
