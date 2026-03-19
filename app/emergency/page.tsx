'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppHeader } from '../components/AppHeader';
import { StepIndicator } from '../components/StepIndicator';

type DisasterType = 'Hurricane' | 'Flood' | 'Fire' | 'Tornado' | 'Other';
type Step = 'A' | 'B' | 'C' | 'D';

const EMERGENCY_STEPS = ['Disaster', 'Insurance', 'Actions', 'Call script'];

const DISASTERS: { type: DisasterType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'Hurricane',
    label: 'Hurricane',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1M4.22 4.22l.707.707M18.364 18.364l.708.708M1 12h2m18 0h2M4.929 18.364l.707-.707M18.364 5.636l.708-.708M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    ),
  },
  {
    type: 'Flood',
    label: 'Flood',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18c0 0 2-2 4-2s4 2 4 2 2-2 4-2 4 2 4 2M3 13c0 0 2-2 4-2s4 2 4 2 2-2 4-2 4 2 4 2M6 8l6-5 6 5" />
      </svg>
    ),
  },
  {
    type: 'Fire',
    label: 'Fire',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  },
  {
    type: 'Tornado',
    label: 'Tornado',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6h18M5 10h14M7 14h10M9 18h6" />
      </svg>
    ),
  },
  {
    type: 'Other',
    label: 'Other',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function getChecklistItems(
  disasterType: DisasterType,
  hasHomeInsurance: boolean,
  hasFloodInsurance: boolean
): string[] {
  const items = [
    'Do NOT start cleanup or repairs before your adjuster visits',
    'Document everything with photos before moving anything',
    'Save ALL receipts for emergency expenses (hotel, food, supplies)',
    'File your FEMA registration at DisasterAssistance.gov even if you have insurance',
  ];
  if (hasHomeInsurance) {
    items.push('Call your insurer within 24-48 hours to open a claim');
    items.push("Ask for your claim number and adjuster's name in writing");
  }
  if (hasFloodInsurance) {
    items.push('Flood claims are separate — contact your flood insurer independently');
  }
  return items;
}

function YesNoToggle({
  value,
  onChange,
  groupLabel,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  groupLabel: string;
}) {
  return (
    <div role="group" aria-label={groupLabel} className="flex gap-2">
      <button
        onClick={() => onChange(true)}
        aria-pressed={value === true}
        className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border-2 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
          value === true
            ? 'bg-blue-700 border-blue-700 text-white'
            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
        }`}
      >
        Yes
      </button>
      <button
        onClick={() => onChange(false)}
        aria-pressed={value === false}
        className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border-2 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 ${
          value === false
            ? 'bg-slate-700 border-slate-700 text-white'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
        }`}
      >
        No
      </button>
    </div>
  );
}

const STEP_ORDER: Step[] = ['A', 'B', 'C', 'D'];

function stepToNum(step: Step): number {
  return STEP_ORDER.indexOf(step) + 1;
}

