'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  if (c.document_type === 'adjuster_report') return `Adjuster report${c.insurer_name ? ` — ${c.insurer_name}` : ''}`;
  if (c.document_type === 'insurance_denial') return `Insurance denial${c.insurer_name ? ` from ${c.insurer_name}` : ''}${c.denial_code ? ` — Code ${c.denial_code}` : ''}`;
  return `FEMA denial letter${c.denial_code ? ` — Code ${c.denial_code}` : ''}`;
}

function DaysCounter({ days }: { days: number | null }) {
  if (days === null) return <span className="text-sm text-slate-400">No deadline</span>;
  if (days < 0) return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-500">
      <span className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
      Expired
    </span>
  );
  if (days <= 13) return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-red-600">
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
      {days}d left — Urgent
    </span>
  );
  if (days <= 29) return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
      <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
      {days} days left
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
      <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
      {days} days left
    </span>
  );
}

export default function TrackerPage() {
  const [cases, setCases] = useState<TrackedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const sid = localStorage.getItem('claimback-session-id');
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

  const urgentCount = cases.filter((c) => {
    const d = daysUntil(c.deadline_date);
    return d !== null && d >= 0 && d <= 13 && c.status !== 'resolved';
  }).length;
  const readyCount = cases.filter((c) => c.status !== 'resolved' && daysUntil(c.deadline_date) !== null && (daysUntil(c.deadline_date) ?? -1) >= 0).length;

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 pt-16">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">My Documents</h1>
              <p className="text-slate-500 text-sm mt-1">All uploaded documents tracked in this browser session.</p>
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload New Letter
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div role="status" aria-live="polite" className="flex items-center justify-center py-20 gap-3 text-slate-400 text-sm">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading your documents…
          </div>
        ) : !sessionId || cases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-800 mb-2 text-lg">No documents tracked yet</h2>
            <p className="text-slate-500 text-sm mb-6">Upload a FEMA letter to get started. We&apos;ll track your deadlines and generate your appeal letter.</p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#1D4ED8] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Upload a letter to get started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            {/* Summary stat cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Documents</p>
                <p className="text-3xl font-extrabold text-slate-900">{cases.length}</p>
              </div>
              <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Ready to Appeal</p>
                <p className="text-3xl font-extrabold text-emerald-700">{readyCount}</p>
              </div>
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Urgent</p>
                <p className="text-3xl font-extrabold text-red-700">{urgentCount}</p>
              </div>
            </div>

            {/* Case cards */}
            <ul className="space-y-4" aria-label="Tracked documents">
              {cases.map((c) => {
                const days = daysUntil(c.deadline_date);
                const isUrgent = days !== null && days >= 0 && days <= 13;
                const isPast = days !== null && days < 0;
                const { label: docLabel, classes: docClasses } = docTypeLabel(c.document_type);
                const { label: statusLabel, classes: statusClasses } = statusBadge(c.status);
                const href = resultHref(c);
                const uploadDate = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                return (
                  <li key={c.id} className={`bg-white rounded-2xl shadow-sm border p-6 transition-all ${isUrgent ? 'border-red-200' : 'border-slate-100'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${docClasses}`}>
                            {docLabel}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClasses}`}>
                            {statusLabel}
                          </span>
                          <span className="text-xs text-slate-400">Uploaded {uploadDate}</span>
                        </div>

                        {/* Summary */}
                        <p className="text-sm font-semibold text-slate-800 mb-3">{summary(c)}</p>

                        {/* Deadline row */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <DaysCounter days={days} />
                          {c.deadline_date && !isPast && (
                            <span className="text-xs text-slate-400">· Deadline: {c.deadline_date}</span>
                          )}
                          {isPast && (
                            <span className="text-xs text-slate-400">· Deadline may have passed: {c.deadline_date}</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0 sm:items-end">
                        {c.status !== 'resolved' && (
                          <Link
                            href={href}
                            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                              isUrgent
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                            }`}
                          >
                            {isUrgent ? 'Appeal Now — Urgent!' : 'View Appeal Letter'}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        )}

                        <div className="flex items-center gap-3">
                          <Link
                            href={href}
                            className="text-xs text-slate-500 hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                          >
                            View details
                          </Link>

                          {c.status !== 'resolved' && (
                            <>
                              <span className="text-slate-200" aria-hidden="true">·</span>
                              <button
                                onClick={() => markResolved(c.id)}
                                disabled={updating === c.id}
                                className="text-xs text-slate-500 hover:text-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded disabled:opacity-50"
                              >
                                {updating === c.id ? (
                                  <span className="flex items-center gap-1">
                                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving…
                                  </span>
                                ) : 'Mark resolved'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Upload more dashed card */}
            <Link
              href="/upload"
              className="mt-4 flex items-center justify-center gap-2 w-full py-5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all text-sm font-medium group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload more documents
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
