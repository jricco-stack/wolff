import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/lib/claude';
import { supabaseAdmin } from '@/lib/supabase';
import { getDenialCode } from '@/lib/denial-codes';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Determine media type - for PDFs, use image/jpeg as workaround (convert first page)
    // Claude supports: image/jpeg, image/png, image/gif, image/webp
    // For PDF uploads, we'll tell Claude it's a document via text prompt instead
    const mediaType = file.type;
    if (mediaType === 'application/pdf') {
      // For PDFs, we'll use the document source type
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-beta': 'pdfs-2024-09-25',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: 'You are an expert in FEMA Individual Assistance appeals. Extract the following from this FEMA determination letter: 1) FEMA application number (9 digits), 2) disaster declaration number, 3) decision date (MM/DD/YYYY), 4) denial reason code or description, 5) the applicant\'s name, 6) damaged property address. Return as JSON only, no other text. Use these exact keys: application_number, disaster_number, decision_date, denial_reason, applicant_name, property_address.',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'document',
                  source: {
                    type: 'base64',
                    media_type: 'application/pdf',
                    data: base64,
                  },
                },
                {
                  type: 'text',
                  text: 'Extract the FEMA determination letter details and return as JSON only.',
                },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      const text = data.content?.[0]?.text ?? '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Claude did not return valid JSON');
      const extracted = JSON.parse(jsonMatch[0]);
      return await storeCaseAndReturn(extracted);
    }

    // For images
    const extracted = await analyzeDocument(base64, mediaType);
    return await storeCaseAndReturn(extracted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Analyze error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function storeCaseAndReturn(extracted: {
  application_number: string;
  disaster_number: string;
  decision_date: string;
  denial_reason: string;
  applicant_name: string;
  property_address: string;
}) {
  // Match denial reason to our code table
  const denialReason = extracted.denial_reason?.toUpperCase() ?? '';
  let matchedCode = 'FEMA-ELI'; // default
  const codeKeys = ['FEMA-INS', 'FEMA-OCC', 'FEMA-OWN', 'FEMA-DAM', 'FEMA-ELI', 'FEMA-DUP', 'FEMA-SBA', 'FEMA-INA'];
  for (const code of codeKeys) {
    if (denialReason.includes(code) || denialReason.includes(code.replace('FEMA-', ''))) {
      matchedCode = code;
      break;
    }
  }
  // Also match by keywords
  if (denialReason.includes('INSURANCE') || denialReason.includes('INS')) matchedCode = 'FEMA-INS';
  else if (denialReason.includes('OCCUPAN')) matchedCode = 'FEMA-OCC';
  else if (denialReason.includes('OWNER') || denialReason.includes('TITLE') || denialReason.includes('OWN')) matchedCode = 'FEMA-OWN';
  else if (denialReason.includes('DAMAGE') || denialReason.includes('DAM')) matchedCode = 'FEMA-DAM';
  else if (denialReason.includes('DUPLICATE') || denialReason.includes('DUP')) matchedCode = 'FEMA-DUP';
  else if (denialReason.includes('SBA') || denialReason.includes('LOAN')) matchedCode = 'FEMA-SBA';
  else if (denialReason.includes('ACCESS') || denialReason.includes('INACCESS') || denialReason.includes('INA')) matchedCode = 'FEMA-INA';

  const denialCodeObj = getDenialCode(matchedCode);

  // Store in Supabase
  const { data: caseData, error } = await supabaseAdmin
    .from('cases')
    .insert({
      application_number: extracted.application_number ?? 'Unknown',
      disaster_number: extracted.disaster_number ?? 'Unknown',
      decision_date: extracted.decision_date ?? 'Unknown',
      denial_code: matchedCode,
      applicant_name: extracted.applicant_name ?? 'Unknown',
      property_address: extracted.property_address ?? 'Unknown',
      user_id: null,
    })
    .select()
    .single();

  if (error) throw new Error(`Supabase insert failed: ${error.message}`);

  return NextResponse.json({
    caseId: caseData.id,
    case: caseData,
    denialCode: denialCodeObj,
    extracted,
  });
}