export default function EmergencyPage() {
  const [step, setStep] = useState<Step>('A');
  const [disasterType, setDisasterType] = useState<DisasterType | null>(null);
  const [hasHomeInsurance, setHasHomeInsurance] = useState<boolean | null>(null);
  const [hasFloodInsurance, setHasFloodInsurance] = useState<boolean | null>(null);
  const [hasContactedInsurer, setHasContactedInsurer] = useState<boolean | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [sessionId, setSessionId] = useState<string>('');
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem('appealkit-session-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('appealkit-session-id', id);
    }
    setSessionId(id);
    const saved = localStorage.getItem(`emergency-checklist-${id}`);
    if (saved) {
      try { setCheckedItems(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    localStorage.setItem(`emergency-checklist-${sessionId}`, JSON.stringify(checkedItems));
  }, [checkedItems, sessionId]);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const insuranceComplete =
    hasHomeInsurance !== null && hasFloodInsurance !== null && hasContactedInsurer !== null;

  const checklistItems =
    disasterType !== null
      ? getChecklistItems(disasterType, hasHomeInsurance ?? false, hasFloodInsurance ?? false)
      : [];

  const generateScript = async () => {
    setIsGenerating(true);
    setScriptError(null);
    try {
      const res = await fetch('/api/call-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disasterType, hasHomeInsurance, hasFloodInsurance }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate script');
      setScript(data.script);
    } catch (err: unknown) {
      setScriptError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyScript = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader backHref="/" backLabel="Back to home" subtitle="Emergency Guide" />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <StepIndicator steps={EMERGENCY_STEPS} current={stepToNum(step)} />

        {/* ── Step A: Disaster type ── */}
        {step === 'A' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">What type of disaster happened?</h1>
              <p className="text-slate-500 text-sm">Select one to get guidance tailored to your situation.</p>
            </div>
            <div
              role="group"
              aria-label="Disaster type selection"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {DISASTERS.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => setDisasterType(type)}
                  aria-pressed={disasterType === type}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 font-semibold text-base transition-all duration-200 min-h-[140px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    disasterType === type
                      ? 'border-blue-700 bg-blue-50 text-blue-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  <span className={disasterType === type ? 'text-blue-700' : 'text-slate-500'}>
                    {icon}
                  </span>
                  {label}
                </button>
              ))}
            </div>
            <button
              disabled={!disasterType}
              onClick={() => setStep('B')}
              className="mt-6 w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[52px]"
            >
              Continue
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Step B: Insurance status ── */}
        {step === 'B' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Your insurance situation</h1>
              <p className="text-slate-500 text-sm">Answer all three questions to get your personalized action list.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3 items-start">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong>Filing order matters</strong> — always file with your private insurer first.
                FEMA is a last resort, not a replacement for insurance.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "Do you have homeowner's or renter's insurance?",
                  value: hasHomeInsurance,
                  onChange: setHasHomeInsurance,
                },
                {
                  question: 'Do you have separate flood insurance?',
                  value: hasFloodInsurance,
                  onChange: setHasFloodInsurance,
                },
                {
                  question: 'Have you already contacted your insurer?',
                  value: hasContactedInsurer,
                  onChange: setHasContactedInsurer,
                },
              ].map(({ question, value, onChange }) => (
                <div key={question} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <p id={`q-${question.slice(0, 20)}`} className="font-semibold text-slate-900 mb-3 leading-snug">{question}</p>
                  <YesNoToggle value={value} onChange={onChange} groupLabel={question} />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('A')}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:border-slate-300 transition-all duration-200 min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Back
              </button>
              <button
                disabled={!insuranceComplete}
                onClick={() => setStep('C')}
                className="flex-[2] bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Continue
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Step C: Immediate action checklist ── */}
        {step === 'C' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Do these right now</h1>
              <p className="text-slate-500 text-sm">Check off each item as you complete it. Your progress is saved automatically.</p>
            </div>

            <fieldset className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <legend className="sr-only">Immediate action checklist</legend>
              {checklistItems.map((item, i) => (
                <label
                  key={i}
                  className="flex items-start gap-4 cursor-pointer group"
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={!!checkedItems[item]}
                      onChange={() => toggleCheck(item)}
                      className="w-6 h-6 appearance-none rounded-md border-2 border-slate-300 bg-white checked:bg-emerald-500 checked:border-emerald-500 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 group-hover:border-blue-400"
                    />
                    {checkedItems[item] && (
                      <svg
                        className="absolute inset-0 w-6 h-6 text-white pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm leading-snug pt-0.5 transition-colors ${
                    checkedItems[item] ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}>
                    {item}
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex gap-2 items-start">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-800 text-xs leading-relaxed">
                Your checklist progress is saved on this device so you can return to it.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('B')}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:border-slate-300 transition-all duration-200 min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Back
              </button>
              <button
                onClick={() => setStep('D')}
                className="flex-[2] bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-blue-800 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Get call script
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Step D: Call script ── */}
        {step === 'D' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Your insurance call script</h1>
              <p className="text-slate-500 text-sm">
                Read this verbatim when you call your insurer. It tells you exactly what to say — and what not to.
              </p>
            </div>

            {!script && !isGenerating && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5" aria-hidden="true">
                  <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h2 className="font-bold text-slate-900 text-lg mb-2">Ready to write your call script</h2>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                  We&apos;ll generate a calm, word-for-word script for calling your insurer — tailored to your {disasterType?.toLowerCase()} situation.
                </p>
                <button
                  onClick={generateScript}
                  className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-blue-800 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[52px]"
                >
                  Generate my call script
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center" role="status" aria-live="polite">
                <div className="relative w-16 h-16 mx-auto mb-5" aria-hidden="true">
                  <svg className="animate-spin absolute inset-0 w-16 h-16 text-blue-200" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  <svg className="animate-spin absolute inset-0 w-16 h-16 text-blue-700" fill="none" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-700 text-lg">Writing your call script…</p>
                <p className="text-sm text-slate-400 mt-2">Tailoring it to your {disasterType?.toLowerCase()} situation. ~15 seconds.</p>
              </div>
            )}

            {scriptError && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex gap-2 items-start mb-4">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p>{scriptError}</p>
                  <button
                    onClick={generateScript}
                    className="mt-1 text-red-600 hover:text-red-800 font-semibold underline text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 rounded"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {script && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">Insurance Call Script</span>
                    <button
                      onClick={copyScript}
                      aria-label={copied ? 'Script copied to clipboard' : 'Copy script to clipboard'}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                        copied
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700'
                      }`}
                    >
                      {copied ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-6 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
                    {script}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/emergency/photos"
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-center min-h-[72px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Document your damage →
                  </Link>
                  <Link
                    href="/upload"
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800 transition-all duration-200 shadow-sm text-center min-h-[72px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Upload a denial letter →
                  </Link>
                </div>

                <p className="text-center text-xs text-slate-400 pb-4">
                  AppealKit does not provide legal advice. This script is a general guide — your situation may vary.
                </p>
              </div>
            )}

            {!script && !isGenerating && (
              <button
                onClick={() => setStep('C')}
                className="mt-4 w-full py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:border-slate-300 transition-all duration-200 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Back
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
