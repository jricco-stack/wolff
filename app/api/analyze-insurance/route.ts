import { NextRequest, NextResponse } from 'next/server';
import { analyzeInsuranceDenial } from '@/lib/claude';
import { supabaseAdmin } from '@/lib/supabase';

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) {
    // fallback to today
    const today = new Date();
    today.setDate(today.getDate() + days);
    return today.toISOString().split('T')[0];
  }
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export async function POST(req: NextRequest) {
  try {
    const { file, mimeType, documentType, sessionId } = await req.json();
    if (!file || !mimeType) {
      return NextResponse.json({ error: 'file and mimeType are required' }, { status: 400 });
    }

    const extracted = await analyzeInsuranceDenial(file, mimeType);

    const deadlineDays = Number(extracted.appeal_deadline_days) || 30;
    const deadlineDate = addDays(extracted.denial_date, deadlineDays);

    const { data: caseData, error } = await supabaseAdmin
      .from('cases')
      .insert({
        document_type: documentType === 'adjuster_report' ? 'adjuster_report' : 'insurance_denial',
        application_number: extracted.policy_number || 'N/A',
        disaster_number: 'N/A',
        decision_date: extracted.denial_date || new Date().toISOString().split('T')[0],
        denial_code: extracted.denial_reason,
        applicant_name: 'N/A',
        property_address: 'N/A',
        insurer_name: extracted.insurer_name || null,
        claim_number: extracted.claim_number || null,
        deadline_date: deadlineDate,
        status: 'pending',
        user_id: null,
        session_id: sessionId || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Supabase insert failed: ${error.message}`);

    return NextResponse.json({
      caseId: caseData.id,
      denialReason: extracted.denial_reason,
      insurerName: extracted.insurer_name,
      deadlineDays,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('analyze-insurance error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
