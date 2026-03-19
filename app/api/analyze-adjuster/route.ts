import { NextRequest, NextResponse } from 'next/server';
import { analyzeAdjusterReport } from '@/lib/claude';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { file, mimeType } = await req.json();
    if (!file || !mimeType) {
      return NextResponse.json({ error: 'file and mimeType are required' }, { status: 400 });
    }

    const extracted = await analyzeAdjusterReport(file, mimeType);

    const isFlagged =
      extracted.total_estimate > 0 &&
      extracted.depreciation_total / extracted.total_estimate > 0.3;

    // Store line_items + acv/rcv totals in appeal_letter (JSON) for the review page
    const adjusterPayload = JSON.stringify({
      line_items: extracted.line_items,
      depreciation_total: extracted.depreciation_total,
      acv_total: extracted.acv_total,
      rcv_total: extracted.rcv_total,
    });

    const { data: caseData, error } = await supabaseAdmin
      .from('cases')
      .insert({
        document_type: 'adjuster_report',
        application_number: extracted.claim_number || 'N/A',
        disaster_number: 'N/A',
        decision_date: new Date().toISOString().split('T')[0],
        denial_code: 'N/A',
        applicant_name: 'N/A',
        property_address: 'N/A',
        insurer_name: extracted.insurer_name || null,
        claim_number: extracted.claim_number || null,
        adjuster_estimate: extracted.total_estimate || null,
        is_estimate_flagged: isFlagged,
        appeal_letter: adjusterPayload,
        status: 'pending',
        user_id: null,
      })
      .select()
      .single();

    if (error) throw new Error(`Supabase insert failed: ${error.message}`);

    return NextResponse.json({
      caseId: caseData.id,
      totalEstimate: extracted.total_estimate,
      isFlagged,
      lineItems: extracted.line_items,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('analyze-adjuster error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
