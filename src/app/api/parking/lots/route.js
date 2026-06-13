import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * GET /api/parking/lots
 * Returns all parking lots.
 */
export async function GET() {
  try {
    const supabase = getSupabase();
    
    const { data: lots, error } = await supabase
      .from('parking_lots')
      .select('id, name, total_slots, created_at')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ lots });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
