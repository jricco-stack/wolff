import Link from 'next/link';
import { SiteFooter } from './components/SiteFooter';

const stats = [
  { value: '60', label: 'Days to Appeal' },
  { value: '100%', label: 'Free to Use' },
  { value: '5min', label: 'Minutes to Start' },
  { value: '44 CFR', label: 'Your Legal Right' },
];

const steps = [
  {
    num: '1', bg: 'bg-blue-50', border: 'border-blue-200', numBg: 'bg-blue-600', iconColor: 'text-blue-600',
    title: 'Upload your denial letter',
    desc: 'Take a photo or upload the PDF that FEMA mailed or emailed you. We accept PDF, JPG, PNG, and WebP formats.',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    num: '2', bg: 'bg-amber-50', border: 'border-amber-200', numBg: 'bg-amber-500', iconColor: 'text-amber-600',
    title: 'Understand your denial',
    desc: 'We explain exactly why FEMA denied you in plain English, show your 60-day deadline, and list every document you need.',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    num: '3', bg: 'bg-emerald-50', border: 'border-emerald-200', numBg: 'bg-emerald-600', iconColor: 'text-emerald-600',
    title: 'Get your appeal letter',
    desc: 'We generate a complete, professional appeal letter citing your legal rights. Edit it, download it, and mail it today.',
    iconPath: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
];

const trustFeatures = [
  { bg: 'bg-blue-50', iconColor: 'text-blue-600', title: 'Your Data is Private', desc: 'All documents are encrypted and never shared with third parties.', iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { bg: 'bg-emerald-50', iconColor: 'text-emerald-600', title: 'No Account Required', desc: 'Start your appeal immediately — no sign-up, no personal info needed.', iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { bg: 'bg-amber-50', iconColor: 'text-amber-600', title: 'Instant Results', desc: 'Get your denial explained and appeal letter generated in under 5 minutes.', iconPath: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { bg: 'bg-purple-50', iconColor: 'text-purple-600', title: 'Legally Sound', desc: 'Appeal letters cite 44 CFR § 206.115 and relevant FEMA regulations.', iconPath: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
];

const deadlineItems = [
  { label: 'Hurricane Ian Denial', days: 27, color: 'bg-emerald-500' },
  { label: 'Flood Damage Letter', days: 1, color: 'bg-red-500' },
  { label: 'Tornado Appeal', days: 0, color: 'bg-slate-400' },
];

export default function HomePage() {
  return (
    <main id="main-content" className="flex flex-col">

      {/* HERO */}
      <section className="relative pt-20 pb-20 overflow-hidden text-white">
        {/* Background image + overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1640301630386-a51ca448589a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F]/95 via-[#1E3A5F]/90 to-[#0F172A]/95" aria-hidden="true" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-700/60 border border-blue-400/30 text-blue-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            FREE · SECURE · TAKES 5 MINUTES
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            Fight your{' '}
            <span className="text-[#93C5FD]">FEMA</span>{' '}
            denial
          </h1>
          <p className="text-blue-200 text-lg sm:text-xl mb-8 leading-relaxed max-w-xl mx-auto">
            Upload your denial letter and we&apos;ll explain what it means, show your deadline, and write your appeal letter — instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link href="/upload" className="inline-flex items-center justify-center gap-2 bg-white text-[#1E3A5F] font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl hover:bg-blue-50 transition-all duration-200 hover:shadow-2xl active:scale-[0.98] w-full sm:w-auto">
              Start Your Appeal
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="/emergency" className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold text-base px-6 py-4 rounded-2xl hover:bg-white/10 transition-all duration-200 w-full sm:w-auto">
              Disaster just happened?
            </Link>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-sm text-blue-300">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            No account required · Your data is private
          </p>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {stats.map(({ value, label }) => (
              <div key={label} className="bg-white/5 backdrop-blur-sm px-6 py-5 text-center">
                <dd className="text-2xl font-extrabold text-white mb-1">{value}</dd>
                <dt className="text-xs text-blue-300 tracking-wide">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" aria-labelledby="how-it-works-heading" className="bg-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 bg-blue-50 px-3 py-1 rounded-full">Simple Process</span>
            <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">How it works</h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto">Three simple steps to submit your appeal today</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {steps.map(({ num, bg, border, numBg, iconColor, title, desc, iconPath }) => (
              <div key={num} className={`bg-white border ${border} rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} mb-5`}>
                  <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} /></svg>
                </div>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${numBg} text-white text-xs font-bold mb-4`}>{num}</span>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUILT FOR TRUST */}
      <section aria-labelledby="trust-heading" className="bg-slate-50 py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 bg-blue-50 px-3 py-1 rounded-full">Why ClaimBack</span>
            <h2 id="trust-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Built for trust &amp; simplicity</h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto">We designed ClaimBack to be the easiest, safest way to fight your FEMA denial</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map(({ bg, iconColor, title, desc, iconPath }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} mb-4`}>
                  <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} /></svg>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 60-DAY DEADLINE */}
      <section aria-labelledby="deadline-heading" className="bg-white py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-widest mb-5 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Important Deadline Warning
              </div>
              <h2 id="deadline-heading" className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                Don&apos;t miss your <span className="text-red-600">60-day deadline</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                You have <strong>60 days</strong> from the date on your FEMA letter to submit an appeal. After that, you may <strong>permanently lose your right to appeal</strong>.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start mb-8">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">Every day counts</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">Upload your letter now and we&apos;ll calculate your exact deadline, track it for you, and send reminders as it approaches.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/upload" className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
                  Upload My FEMA Letter
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <Link href="/tracker" className="inline-flex items-center justify-center border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-semibold px-6 py-3.5 rounded-2xl transition-all">
                  View My Documents
                </Link>
              </div>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Deadline Tracking</p>
                  <p className="text-slate-500 text-xs">Never miss your window</p>
                </div>
              </div>
              <div className="space-y-3">
                {deadlineItems.map(({ label, days, color }) => (
                  <div key={label} className="bg-white rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 truncate">{label}</span>
                      <span className={`ml-2 flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full text-white ${color}`}>
                        {days === 0 ? 'Expired' : `${days}d left`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(2, (days / 60) * 100))}%` }} aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY CTA */}
      <section aria-labelledby="community-heading" className="relative py-20 md:py-28 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1920&q=80')" }} aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F]/95 to-[#0F172A]/95" aria-hidden="true" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-200 uppercase tracking-widest mb-5 bg-blue-900/50 border border-blue-700/40 px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            You&apos;re Not Alone
          </div>
          <h2 id="community-heading" className="text-3xl md:text-4xl font-extrabold mb-5 leading-tight">
            Thousands of survivors have successfully appealed their FEMA denials
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Every year, FEMA denies thousands of legitimate claims. You have the legal right to appeal — and ClaimBack makes it easy. Don&apos;t give up on the assistance you deserve.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/upload" className="inline-flex items-center justify-center gap-2 bg-white text-[#1E3A5F] font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl hover:bg-blue-50 transition-all duration-200 hover:shadow-2xl active:scale-[0.98] w-full sm:w-auto">
              Start Your Appeal Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="/emergency" className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold text-base px-6 py-4 rounded-2xl hover:bg-white/10 transition-all duration-200 w-full sm:w-auto">
              Emergency Resources
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
