import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { AppHeader } from '../../components/AppHeader';
import type { AdjusterLineItem } from '@/lib/claude';

export const dynamic = 'force-dynamic';

function formatCurrency(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

interface AdjusterPayload {
  line_items: AdjusterLineItem[];
  depreciation_total: number;
  acv_total: number;
  rcv_total: number;
}

export default async function AdjusterReviewPage({ params }: { params: { caseId: string } }) {
  const { data: caseData, error } = await supabaseAdmin
    .from('cases')
    .select('*')
    .eq('id', params.caseId)
    .single();

  if (error || !caseData) notFound();

  let payload: AdjusterPayload | null = null;
  try {
    if (caseData.appeal_letter) {
      payload = JSON.parse(caseData.appeal_letter) as AdjusterPayload;
    }
  } catch {
    // appeal_letter not JSON — could be a real letter if somehow overwritten
  }

  const lineItems: AdjusterLineItem[] = payload?.line_items ?? [];
  const depTotal = payload?.depreciation_total ?? 0;
  const acvTotal = payload?.acv_total ?? 0;
  const rcvTotal = payload?.rcv_total ?? 0;
  const totalEstimate = caseData.adjuster_estimate ?? rcvTotal;
  const isFlagged = caseData.is_estimate_flagged === true;

  const depPct =
    rcvTotal > 0 ? Math.round((depTotal / rcvTotal) * 100) : 0;

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader backHref="/documents" backLabel="Upload another" subtitle="Adjuster Estimate Review" />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Adjuster estimate analysis</h1>
          <p className="text-slate-500 text-sm mt-1">
            We&apos;ve broken down the estimate. Review for underpayment before accepting.
          </p>
        </div>

        {/* Flagged warning */}
        {isFlagged && (
          <div role="alert" className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 flex gap-4 items-start">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold text-amber-900">High depreciation — possible underpayment</p>
              <p className="text-sm text-amber-800 mt-1">
                Depreciation is <strong>{depPct}%</strong> of the total estimate. When depreciation exceeds 30%, it often signals the payout is below what repairs will actually cost. Consider requesting a re-inspection or hiring a public adjuster.
              </p>
            </div>
          </div>
        )}

        {/* Totals summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-bold text-slate-900 mb-4">Estimate summary</h2>
          <dl className="space-y-3">
            {[
              { label: 'Replacement Cost Value (RCV)', value: rcvTotal || totalEstimate, highlight: false },
              { label: 'Total Depreciation', value: depTotal, negative: true },
              { label: 'Actual Cash Value (ACV) — what you get paid', value: acvTotal, highlight: true },
            ].map(({ label, value, highlight, negative }) => (
              <div
                key={label}
                className={`flex justify-between items-center text-sm ${highlight ? 'pt-3 border-t border-slate-200' : ''}`}
              >
                <dt className={highlight ? 'font-bold text-slate-900' : 'text-slate-600'}>{label}</dt>
                <dd className={`font-bold tabular-nums ${highlight ? 'text-lg text-blue-700' : negative ? 'text-red-600' : 'text-slate-800'}`}>
                  {negative && value > 0 ? `− ${formatCurrency(value)}` : formatCurrency(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ACV vs RCV explainer */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <h2 className="font-bold text-slate-800 mb-2 text-sm">ACV vs. RCV — what does this mean?</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>RCV (Replacement Cost Value)</strong> is what it costs to replace damaged items with new ones.{' '}
            <strong>ACV (Actual Cash Value)</strong> is RCV minus depreciation — it accounts for age and wear. Many policies initially pay ACV, then release the depreciation holdback once repairs are complete. Check your policy for &ldquo;recoverable depreciation.&rdquo;
          </p>
        </div>

        {/* Insurer / claim info */}
        {(caseData.insurer_name || caseData.claim_number) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="font-bold text-slate-900 mb-3">Claim details</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {caseData.insurer_name && (
                <div>
                  <dt className="text-slate-400 text-xs uppercase tracking-wide">Insurer</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{caseData.insurer_name}</dd>
                </div>
              )}
              {caseData.claim_number && (
                <div>
                  <dt className="text-slate-400 text-xs uppercase tracking-wide">Claim number</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{caseData.claim_number}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Line items table */}
        {lineItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Line items ({lineItems.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Adjuster line items">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">Description</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">RCV</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Depr.</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-800">{item.description}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-red-600">{item.depreciation > 0 ? `− ${formatCurrency(item.depreciation)}` : '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-900">{formatCurrency(item.net)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                  <tr>
                    <th scope="row" className="px-4 py-3 text-left font-bold text-slate-900 text-sm">Total</th>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{formatCurrency(rcvTotal || totalEstimate)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-red-700">{depTotal > 0 ? `− ${formatCurrency(depTotal)}` : '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-blue-700">{formatCurrency(acvTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Action steps */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h2 className="font-bold text-blue-900 mb-3">What you can do</h2>
          <ol className="space-y-2.5">
            {[
              'Get 2–3 independent contractor estimates and compare to the adjuster\'s figures',
              'Request a re-inspection if you believe items are missing or undervalued',
              isFlagged ? 'Consider hiring a public adjuster — they work on contingency and often recover more' : 'Review your policy\'s recoverable depreciation provision',
              'Document all additional damage discovered during repairs',
              'Keep all receipts and submit for recoverable depreciation after repairs',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-blue-800">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs flex items-center justify-center font-bold mt-0.5" aria-hidden="true">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* CTA back to documents */}
        <Link
          href="/documents"
          className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white py-4 rounded-2xl font-bold text-base shadow-md hover:bg-blue-800 transition-all duration-200 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[52px]"
        >
          Upload another document
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <p className="text-center text-xs text-slate-400 pb-4">
          AppealKit does not provide legal advice. For disputed estimates, consult a licensed public adjuster.
        </p>
      </div>
    </main>
  );
}
