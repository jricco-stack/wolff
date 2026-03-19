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

export type InsuranceDenialResult = {
  insurer_name: string;
  claim_number: string;
  denial_reason: string;
  appeal_deadline_days: number;
  policy_number: string;
  denial_date: string;
};

export type AdjusterLineItem = {
  description: string;
  amount: number;
  depreciation: number;
  net: number;
};

export type AdjusterReportResult = {
  total_estimate: number;
  line_items: AdjusterLineItem[];
  depreciation_total: number;
  acv_total: number;
  rcv_total: number;
  insurer_name: string;
  claim_number: string;
};

export async function analyzeInsuranceDenial(
  base64: string,
  mimeType: string
): Promise<InsuranceDenialResult> {
  const isImage = mimeType.startsWith('image/');
  const contentBlock = isImage
    ? {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
          data: base64,
        },
      }
    : {
        type: 'document' as const,
        source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 },
      };

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: 'You are an expert in private insurance claims and appeals. Extract details from this insurance denial letter and return ONLY valid JSON with no other text or markdown. Use these exact keys: insurer_name (string), claim_number (string), denial_reason (plain English summary, 1-2 sentences), appeal_deadline_days (number — look for explicit deadlines like "30 days", "60 days"; default to 30 if not found), policy_number (string), denial_date (ISO date string YYYY-MM-DD; use today if not found).',
    messages: [
      {
        role: 'user',
        content: [
          contentBlock,
          { type: 'text', text: 'Extract the insurance denial letter details and return as JSON only.' },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Claude did not return valid JSON. Response: ${text.slice(0, 200)}`);
  const result = JSON.parse(match[0]);
  if (!result.appeal_deadline_days || isNaN(Number(result.appeal_deadline_days))) {
    result.appeal_deadline_days = 30;
  }
  return result as InsuranceDenialResult;
}

export async function analyzeAdjusterReport(
  base64: string,
  mimeType: string
): Promise<AdjusterReportResult> {
  const isImage = mimeType.startsWith('image/');
  const contentBlock = isImage
    ? {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
          data: base64,
        },
      }
    : {
        type: 'document' as const,
        source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 },
      };

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: 'You are an expert insurance adjuster analyst. Extract financial details from this adjuster report or estimate and return ONLY valid JSON with no other text or markdown. Use these exact keys: total_estimate (number), line_items (array of objects with keys: description (string), amount (number), depreciation (number), net (number)), depreciation_total (number), acv_total (number), rcv_total (number), insurer_name (string), claim_number (string). Use 0 for any numeric value you cannot find. Use an empty array for line_items if no itemized list is present.',
    messages: [
      {
        role: 'user',
        content: [
          contentBlock,
          { type: 'text', text: 'Extract all financial details from this adjuster report and return as JSON only.' },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Claude did not return valid JSON. Response: ${text.slice(0, 200)}`);
  return JSON.parse(match[0]) as AdjusterReportResult;
}

export type InventoryItem = {
  item: string;
  room: string;
  estimatedValue: number;
  condition: string;
  notes: string;
};

function detectMediaType(base64: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  if (base64.startsWith('iVBOR')) return 'image/png';
  if (base64.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg';
}

export async function generateInventory(imageBase64Array: string[]): Promise<InventoryItem[]> {
  const imageBlocks = imageBase64Array.map((data) => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: detectMediaType(data),
      data,
    },
  }));

  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: 'You are an expert insurance claims adjuster helping disaster survivors document property damage. Analyze the provided photos and identify every damaged or destroyed item visible. For each item, estimate its replacement value in USD at current retail prices. Return ONLY a valid JSON array with no other text, markdown, or explanation. Each element must have these exact fields: item (string), room (string — use "Unknown" if not determinable), estimatedValue (number, USD), condition (one of: "destroyed", "heavily damaged", "water damaged", "smoke damaged"), notes (string — any relevant detail about the damage or the item).',
    messages: [
      {
        role: 'user',
        content: [
          ...imageBlocks,
          {
            type: 'text',
            text: 'Identify every damaged or destroyed item visible in these photos. Return a JSON array only.',
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  const jsonMatch = stripped.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`Claude did not return a valid JSON array. Response: ${text.slice(0, 200)}`);
  return JSON.parse(jsonMatch[0]) as InventoryItem[];
}

export default getClient;
