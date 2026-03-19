'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppHeader } from '../components/AppHeader';
import { getSupabase } from '@/lib/supabase';

interface TrackedCase {
  id: string;
  document_type: string | null;
  denial_code: string | null;
  insurer_name: string | null;
  deadline_date: string | null;
  status: string;
  created_at: string;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function resultHref(c: TrackedCase): string {
  if (c.document_type === 'adjuster_report') return `/adjuster-review/${c.id}`;
  if (c.document_type === 'insurance_denial') return `/insurance-results/${c.id}`;
  return `/results/${c.id}`;
}

function docTypeLabel(docType: string | null): { label: string; classes: string } {
  if (docType === 'adjuster_report') return { label: 'Adjuster Report', classes: 'bg-slate-100 text-slate-700' };
  if (docType === 'insurance_denial') return { label: 'Insurance Denial', classes: 'bg-blue-100 text-blue-700' };
  return { label: 'FEMA Denial', classes: 'bg-red-100 text-red-700' };
}

function statusBadge(status: string): { label: string; classes: string } {
  if (status === 'resolved') return { label: 'Resolved', classes: 'bg-emerald-100 text-emerald-700' };
  if (status === 'appealed') return { label: 'Appealed', classes: 'bg-blue-100 text-blue-700' };
  return { label: 'Pending', classes: 'bg-amber-100 text-amber-700' };
}

function summary(c: TrackedCase): string {
  if (c.document_type === 'adjuster_report') {
    return c.insurer_name ? `Adjuster report — ${c.insurer_name}` : 'Damage estimate / adjuster report';
  }
  if (c.denial_code && c.denial_code !== 'N/A') return c.denial_code;
  if (c.insurer_name) return `Denied by ${c.insurer_name}`;
  return 'No summary available';
}

export default function TrackerPage() {
  const [cases, setCases] = useState<TrackedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const sid = localStorage.getItem('appealkit-session-id');
    setSessionId(sid);
    if (!sid) { setLoading(false); return; }

    getSupabase()
      .from('cases')
      .select('id, document_type, denial_code, insurer_name, deadline_date, status, created_at')
      .eq('session_id', sid)
      .order('deadline_date', { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setCases((data as TrackedCase[]) ?? []);
        setLoading(false);
      });
  }, []);

  const markResolved = async (caseId: string) => {
    setUpdating(caseId);
    await getSupabase()
      .from('cases')
      .update({ status: 'resolved' })
      .eq('id', caseId);
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: 'resolved' } : c))
    );
    setUpdating(null);
  };

  // Summary counts
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const upcomingCount = cases.filter(
    (c) => c.deadline_date && c.deadline_date >= today && c.deadline_date <= thirtyDaysOut && c.status !== 'resolved'
  ).length;
  const resolvedCount = cases.filter((c) => c.status === 'resolved').length;

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader subtitle="Deadline Tracker" />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">My Documents</h1>
          <p className="text-slate-500 text-sm">All uploaded documents tracked in this browser session.</p>
        </div>

        {loading ? (
          <div role="status" aria-live="polite" className="flex items-center justify-center py-20 gap-3 text-slate-400 text-sm">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading your documents…
          </div>
        ) : !sessionId || cases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-800 mb-2">No documents tracked yet</h2>
            <p className="text-slate-500 text-sm mb-6">Upload a letter to get started and we&apos;ll track your deadlines here.</p>
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Upload a letter to get started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            {/* Summary row */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 mb-4 flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-bold text-slate-900">{cases.length}</span>
                <span className="text-slate-500 ml-1">document{cases.length !== 1 ? 's' : ''} tracked</span>
              </div>
              <div className="w-px bg-slate-100 hidden sm:block" />
              <div>
                <span className="font-bold text-amber-600">{upcomingCount}</span>
                <span className="text-slate-500 ml-1">deadline{upcomingCount !== 1 ? 's' : ''} in 30 days</span>
              </div>
              <div className="w-px bg-slate-100 hidden sm:block" />
              <div>
                <span className="font-bold text-emerald-600">{resolvedCount}</span>
                <span className="text-slate-500 ml-1">resolved</span>
              </div>
            </div>

            {/* Case cards */}
            <ul className="space-y-3" aria-label="Tracked documents">
              {cases.map((c) => {
                const days = daysUntil(c.deadline_date);
                const isUrgent = days !== null && days <= 14;
                const isWarning = days !== null && days > 14 && days <= 30;
                const isPast = days !== null && days < 0;
                const { label: docLabel, classes: docClasses } = docTypeLabel(c.document_type);
                const { label: statusLabel, classes: statusClasses } = statusBadge(c.status);
                const href = resultHref(c);

                return (
                  <li key={c.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    {/* Top row: badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${docClasses}`}>
                        {docLabel}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClasses}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-slate-700 mb-3 leading-snug line-clamp-2">{summary(c)}</p>

                    {/* Deadline row */}
                    {c.deadline_date ? (
                      <p className={`text-sm font-bold mb-4 ${isPast ? 'text-red-700' : isUrgent ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-600'}`}>
                        {isPast ? (
                          <>Deadline may have passed · {c.deadline_date}</>
                        ) : (
                          <>
                            <time dateTime={c.deadline_date}>{Math.abs(days!)} day{Math.abs(days!) !== 1 ? 's' : ''} remaining</time>
                            <span className="font-normal text-slate-400 ml-2">· {c.deadline_date}</span>
                          </>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 mb-4">No deadline tracked</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={href}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded transition-colors"
                      >
                        View details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>

                      {c.status !== 'resolved' && (
                        <>
                          <span className="text-slate-200" aria-hidden="true">·</span>
                          <button
                            onClick={() => markResolved(c.id)}
                            disabled={updating === c.id}
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded disabled:opacity-50"
                          >
                            {updating === c.id ? (
                              <>
                                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving…
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Mark as resolved
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
