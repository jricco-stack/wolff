import { supabaseAdmin } from '@/lib/supabase';
import { getDenialCode } from '@/lib/denial-codes';
import { notFound } from 'next/navigation';
import Link from 'next/link';

function getDaysRemaining(decisionDate: string): number {
  const decision = new Date(decisionDate);
  const deadline = new Date(decision);
  deadline.setDate(deadline.getDate() + 60);
  const now = new Date();
  const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
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
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold">AppealKit</h1>
          <p className="text-blue-200 text-sm">FEMA Appeal Assistant</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Deadline banner */}
        {!isPastDeadline ? (
          <div className={`rounded-xl p-5 ${isUrgent ? 'bg-red-600 text-white' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{isUrgent ? '⏰' : '📅'}</span>
              <div>
                <p className={`font-bold text-lg ${isUrgent ? 'text-white' : 'text-amber-900'}`}>
                  {isUrgent ? `URGENT: ${daysRemaining} days left to appeal` : `${daysRemaining} days left to appeal`}
                </p>
                <p className={`text-sm ${isUrgent ? 'text-red-100' : 'text-amber-700'}`}>
                  Deadline: {deadlineDate}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-300 rounded-xl p-5">
            <p className="font-bold text-red-800">⚠️ The standard 60-day appeal deadline has passed</p>
            <p className="text-red-700 text-sm mt-1">
              You may still be able to appeal — contact FEMA at 1-800-621-3362 immediately to explain your situation.
            </p>
          </div>
        )}

        {/* Case info */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-3">Your case</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Applicant</span>
              <span className="font-medium text-gray-900">{caseData.applicant_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Application #</span>
              <span className="font-medium text-gray-900">{caseData.application_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Disaster #</span>
              <span className="font-medium text-gray-900">{caseData.disaster_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Decision date</span>
              <span className="font-medium text-gray-900">{caseData.decision_date}</span>
            </div>
          </div>
        </div>

        {/* What this means */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Why you were denied</p>
              <h3 className="font-bold text-gray-900 text-lg">{denialCode.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Code: {denialCode.code}</p>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">{denialCode.plain_english_explanation}</p>
        </div>

        {/* Appeal strategy */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h3 className="font-bold text-blue-900 mb-2">💡 Your path to appeal</h3>
          <p className="text-blue-800 text-sm leading-relaxed">{denialCode.appeal_strategy}</p>
        </div>

        {/* Document checklist */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Documents to gather</h3>
          <ul className="space-y-3">
            {denialCode.required_documents.map((doc, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 flex-shrink-0 border-2 border-gray-300 rounded" />
                <span className="text-gray-700 text-sm">{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Success tips */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-5">
          <h3 className="font-bold text-green-900 mb-3">✅ Tips from successful appeals</h3>
          <ul className="space-y-2">
            {denialCode.success_tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                <span className="text-green-500 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Link
          href={`/letter/${params.caseId}`}
          className="block w-full bg-blue-700 text-white py-4 rounded-xl font-bold text-lg text-center hover:bg-blue-800 transition"
        >
          Generate my appeal letter →
        </Link>

        <p className="text-center text-xs text-gray-400 pb-6">
          AppealKit is a free tool to help you understand your rights. It does not provide legal advice.
          For legal help, contact your local legal aid organization.
        </p>
      </div>
    </main>
  );
}
