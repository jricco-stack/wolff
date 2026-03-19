import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY env var');
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export async function POST(req: NextRequest) {
  try {
    const { caseId } = await req.json();
    if (!caseId) return NextResponse.json({ error: 'caseId required' }, { status: 400 });

    const { data: caseData, error } = await supabaseAdmin
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system:
        'You are an expert insurance claims advocate helping policyholders appeal private insurance denials. Write a formal, compelling appeal letter. The letter must: cite the specific policy provisions that support the claim, directly address the denial reason with counter-arguments, request reinstatement of the claim, include a deadline reminder, be professional but convey urgency. Address it to the insurer\'s claims department. Use [DATE] as a placeholder for the current date and [YOUR SIGNATURE] at the end.',
      messages: [
        {
          role: 'user',
          content: `Write an insurance appeal letter for the following case:
- Insurer: ${caseData.insurer_name || 'the insurance company'}
- Claim Number: ${caseData.claim_number || 'N/A'}
- Denial Reason: ${caseData.denial_code || 'not specified'}
- Denial Date: ${caseData.decision_date || 'N/A'}
- Appeal Deadline: ${caseData.deadline_date || 'N/A'}

Write the complete letter ready to print and send. Be specific about challenging the denial reason and requesting a full review.`,
        },
      ],
    });

    const letter = response.content[0].type === 'text' ? response.content[0].text : '';

    await supabaseAdmin
      .from('cases')
      .update({ appeal_letter: letter })
      .eq('id', caseId);

    return NextResponse.json({ letter });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Generate insurance letter error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
