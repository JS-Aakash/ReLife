'use client';

import React, { useState } from 'react';
import { useReLife } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar,
  Wrench,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { MaintenanceReminder } from '@/lib/types';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function RemindersPage() {
  const router = useRouter();
  const { reminders, products, toggleReminder, addReminder } = useReLife();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Reminder Form State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<MaintenanceReminder['priority']>('medium');
  const [type, setType] = useState<MaintenanceReminder['type']>('maintenance');

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'pending') return !r.completed;
    if (filter === 'completed') return r.completed;
    return true;
  });

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const prod = products.find((p) => p.id === selectedProductId);

    addReminder({
      productId: selectedProductId,
      productName: prod ? prod.name : 'Device',
      productImage: prod ? prod.imageUrl : '',
      title,
      description,
      dueDate,
      priority,
      type,
      completed: false,
    });

    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const pendingCount = reminders.filter((r) => !r.completed).length;

  return (
    <ProtectedRoute title="Maintenance & Warranty Reminders" description="Sign in to view your product servicing schedules, preventative care tasks, and warranty milestones.">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              Maintenance & Warranty Schedules
            </h1>
            {pendingCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Proactive maintenance schedules to maximize device lifespan and avoid warranty expiration lapses.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>New Schedule</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs overflow-x-auto scrollbar-none pb-1">
        {[
          { key: 'pending', label: `Pending Action (${pendingCount})` },
          { key: 'completed', label: 'Completed' },
          { key: 'all', label: `All Schedules (${reminders.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap shrink-0 ${
              filter === key
                ? 'bg-stone-900 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center text-xs text-stone-400">
            No reminders in this view.
          </div>
        ) : (
          filteredReminders.map((reminder) => {
            const isWarranty = reminder.type === 'warranty_expiry';

            return (
              <div
                key={reminder.id}
                onClick={() => router.push(`/products/${reminder.productId}`)}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group ${
                  reminder.completed
                    ? 'border-stone-200 opacity-60 bg-stone-50/50'
                    : isWarranty
                    ? 'border-amber-200 hover:border-amber-400 hover:shadow-md'
                    : 'border-stone-200 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* Complete Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReminder(reminder.id);
                    }}
                    className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      reminder.completed
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'border-stone-300 hover:border-emerald-600 bg-white'
                    }`}
                    title={reminder.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {reminder.completed && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          reminder.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : reminder.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {reminder.priority} priority
                      </span>
                      <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                        {reminder.type.replace('_', ' ')}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold text-stone-900 group-hover:text-emerald-800 transition-colors ${
                        reminder.completed ? 'line-through text-stone-500' : ''
                      }`}
                    >
                      {reminder.title}
                    </h3>

                    <p className="text-xs text-stone-500 leading-relaxed max-w-2xl">
                      {reminder.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-400 pt-1">
                      <span className="font-medium text-stone-700">{reminder.productName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        Target: {formatDate(reminder.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/copilot?productId=${reminder.productId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 text-xs font-medium transition-colors shadow-2xs whitespace-nowrap shrink-0"
                    title="Diagnose with AI Copilot"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Diagnose</span>
                  </Link>

                  <Link
                    href={`/products/${reminder.productId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 shadow-2xs transition-colors"
                  >
                    <span>View Passport</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">Add Maintenance Schedule</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Target Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Schedule Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Biannual Fan De-dusting / Chain Waxing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Specific actions: e.g. Inspect tire sealant level and degrease cassette."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-emerald-600"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
