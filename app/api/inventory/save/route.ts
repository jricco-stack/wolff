import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { InventoryItem } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { caseId, items }: { caseId: string; items: InventoryItem[] } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }

    const rows = items.map((item) => ({
      case_id: caseId || null,
      item: item.item,
      room: item.room,
      estimated_value: item.estimatedValue,
      condition: item.condition,
      notes: item.notes,
    }));

    const { error } = await supabaseAdmin.from('inventory_items').insert(rows);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Inventory save error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
