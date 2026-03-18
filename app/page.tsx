import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-950 to-blue-800 text-white px-4 pt-16 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-700/50 border border-blue-500/30 text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            Free · Takes 5 minutes
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
            Fight your FEMA denial
          </h1>
          <p className="text-blue-200 text-lg sm:text-xl mb-8 leading-relaxed max-w-lg mx-auto">
            Upload your denial letter and we&apos;ll explain what it means, show your deadline, and write your appeal letter — instantly.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-white text-blue-900 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-xl hover:bg-blue-50 transition-all hover:scale-105 active:scale-95"
          >
            Start your appeal
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-blue-400 text-sm mt-5">No account required · Your data is private</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-blue-900 text-blue-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-center">
          <div><span className="font-bold text-white text-base">60 days</span><br/>to appeal a denial</div>
          <div className="hidden sm:block w-px bg-blue-700" />
          <div><span className="font-bold text-white text-base">Free</span><br/>no cost to appeal</div>
          <div className="hidden sm:block w-px bg-blue-700" />
          <div><span className="font-bold text-white text-base">44 CFR 206.115</span><br/>your legal right to appeal</div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-2xl mx-auto px-4 py-14 w-full">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">How it works</h2>
        <div className="grid gap-4">
          {[
            {
              step: '1',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              title: 'Upload your denial letter',
              desc: 'Take a photo or upload the PDF that FEMA mailed or emailed you. We accept all common formats.',
              color: 'bg-blue-100 text-blue-700',
            },
            {
              step: '2',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              ),
              title: 'Understand your denial',
              desc: 'We explain exactly why FEMA denied you in plain English, show your 60-day deadline, and list every document you need.',
              color: 'bg-amber-100 text-amber-700',
            },
            {
              step: '3',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              title: 'Get your appeal letter',
              desc: 'We generate a complete, professional appeal letter citing your legal rights. Edit it, download it, and mail it today.',
              color: 'bg-emerald-100 text-emerald-700',
            },
          ].map(({ step, icon, title, desc, color }) => (
            <div key={step} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex gap-4 items-start">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {step}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deadline callout */}
      <div className="max-w-2xl mx-auto px-4 pb-8 w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-amber-900 mb-1">Don&apos;t miss your deadline</h3>
            <p className="text-amber-800 text-sm leading-relaxed">
              You have <strong>60 days</strong> from the date on your FEMA letter to submit an appeal. After that, you may permanently lose your right to appeal.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-4 pb-14 w-full">
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-blue-800 transition-all hover:shadow-lg"
        >
          Upload my FEMA letter
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      <footer className="border-t border-slate-100 py-6 px-4 mt-auto">
        <p className="text-center text-xs text-slate-400 max-w-lg mx-auto">
          AppealKit is a free tool to help disaster survivors understand their rights. It does not provide legal advice.
          For legal assistance, contact your local legal aid organization or call 1-800-621-3362 (FEMA helpline).
        </p>
      </footer>
    </main>
  );
}
