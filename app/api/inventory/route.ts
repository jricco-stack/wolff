import { NextRequest, NextResponse } from 'next/server';
import { generateInventory } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { images } = await req.json();
    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'images array is required' }, { status: 400 });
    }
    if (images.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 images allowed' }, { status: 400 });
    }
    const items = await generateInventory(images);
    return NextResponse.json({ items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Inventory analysis error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
