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
  RotateCcw,
  Shield,
  Layers,
  Leaf,
  Clock,
  Compass,
  User,
  LogOut,
  ChevronDown,
  Zap,
  Check,
  Lock,
} from 'lucide-react';
import { NotificationDropdown } from './notification-dropdown';
import { useReLife } from '@/lib/store';
import { AuthModal } from '@/components/auth/auth-modal';
import { DEMO_PERSONAS } from '@/lib/auth-personas';

export function Navbar() {
  const pathname = usePathname();
  const {
    currentUser,
    isAuthenticated,
    logout,
    loginAsDemo,
    activePersonaKey,
    resetToDemoData,
  } = useReLife();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup' | 'demo'>('signin');

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
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md">
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
                const isActive =
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
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
                    <Icon
                      className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`}
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

            {/* User Auth Profile / Dropdown */}
            {isAuthenticated && currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-600/50"
                  />
                  <div className="hidden xl:block text-left text-xs leading-none">
                    <span className="font-bold text-stone-900 block truncate max-w-[100px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-stone-400 capitalize">
                      {activePersonaKey ? `${activePersonaKey} demo` : currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
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
                        className="w-10 h-10 rounded-full object-cover border border-emerald-600"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-stone-900 block truncate">
                          {currentUser.name}
                        </span>
                        <span className="text-[11px] text-stone-400 block truncate">
                          {currentUser.email}
                        </span>
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900">
                          {currentUser.role}
                        </span>
                      </div>
                    </div>

                    {/* Judge Persona Quick Switcher */}
                    <div className="py-2 border-b border-stone-100">
                      <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Switch Judge Demo Persona:
                      </span>
                      <button
                        onClick={() => {
                          loginAsDemo('elena');
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${
                          activePersonaKey === 'elena'
                            ? 'bg-emerald-50 text-emerald-900 font-bold'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Elena Rostova (Owner - 3 items)</span>
                        </div>
                        {activePersonaKey === 'elena' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </button>

                      <button
                        onClick={() => {
                          loginAsDemo('liam');
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${
                          activePersonaKey === 'liam'
                            ? 'bg-emerald-50 text-emerald-900 font-bold'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>Liam Sterling (Recipient)</span>
                        </div>
                        {activePersonaKey === 'liam' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </button>

                      <button
                        onClick={() => {
                          loginAsDemo('alex');
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${
                          activePersonaKey === 'alex'
                            ? 'bg-emerald-50 text-emerald-900 font-bold'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>Alex Rivera (Technician)</span>
                        </div>
                        {activePersonaKey === 'alex' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </button>
                    </div>

                    {/* Navigation links */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors font-medium"
                      >
                        <User className="w-4 h-4 text-stone-400" />
                        <span>Account & Security Settings</span>
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setAuthTab('demo');
                          setAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors font-medium text-left"
                      >
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Judge Exploration Dialog</span>
                      </button>

                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-700 hover:bg-red-50 transition-colors font-medium text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
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
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthTab('demo');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors inline-flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                  <span>Demo</span>
                </button>
              </div>
            )}

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
          {isAuthenticated && currentUser ? (
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-emerald-600"
                />
                <div>
                  <span className="font-bold text-xs text-stone-900 block">{currentUser.name}</span>
                  <span className="text-[10px] text-stone-400 block truncate max-w-[140px]">
                    {currentUser.email}
                  </span>
                </div>
              </div>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                }}
                className="text-xs text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50"
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
                className="flex-1 py-2 text-center text-xs font-bold rounded-xl border border-stone-300"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthTab('demo');
                  setAuthModalOpen(true);
                }}
                className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-emerald-800 text-white"
              >
                Judge Demo
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`}
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

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultTab={authTab}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  );
}
