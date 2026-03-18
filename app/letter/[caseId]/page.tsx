'use client';

import { useState } from 'react';
import Link from 'next/link';

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Upload letter', 'Review denial', 'Get letter'];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {done ? '✓' : num}
              </div>
              <span className={`text-xs mt-1 font-medium whitespace-nowrap ${active ? 'text-blue-700' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < 2 && <div className={`w-12 h-0.5 mb-5 mx-1 ${num < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function LetterPage({ params }: { params: { caseId: string } }) {
  const [letter, setLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateLetter = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: params.caseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate letter');
      setLetter(data.letter);
      setIsGenerated(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLetter = () => {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FEMA-Appeal-Letter-${params.caseId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLetter = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printLetter = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>FEMA Appeal Letter</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;line-height:1.6;font-size:14px;white-space:pre-wrap}</style></head><body>${letter.replace(/</g,'&lt;')}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-r from-blue-950 to-blue-800 text-white px-4 py-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href={`/results/${params.caseId}`} className="flex items-center gap-1.5 text-blue-300 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
          <span className="font-bold text-lg">AppealKit</span>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <StepIndicator current={3} />

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your appeal letter</h2>
          <p className="text-slate-500 text-sm">
            We&apos;ll write a complete letter based on your case. Review, edit, then mail or submit online.
          </p>
        </div>

        {!isGenerated && !isGenerating && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Ready to write your letter</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              We&apos;ll generate a professional appeal letter citing 44 CFR 206.115 — your legal right to a fair review.
            </p>
            <button
              onClick={generateLetter}
              className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-blue-800 transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              Write my appeal letter
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <svg className="animate-spin absolute inset-0 w-16 h-16 text-blue-200" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              </svg>
              <svg className="animate-spin absolute inset-0 w-16 h-16 text-blue-700" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700 text-lg">Writing your appeal letter…</p>
            <p className="text-sm text-slate-400 mt-2">Crafting arguments based on your denial reason. ~15–20 seconds.</p>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex gap-2 items-start">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {isGenerated && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2 items-start">
              <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <p className="text-amber-800 text-sm">
                <strong>Review before sending.</strong> Fill in any <code className="bg-amber-100 px-1 rounded text-xs">[BRACKETED]</code> placeholders with your personal details.
              </p>
            </div>

            {/* Letter in document style */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Appeal Letter</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
              </div>
              <textarea
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                className="w-full min-h-[28rem] p-6 font-mono text-sm text-slate-800 bg-white focus:outline-none resize-y leading-relaxed"
                spellCheck
              />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={copyLetter}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  copied ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {copied ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={printLetter}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={downloadLetter}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>

            {/* How to send */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                How to submit your appeal
              </h4>
              <ol className="text-sm text-blue-800 space-y-2">
                {[
                  'Print two copies of this letter and sign both',
                  'Attach all documents from your checklist',
                  'Mail via USPS Certified Mail — keep your tracking receipt',
                  'Or call FEMA at 1-800-621-3362 to submit by phone',
                  'Or submit online at DisasterAssistance.gov',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-center text-xs text-slate-400 pb-6">
              AppealKit does not provide legal advice. For complex cases, contact a legal aid organization.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
