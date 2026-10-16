'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useReLife } from '@/lib/store';
import { Bell, CheckCheck, Clock, ShieldAlert, Wrench, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

export function NotificationDropdown() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useReLife();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warranty':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'repair_approval':
        return <Wrench className="w-4 h-4 text-emerald-600" />;
      case 'milestone':
        return <ShieldAlert className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={() => markAllNotificationsRead()}
                className="text-xs text-stone-500 hover:text-emerald-700 flex items-center gap-1 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-stone-50 ${
                    !notif.read ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-stone-100">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className={`text-xs font-medium truncate ${!notif.read ? 'text-stone-900 font-semibold' : 'text-stone-700'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-stone-400 shrink-0 ml-2">
                        {timeAgo(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 leading-snug line-clamp-2">
                      {notif.message}
                    </p>
                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium mt-1.5"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-stone-50/80 border-t border-stone-100 text-center">
            <Link
              href="/reminders"
              onClick={() => setIsOpen(false)}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium"
            >
              View Maintenance Schedules & Reminders →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
