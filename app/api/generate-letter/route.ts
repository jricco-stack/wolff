import { NextRequest, NextResponse } from 'next/server';
import { generateAppealLetter } from '@/lib/claude';
import { supabaseAdmin } from '@/lib/supabase';
import { getDenialCode } from '@/lib/denial-codes';

export async function POST(req: NextRequest) {
  try {
    const { caseId } = await req.json();
    if (!caseId) return NextResponse.json({ error: 'caseId required' }, { status: 400 });

    // Fetch case from Supabase
    const { data: caseData, error } = await supabaseAdmin
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const denialCodeObj = getDenialCode(caseData.denial_code);
    if (!denialCodeObj) return NextResponse.json({ error: 'Unknown denial code' }, { status: 400 });

    const letter = await generateAppealLetter({
      applicant_name: caseData.applicant_name,
      application_number: caseData.application_number,
      disaster_number: caseData.disaster_number,
      decision_date: caseData.decision_date,
      denial_code: caseData.denial_code,
      property_address: caseData.property_address,
      denial_title: denialCodeObj.title,
      appeal_strategy: denialCodeObj.appeal_strategy,
    });

    // Store letter in Supabase
    await supabaseAdmin
      .from('cases')
      .update({ appeal_letter: letter })
      .eq('id', caseId);

    return NextResponse.json({ letter });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Generate letter error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
