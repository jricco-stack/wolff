import Anthropic from '@anthropic-ai/sdk';

let _anthropic: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY env var');
    _anthropic = new Anthropic({ apiKey });
  }
  return _anthropic;
}

export async function analyzeDocument(base64Content: string, mediaType: string) {
  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: 'You are an expert in FEMA Individual Assistance appeals. Extract the following from this FEMA determination letter: 1) FEMA application number (9 digits), 2) disaster declaration number, 3) decision date (MM/DD/YYYY), 4) denial reason code or description, 5) the applicant\'s name, 6) damaged property address. Return as JSON only, no other text. Use these exact keys: application_number, disaster_number, decision_date, denial_reason, applicant_name, property_address.',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: base64Content,
            },
          },
          {
            type: 'text',
            text: 'Extract the FEMA determination letter details and return as JSON only.',
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Claude did not return valid JSON. Response: ${text.slice(0, 200)}`);
  return JSON.parse(jsonMatch[0]);
}

export async function generateAppealLetter(caseData: {
  applicant_name: string;
  application_number: string;
  disaster_number: string;
  decision_date: string;
  denial_code: string;
  property_address: string;
  denial_title: string;
  appeal_strategy: string;
}) {
  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: 'You are an expert advocate helping disaster survivors appeal FEMA Individual Assistance denials. Write a formal, compelling appeal letter. The letter must: cite 44 CFR 206.115 (the regulation requiring FEMA to provide a fair review), directly address the specific denial reason with counter-arguments, request the specific relief sought, be professional but convey urgency, and be addressed to: FEMA - Individuals & Households Program, National Processing Service Center, P.O. Box 10055, Hyattsville, MD 20782-8055. Use [DATE] as a placeholder for the current date.',
    messages: [
      {
        role: 'user',
        content: `Write an appeal letter for the following case:
- Applicant Name: ${caseData.applicant_name}
- Application Number: ${caseData.application_number}
- Disaster Number: ${caseData.disaster_number}
- Decision Date: ${caseData.decision_date}
- Denial Reason: ${caseData.denial_title} (${caseData.denial_code})
- Property Address: ${caseData.property_address}
- Suggested Appeal Strategy: ${caseData.appeal_strategy}

Write the complete letter ready to print and send.`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export async function generateCallScript(
  disasterType: string,
  hasHomeInsurance: boolean,
  hasFloodInsurance: boolean
): Promise<string> {
  const insuranceContext = [
    hasHomeInsurance && 'homeowner\'s or renter\'s insurance',
    hasFloodInsurance && 'separate flood insurance',
  ].filter(Boolean).join(' and ') || 'no private insurance';

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: 'You write calm, plain-English phone scripts for disaster survivors to read verbatim when calling their insurance company. Write as spoken words, not formal prose. Short sentences. Conversational but clear. About 200 words total.',
    messages: [
      {
        role: 'user',
        content: `Write a phone call script for someone who just experienced a ${disasterType} disaster and has ${insuranceContext}.

The script must include:
1. How to open the call (name, policy number placeholder, address)
2. What information to give the rep
3. What to specifically ask for: claim number, adjuster's name, expected timeline, and confirmation of next steps in writing
4. What NOT to say — remind them in plain language: do not admit fault, do not speculate on what caused the damage, do not accept any settlement offer on this first call

Format as a ready-to-read script with clear sections. Use [BRACKETS] for info they need to fill in.`,
      },
    ],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export default getClient;
