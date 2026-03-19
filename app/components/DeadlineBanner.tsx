'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

interface UrgentCase {
  id: string;
  deadline_date: string;
  daysLeft: number;
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function DeadlineBanner() {
  const [urgentCase, setUrgentCase] = useState<UrgentCase | null>(null);
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    const dismissKey = `banner-dismissed-${todayKey()}`;
    if (localStorage.getItem(dismissKey)) return;

    const sessionId = localStorage.getItem('appealkit-session-id');
    if (!sessionId) return;

    const today = new Date().toISOString().split('T')[0];
    const sevenDaysOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    getSupabase()
      .from('cases')
      .select('id, deadline_date')
      .eq('session_id', sessionId)
      .neq('status', 'resolved')
      .gte('deadline_date', today)
      .lte('deadline_date', sevenDaysOut)
      .order('deadline_date', { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const c = data[0];
          setUrgentCase({
            id: c.id,
            deadline_date: c.deadline_date,
            daysLeft: daysUntil(c.deadline_date),
          });
          setDismissed(false);
        }
      });
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(`banner-dismissed-${todayKey()}`, '1');
    setDismissed(true);
  };

  if (dismissed || !urgentCase) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 text-sm"
    >
      <div className="flex items-center gap-2 min-w-0">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="truncate">
          <strong>Deadline in {urgentCase.daysLeft} day{urgentCase.daysLeft !== 1 ? 's' : ''}</strong>
          {' — '}
          <Link
            href="/tracker"
            className="underline underline-offset-2 hover:text-red-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
          >
            View your tracker
          </Link>
        </span>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss deadline banner"
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
