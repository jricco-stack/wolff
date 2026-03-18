export type DenialCode = {
  code: string;
  title: string;
  plain_english_explanation: string;
  appeal_strategy: string;
  required_documents: string[];
  success_tips: string[];
};

export const DENIAL_CODES: Record<string, DenialCode> = {
  'FEMA-INS': {
    code: 'FEMA-INS',
    title: 'Insurance Duplication',
    plain_english_explanation:
      'FEMA believes your insurance already covered or should cover the damage, so they won\'t provide duplicate assistance.',
    appeal_strategy:
      'Show that your insurance settlement was insufficient, denied, or didn\'t cover specific items FEMA can help with.',
    required_documents: [
      'Insurance policy declaration page',
      'Insurance denial letter or settlement statement',
      'Itemized list of unmet needs not covered by insurance',
      'Contractor repair estimates',
    ],
    success_tips: [
      'If insurance underpaid, get a public adjuster letter.',
      'Document every gap between insurance payout and actual repair costs.',
      'FEMA can cover what insurance doesn\'t.',
    ],
  },
  'FEMA-OCC': {
    code: 'FEMA-OCC',
    title: 'Insufficient Proof of Occupancy',
    plain_english_explanation:
      'FEMA couldn\'t confirm you were actually living at the damaged address at the time of the disaster.',
    appeal_strategy:
      'Provide multiple documents dated before the disaster showing the damaged address as your primary residence.',
    required_documents: [
      'Utility bills (electric, gas, water) from before the disaster',
      'Bank statements with your address',
      'Driver\'s license or state ID',
      'Lease agreement or mortgage statement',
      'School or medical records showing your address',
      'Employer records',
    ],
    success_tips: [
      'Even informal arrangements count — a landlord letter can help.',
      'Utility bills are among the strongest proof.',
      'You only need to show occupancy, not legal tenancy.',
    ],
  },
  'FEMA-OWN': {
    code: 'FEMA-OWN',
    title: 'Insufficient Proof of Ownership',
    plain_english_explanation:
      'FEMA couldn\'t verify that you own the damaged property.',
    appeal_strategy:
      'Provide official documents showing legal or equitable ownership of the property.',
    required_documents: [
      'Property deed or title',
      'Mortgage statement',
      'Property tax records',
      'Manufactured home title or bill of sale',
      'Court order granting property rights',
      'Homeowner\'s insurance policy',
    ],
    success_tips: [
      'Even if a deed is in a deceased parent\'s name, you may still qualify — provide heirship documents.',
      'Manufactured home owners need title AND occupancy proof.',
    ],
  },
  'FEMA-DAM': {
    code: 'FEMA-DAM',
    title: 'Insufficient Damage',
    plain_english_explanation:
      'The FEMA inspector determined the damage to your home was not severe enough to affect your ability to safely live there.',
    appeal_strategy:
      'Show that the inspector missed damage or that the damage makes your home unsafe or unlivable.',
    required_documents: [
      'Independent contractor damage estimate',
      'Photos and videos of all damage (date-stamped if possible)',
      'Medical documentation if mold/air quality is a health concern',
      'Local building inspection report',
      'Written statement describing impact on habitability',
    ],
    success_tips: [
      'Inspectors sometimes miss hidden damage (mold behind walls, foundation issues).',
      'A licensed contractor\'s detailed written estimate is very persuasive.',
      'Describe in your letter exactly how each area of damage affects daily living.',
    ],
  },
  'FEMA-ELI': {
    code: 'FEMA-ELI',
    title: 'Technical Ineligibility',
    plain_english_explanation:
      'Your application was denied for a technical reason — such as your address not being in the declared disaster area, or a duplicate registration issue.',
    appeal_strategy:
      'Provide documentation proving your eligibility — confirm your address is in the disaster zone and that all registration information is accurate.',
    required_documents: [
      'Proof of address in the declared disaster area',
      'FEMA registration confirmation',
      'Any corrected information to fix errors in your application',
      'Government-issued ID',
    ],
    success_tips: [
      'Check FEMA\'s disaster declaration map to confirm your address is included.',
      'If your application had an error (wrong address, wrong SSN digit), the appeal is a chance to correct it.',
    ],
  },
  'FEMA-DUP': {
    code: 'FEMA-DUP',
    title: 'Duplicate Application',
    plain_english_explanation:
      'FEMA found another application for assistance at your address, which may indicate duplicate registration.',
    appeal_strategy:
      'Explain why multiple applications exist (household members each applied, co-applicant confusion) and clarify who the primary applicant is.',
    required_documents: [
      'Explanation letter detailing the household situation',
      'Proof that only one household lives at the address',
      'Documentation of any prior application withdrawal',
    ],
    success_tips: [
      'Common in multi-family homes or when both spouses applied.',
      'A clear written explanation of your household composition usually resolves this.',
    ],
  },
  'FEMA-SBA': {
    code: 'FEMA-SBA',
    title: 'SBA Loan Referral',
    plain_english_explanation:
      'FEMA referred you to the Small Business Administration (SBA) for a low-interest disaster loan instead of providing a grant. This is not a full denial — but if you don\'t qualify for or don\'t want an SBA loan, you may still get FEMA help.',
    appeal_strategy:
      'If you applied for and were denied an SBA loan, send that denial letter to FEMA — this often unlocks additional grant assistance. If you chose not to apply, explain why (fixed income, health, age).',
    required_documents: [
      'SBA loan denial letter (if you applied and were denied)',
      'Explanation of why you cannot take on additional debt',
      'Income documentation',
      'Statement of financial hardship',
    ],
    success_tips: [
      'An SBA denial letter is one of the most powerful documents you can submit.',
      'Apply to SBA even if you think you\'ll be denied — that denial letter opens doors with FEMA.',
    ],
  },
  'FEMA-INA': {
    code: 'FEMA-INA',
    title: 'Inaccessible or Unsafe for Inspection',
    plain_english_explanation:
      'The FEMA inspector was unable to access or safely inspect your damaged property.',
    appeal_strategy:
      'Explain why the property was inaccessible and provide your own documentation of the damage.',
    required_documents: [
      'Explanation of why access was difficult (road damage, security, health hazard)',
      'Photos and video of damage',
      'Contractor or engineer inspection report',
      'Police or fire department report if applicable',
      'Local officials\' statement about road/access conditions',
    ],
    success_tips: [
      'If the inspector couldn\'t access a specific damaged area (flooded crawlspace, condemned section), provide a licensed contractor\'s report covering those areas.',
      'Reach out to FEMA proactively to reschedule.',
    ],
  },
};

export function getDenialCode(code: string): DenialCode | undefined {
  return DENIAL_CODES[code];
}
