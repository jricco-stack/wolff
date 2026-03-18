import { writeFileSync } from 'fs';

// Build a minimal but valid PDF with a realistic FEMA denial letter
const letterText = [
  'FEDERAL EMERGENCY MANAGEMENT AGENCY',
  'Individuals and Households Program',
  '',
  'Date: January 15, 2025',
  '',
  'Applicant: John D. Smith',
  'Application Number: 123456789',
  'Disaster Number: DR-4781-TX',
  'Property Address: 4521 Magnolia Creek Rd, Houston, TX 77084',
  '',
  'DETERMINATION LETTER',
  '',
  'Dear John D. Smith,',
  '',
  'We have reviewed your application for disaster assistance under the',
  'Individuals and Households Program (IHP) for Disaster DR-4781-TX.',
  '',
  'After careful review, we are unable to provide assistance at this time.',
  '',
  'REASON FOR DENIAL: FEMA-INS - Insurance Duplication of Benefits',
  '',
  'Our records indicate that you have homeowners insurance that may',
  'cover the damage to your property. Federal law prohibits FEMA from',
  'duplicating benefits that are covered by your insurance policy.',
  'You must first file a claim with your insurance company and exhaust',
  'your insurance coverage before FEMA can provide assistance.',
  '',
  'YOUR APPEAL RIGHTS',
  '',
  'You may appeal this decision within 60 days of the date of this letter.',
  'Your appeal deadline is: March 16, 2025',
  '',
  'To appeal, send a signed, written explanation of why you believe',
  'this decision is incorrect, along with any supporting documentation, to:',
  '',
  'FEMA - Individuals and Households Program',
  'National Processing Service Center',
  'P.O. Box 10055',
  'Hyattsville, MD 20782-8055',
  '',
  'Or call 1-800-621-3362 (TTY: 1-800-462-7585)',
  '',
  'Sincerely,',
  'FEMA Disaster Assistance Division',
];

// Build PDF content stream
const streamLines = letterText.map((line, i) => {
  const y = 730 - (i * 14);
  const escaped = line.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  return `BT /F1 10 Tf 50 ${y} Td (${escaped}) Tj ET`;
}).join('\n');

const stream = streamLines;
const streamLen = Buffer.byteLength(stream, 'latin1');

const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${streamLen}>>
stream
${stream}
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f
trailer<</Size 6/Root 1 0 R>>
startxref
9
%%EOF`;

writeFileSync('./scripts/test-fema-letter.pdf', pdf, 'latin1');
console.log('Created test-fema-letter.pdf');
