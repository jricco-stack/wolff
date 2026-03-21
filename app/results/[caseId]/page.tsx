import { supabaseAdmin } from '@/lib/supabase';
import { getDenialCode } from '@/lib/denial-codes';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '../../components/AppHeader';
import { StepIndicator } from '../../components/StepIndicator';

const STEPS = ['Upload letter', 'Review denial', 'Get letter'];

function getDaysRemaining(decisionDate: string): number {
  const decision = new Date(decisionDate);
  const deadline = new Date(decision);
  deadline.setDate(deadline.getDate() + 60);
  const now = new Date();
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDeadlineDate(decisionDate: string): string {
  const decision = new Date(decisionDate);
  const deadline = new Date(decision);
  deadline.setDate(deadline.getDate() + 60);
  return deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function ResultsPage({ params }: { params: { caseId: string } }) {
  const { data: caseData, error } = await supabaseAdmin
    .from('cases')
    .select('*')
    .eq('id', params.caseId)
    .single();

  if (error || !caseData) return notFound();

  const denialCode = getDenialCode(caseData.denial_code);
  if (!denialCode) return notFound();

  const daysRemaining = getDaysRemaining(caseData.decision_date);
  const deadlineDate = getDeadlineDate(caseData.decision_date);
  const isUrgent = daysRemaining <= 14;
  const isPastDeadline = daysRemaining < 0;

  return (
    <main id="main-content" className="min-h-screen bg-slate-50">
      <AppHeader subtitle="FEMA Appeal Assistant" />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <StepIndicator steps={STEPS} current={2} />

        {/* Deadline banner */}
        {isPastDeadline ? (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center" aria-hidden="true">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-red-800">Standard 60-day deadline has passed</p>
              <p className="text-red-700 text-sm mt-1">
                You may still be able to appeal late — call FEMA at{' '}
                <a href="tel:18006213362" className="font-bold underline">1-800-621-3362</a>{' '}
                immediately to explain your situation.
              </p>
            </div>
          </div>
        ) : (
          <div
            role="status"
            aria-label={`${daysRemaining} days remaining to appeal`}
            className={`rounded-2xl p-5 flex gap-4 items-center ${isUrgent ? 'bg-red-600 text-white shadow-md' : 'bg-amber-50 border border-amber-200'}`}
          >
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold ${isUrgent ? 'bg-red-500' : 'bg-amber-100'}`}
              aria-hidden="true"
            >
              <time dateTime={`P${daysRemaining}D`} className={`text-2xl leading-none ${isUrgent ? 'text-white' : 'text-amber-800'}`}>
                {daysRemaining}
              </time>
              <span className={`text-xs ${isUrgent ? 'text-red-200' : 'text-amber-600'}`}>days</span>
            </div>
            <div>
              <p className={`font-bold text-lg leading-tight ${isUrgent ? 'text-white' : 'text-amber-900'}`}>
                {isUrgent ? 'Act now — appeal deadline approaching' : 'Days left to appeal'}
              </p>
              <p className={`text-sm mt-0.5 ${isUrgent ? 'text-red-100' : 'text-amber-700'}`}>
                Deadline: {deadlineDate}
              </p>
            </div>
          </div>
        )}

        {/* Case info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Your case
          </h2>
          <dl className="space-y-3">
            {[
              { label: 'Applicant', value: caseData.applicant_name },
              { label: 'Application #', value: caseData.application_number },
              { label: 'Disaster #', value: caseData.disaster_number },
              { label: 'Decision date', value: caseData.decision_date },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                <dt className="text-slate-500 text-sm">{label}</dt>
                <dd className="font-semibold text-slate-900 text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Why denied */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center" aria-hidden="true">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Why you were denied</p>
              <h2 className="font-bold text-slate-900 text-xl">{denialCode.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Code: {denialCode.code}</p>
            </div>
          </div>
          <p className="text-slate-700 leading-relaxed">{denialCode.plain_english_explanation}</p>
        </div>

        {/* Appeal strategy */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4 items-start">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center" aria-hidden="true">
            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Your path to appeal</h3>
            <p className="text-blue-800 text-sm leading-relaxed">{denialCode.appeal_strategy}</p>
          </div>
        </div>

        {/* Document checklist */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Documents to gather
          </h3>
          <p className="text-slate-400 text-xs mb-4">Gather each item before submitting your appeal</p>
          <ul className="space-y-3" role="list">
            {denialCode.required_documents.map((doc: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 flex-shrink-0 border-2 border-slate-300 rounded" aria-hidden="true" />
                <span className="text-slate-700 text-sm leading-snug">{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Success tips */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
          <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tips from successful appeals
          </h3>
          <ul className="space-y-2.5" role="list">
            {denialCode.success_tips.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-emerald-800">
                <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="leading-snug">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Link
          href={`/letter/${params.caseId}`}
          className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-blue-800 transition-all duration-200 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Generate my appeal letter
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <p className="text-center text-xs text-slate-400 pb-4">
          ClaimBack is a free tool to help you understand your rights. It does not provide legal advice.
          For legal help, contact your local legal aid organization.
        </p>
      </div>
    </main>
  );
}
