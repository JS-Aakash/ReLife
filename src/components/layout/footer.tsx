'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Leaf, Heart, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-stone-200/80 bg-white/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
                <Shield className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="font-bold text-base tracking-tight text-stone-900">
                Re<span className="text-emerald-700">Life</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
              The living digital product passport designed to accelerate the right-to-repair movement.
              Preserving product pedigree, verified repair milestones, and environmental savings across multiple lifecycles.
            </p>
            <div className="flex items-center gap-4 text-xs text-stone-400 pt-1">
              <span className="inline-flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                Circular Economy Engine
              </span>
              <span>•</span>
              <span>Vercel Ready</span>
              <span>•</span>
              <span>Open Protocol Standard</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">
                  Product Registry
                </Link>
              </li>
              <li>
                <Link href="/copilot" className="hover:text-emerald-700 transition-colors">
                  Repair vs. Replace AI
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-emerald-700 transition-colors">
                  E-Waste Impact Tracker
                </Link>
              </li>
              <li>
                <Link href="/technician" className="hover:text-emerald-700 transition-colors">
                  Authorized Service Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Transparency & Demo */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 mb-3">
              Transparency
            </h4>
            <ul className="space-y-2 text-xs text-stone-600">
              <li>
                <span className="text-emerald-800 font-medium">100% Client Persistent Mode</span>
              </li>
              <li>
                <span className="text-stone-500">Supabase RLS Enabled</span>
              </li>
              <li>
                <span className="text-stone-500">Redacted Resale Passports</span>
              </li>
              <li>
                <span className="text-stone-500">Tamper-Evident Timeline</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <p>© 2026 ReLife. Engineered for Hackathon Demonstration.</p>
          <p className="flex items-center gap-1">
            Built with care for a circular and repairable future.
          </p>
        </div>
      </div>
    </footer>
  );
}
