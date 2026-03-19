import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { AppHeader } from '../../components/AppHeader';

export const dynamic = 'force-dynamic';

const REQUIRED_DOCS = [
  'Copy of the denial letter',
  'Proof of policy (declarations page)',
  'Photos of the damage',
  'Contractor estimate or repair quote',
  'Receipts for any emergency repairs',
  'Correspondence with your adjuster',
];

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function InsuranceResultsPage({ params }: { params: { caseId: string } }) {
  const { data: caseData, error } = await supabaseAdmin
    .from('cases')
    .select('*')
    .eq('id', params.caseId)
    .single();

  if (error || !caseData) notFound();

  const daysLeft = daysUntil(caseData.deadline_date);
  const isUrgent = daysLeft !== null && daysLeft <= 7;
  const isPast = daysLeft !== null && daysLeft < 0;

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader backHref="/documents" backLabel="Upload another" subtitle="Insurance Denial Review" />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Insurance denial analysis</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review the details we extracted and follow the steps below.
          </p>
        </div>

        {/* Deadline banner */}
        {daysLeft !== null && (
          <div
            role={isUrgent || isPast ? 'alert' : 'status'}
            className={`rounded-2xl px-5 py-4 flex items-center gap-4 ${
              isPast
                ? 'bg-red-600 text-white'
                : isUrgent
                ? 'bg-amber-500 text-white'
                : 'bg-blue-700 text-white'
            }`}
          >
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              {isPast ? (
                <p className="font-bold">Appeal deadline may have passed</p>
              ) : (
                <>
                  <p className="font-bold">
                    <time dateTime={caseData.deadline_date}>{Math.abs(daysLeft)} day{Math.abs(daysLeft) !== 1 ? 's' : ''}</time> to appeal
                  </p>
                  <p className="text-sm opacity-90">Deadline: {caseData.deadline_date}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Case summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
          <h2 className="font-bold text-slate-900">Claim summary</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {[
              { label: 'Insurer', value: caseData.insurer_name || '—' },
              { label: 'Claim number', value: caseData.claim_number || '—' },
              { label: 'Policy number', value: caseData.application_number !== 'N/A' ? caseData.application_number : '—' },
              { label: 'Denial date', value: caseData.decision_date || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-slate-400 text-xs uppercase tracking-wide">{label}</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Denial reason */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <h2 className="font-bold text-red-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Why your claim was denied
          </h2>
          <p className="text-sm text-red-800 leading-relaxed">
            {caseData.denial_code || 'Reason not specified — see your denial letter for details.'}
          </p>
        </div>

        {/* Required documents checklist */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-bold text-slate-900 mb-3">Gather these documents for your appeal</h2>
          <ul className="space-y-2">
            {REQUIRED_DOCS.map((doc) => (
              <li key={doc} className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0" aria-hidden="true" />
                {doc}
              </li>
            ))}
          </ul>
        </div>

        {/* Action steps */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h2 className="font-bold text-blue-900 mb-3">Next steps</h2>
          <ol className="space-y-2.5">
            {[
              'Review the denial letter carefully for specific policy exclusions cited',
              'Gather all documents from the checklist above',
              'Generate your appeal letter below — we\'ll tailor it to your denial reason',
              'Sign, date, and send via certified mail — keep your tracking number',
              'Follow up with your insurer in writing within 5 business days',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-blue-800">
                <span
                  className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs flex items-center justify-center font-bold mt-0.5"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <Link
          href={`/letter/${params.caseId}?type=insurance`}
          className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-base shadow-md hover:bg-blue-800 transition-all duration-200 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[52px]"
        >
          Write my appeal letter
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <p className="text-center text-xs text-slate-400 pb-4">
          AppealKit does not provide legal advice. For complex claims, consult a public adjuster or attorney.
        </p>
      </div>
    </main>
  );
}
