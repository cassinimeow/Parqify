import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * GET /api/parking/slots/[lotId]
 * Returns all parking slots for a specific parking lot.
 */
export async function GET(request, { params }) {
  try {
    const { lotId } = await params;
    const supabase = getSupabase();
    
    const { data: slots, error } = await supabase
      .from('parking_slots')
      .select('id, lot_id, slot_name, status, created_at')
      .eq('lot_id', lotId)
      .order('slot_name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ slots });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
