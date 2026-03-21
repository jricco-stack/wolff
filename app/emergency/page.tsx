'use client';

import { useState } from 'react';
import Link from 'next/link';

type DisasterType = 'Hurricane' | 'Flood' | 'Fire' | 'Tornado' | 'Other';
type Step = 'A' | 'B' | 'C' | 'D';

const EMERGENCY_STEPS = ['Disaster', 'Insurance', 'Actions', 'Call script'];

const DISASTERS: { type: DisasterType; label: string; iconPath: string }[] = [
  { type: 'Hurricane', label: 'Hurricane', iconPath: 'M12 3v1m0 16v1M4.22 4.22l.707.707M18.364 18.364l.708.708M1 12h2m18 0h2M4.929 18.364l.707-.707M18.364 5.636l.708-.708M12 8a4 4 0 100 8 4 4 0 000-8z' },
  { type: 'Flood', label: 'Flood', iconPath: 'M3 18c0 0 2-2 4-2s4 2 4 2 2-2 4-2 4 2 4 2M3 13c0 0 2-2 4-2s4 2 4 2 2-2 4-2 4 2 4 2M6 8l6-5 6 5' },
  { type: 'Fire', label: 'Fire', iconPath: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
  { type: 'Tornado', label: 'Tornado', iconPath: 'M3 6h18M5 10h14M7 14h10M9 18h6' },
  { type: 'Other', label: 'Other', iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
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
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700 flex-1 pr-4">{label}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(true)}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            value === true
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            value === false
              ? 'bg-slate-700 text-white border-slate-700'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

function stepToNum(step: Step): number {
  return { A: 1, B: 2, C: 3, D: 4 }[step];
}

const EMERGENCY_CONTACTS = [
  { label: 'FEMA Helpline', value: '1-800-621-3362', href: 'tel:18006213362', urgent: true },
  { label: '911 Emergency', value: '911', href: 'tel:911', urgent: true },
  { label: 'Red Cross', value: '1-800-733-2767', href: 'tel:18007332767', urgent: false },
  { label: 'Crisis Hotline', value: '988', href: 'tel:988', urgent: false },
];

const RESOURCES = [
  { label: 'DisasterAssistance.gov', href: 'https://www.disasterassistance.gov' },
  { label: 'FEMA.gov', href: 'https://www.fema.gov' },
  { label: 'Ready.gov', href: 'https://www.ready.gov' },
  { label: 'SBA Disaster Loans', href: 'https://www.sba.gov/funding-programs/disaster-assistance' },
];

export default function EmergencyPage() {
  const [disaster, setDisaster] = useState<DisasterType | null>(null);
  const [step, setStep] = useState<Step>('A');
  const [hasHomeInsurance, setHasHomeInsurance] = useState<boolean | null>(null);
  const [hasFloodInsurance, setHasFloodInsurance] = useState<boolean | null>(null);
  const [hasRentersInsurance, setHasRentersInsurance] = useState<boolean | null>(null);
  const [hasMortgage, setHasMortgage] = useState<boolean | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const canProceedA = disaster !== null;
  const canProceedB =
    hasHomeInsurance !== null &&
    hasFloodInsurance !== null &&
    hasRentersInsurance !== null &&
    hasMortgage !== null;

  const checklist = disaster
    ? getChecklistItems(disaster, hasHomeInsurance ?? false, hasFloodInsurance ?? false)
    : [];

  const toggleCheck = (i: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(i)) { next.delete(i); } else { next.add(i); }
      return next;
    });
  };

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 pt-16">
      {/* Red hero banner */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-500/40 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Disaster just happened?</h1>
              <p className="text-red-100 text-base max-w-xl">
                Follow these steps carefully to protect your right to FEMA assistance and any insurance claims.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main wizard */}
          <div className="lg:col-span-2">
            {/* Static numbered guide cards */}
            <div className="mb-8">
              <h2 className="text-base font-bold text-slate-900 mb-4">What to do right now — step by step</h2>
              <div className="space-y-3">
                {([
                  { num: 1, title: 'Ensure your safety first', desc: 'Get everyone to safety. Do not re-enter a damaged structure until cleared by authorities.', color: 'bg-red-50 border-red-200', numBg: 'bg-red-600' },
                  { num: 2, title: 'Register with FEMA', desc: 'Apply at DisasterAssistance.gov or call 1-800-621-3362 as soon as the disaster area is declared.', color: 'bg-orange-50 border-orange-200', numBg: 'bg-orange-500' },
                  { num: 3, title: 'Document everything', desc: 'Take photos and videos of all damage before cleanup. This is critical evidence for your claims.', color: 'bg-amber-50 border-amber-200', numBg: 'bg-amber-500' },
                  { num: 4, title: 'Contact your insurance', desc: 'File your insurance claim within 24–48 hours. Ask for a claim number and adjuster contact.', color: 'bg-blue-50 border-blue-200', numBg: 'bg-blue-600' },
                  { num: 5, title: "Wait for FEMA’s response", desc: "FEMA will send a decision letter. Keep a record of your application number and all communications.", color: 'bg-slate-50 border-slate-200', numBg: 'bg-slate-600' },
                  { num: 6, title: 'If denied, appeal with ClaimBack', desc: "You have 60 days to appeal a denial. Upload your letter below and we'll write your appeal instantly.", color: 'bg-emerald-50 border-emerald-200', numBg: 'bg-emerald-600' },
                ] as { num: number; title: string; desc: string; color: string; numBg: string }[]).map(({ num, title, desc, color, numBg }) => (
                  <div key={num} className={`flex items-start gap-4 p-4 rounded-xl border ${color}`}>
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full ${numBg} text-white text-xs font-extrabold flex items-center justify-center mt-0.5`}>
                      {num}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-0.5">{title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-200 mb-6" />
            <h2 className="text-base font-bold text-slate-900 mb-4">Your personalized action plan</h2>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {EMERGENCY_STEPS.map((s, i) => {
                const current = stepToNum(step);
                const isActive = current === i + 1;
                const isDone = current > i + 1;
                return (
                  <div key={s} className="flex items-center gap-2 flex-shrink-0">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isDone ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                      {s}
                    </div>
                    {i < 3 && <div className="w-4 h-px bg-slate-200 flex-shrink-0" aria-hidden="true" />}
                  </div>
                );
              })}
            </div>

            {/* Step A: Disaster type */}
            {step === 'A' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">What type of disaster occurred?</h2>
                <p className="text-sm text-slate-500 mb-5">Select the disaster type so we can give you the most relevant guidance.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {DISASTERS.map(({ type, label, iconPath }) => (
                    <button
                      key={type}
                      onClick={() => setDisaster(type)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        disaster === type
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-blue-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
                      </svg>
                      <span className="text-sm font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => canProceedA && setStep('B')}
                  disabled={!canProceedA}
                  className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Continue to Insurance →
                </button>
              </div>
            )}

            {/* Step B: Insurance */}
            {step === 'B' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <button
                  onClick={() => setStep('A')}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Tell us about your insurance</h2>
                <p className="text-sm text-slate-500 mb-5">This helps us give you the right action steps for your situation.</p>
                <div className="bg-slate-50 rounded-xl p-1 mb-6">
                  <YesNoToggle label="Do you have homeowner's or renter's insurance?" value={hasHomeInsurance} onChange={setHasHomeInsurance} />
                  <YesNoToggle label="Do you have a separate flood insurance policy?" value={hasFloodInsurance} onChange={setHasFloodInsurance} />
                  <YesNoToggle label="Do you have renter's insurance?" value={hasRentersInsurance} onChange={setHasRentersInsurance} />
                  <YesNoToggle label="Do you have a mortgage on this property?" value={hasMortgage} onChange={setHasMortgage} />
                </div>
                <button
                  onClick={() => canProceedB && setStep('C')}
                  disabled={!canProceedB}
                  className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  See My Action Steps →
                </button>
              </div>
            )}

            {/* Step C: Checklist */}
            {step === 'C' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <button
                  onClick={() => setStep('B')}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Your immediate action steps</h2>
                <p className="text-sm text-slate-500 mb-5">
                  Check off each item as you complete it. These steps are critical for protecting your claims.
                </p>
                <div className="space-y-2 mb-6" role="list" aria-label="Action checklist">
                  {checklist.map((item, i) => (
                    <div
                      key={i}
                      role="listitem"
                      onClick={() => toggleCheck(i)}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        checkedItems.has(i) ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                        checkedItems.has(i) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                      }`}>
                        {checkedItems.has(i) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm leading-snug ${checkedItems.has(i) ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{checkedItems.size} of {checklist.length} completed</span>
                  <button
                    onClick={() => setStep('D')}
                    className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Get Call Script →
                  </button>
                </div>
              </div>
            )}

            {/* Step D: Call script */}
            {step === 'D' && disaster && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <button
                  onClick={() => setStep('C')}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Your insurance call script</h2>
                </div>
                <p className="text-sm text-slate-500 mb-5">Use this script when calling your insurance company to open a claim.</p>

                <div className="bg-slate-50 rounded-xl p-5 font-mono text-sm text-slate-700 leading-relaxed border border-slate-200">
                  <p className="mb-3">&ldquo;Hello, my name is [Your Name] and I am calling to report a claim.</p>
                  <p className="mb-3">I experienced a {disaster.toLowerCase()} disaster that damaged my property at [Your Address].</p>
                  {hasHomeInsurance && <p className="mb-3">I have a homeowner&apos;s insurance policy with your company. My policy number is [Policy Number].</p>}
                  {hasFloodInsurance && <p className="mb-3">I also have a separate flood insurance policy that I would like to report a claim on.</p>}
                  {hasMortgage && <p className="mb-3">I have a mortgage on this property with [Mortgage Lender]. I understand you may need to contact them regarding the claim payment.</p>}
                  <p className="mb-3">I am calling to open a claim and would like to schedule an adjuster to assess the damage as soon as possible.</p>
                  <p>Can you please give me my claim number and the name and contact information of the adjuster assigned to my case?&rdquo;</p>
                </div>

                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  <strong>Tip:</strong> Write down the claim number, adjuster name, and call date. You&apos;ll need these for your FEMA application.
                </div>
              </div>
            )}

            {/* Already received denial CTA */}
            <div className="mt-6 bg-[#EFF6FF] border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">Already received a denial letter?</h3>
                <p className="text-sm text-blue-700">Upload your FEMA denial letter and we&apos;ll generate a professional appeal letter for you instantly.</p>
              </div>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-sm flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Upload Letter
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Emergency Contacts */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Emergency Contacts
              </h2>
              <div className="space-y-2">
                {EMERGENCY_CONTACTS.map(({ label, value, href, urgent }) => (
                  <a
                    key={label}
                    href={href}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${
                      urgent ? 'bg-red-50 hover:bg-red-100 border border-red-100' : 'bg-slate-50 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    <span className={`text-xs font-medium ${urgent ? 'text-red-700' : 'text-slate-600'}`}>{label}</span>
                    <span className={`text-sm font-bold ${urgent ? 'text-red-700' : 'text-slate-800'}`}>{value}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Helpful Resources */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-900 text-sm mb-4">Helpful Resources</h2>
              <ul className="space-y-2.5">
                {RESOURCES.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors"
                    >
                      {label}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Local Legal Aid */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h2 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Local Legal Aid
              </h2>
              <p className="text-xs text-amber-800 leading-relaxed">
                Free legal aid is available in most disaster areas. Search for your local{' '}
                <a href="https://www.lawhelp.org" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-amber-900">
                  Legal Aid organization
                </a>{' '}
                for free representation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
