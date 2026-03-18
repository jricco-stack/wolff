import { NextRequest, NextResponse } from 'next/server';
import { generateCallScript } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { disasterType, hasHomeInsurance, hasFloodInsurance } = await req.json();
    if (!disasterType) {
      return NextResponse.json({ error: 'disasterType is required' }, { status: 400 });
    }
    const script = await generateCallScript(
      disasterType,
      Boolean(hasHomeInsurance),
      Boolean(hasFloodInsurance)
    );
    return NextResponse.json({ script });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Call script error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
