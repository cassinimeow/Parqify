import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/tickets
 * Returns the current user's parking tickets (active and history).
 */
export async function GET() {
  try {
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();
    
    // Fetch tickets with joined slot and lot data
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        id, 
        status, 
        entry_time, 
        exit_time, 
        created_at,
        parking_slots (
          slot_name,
          parking_lots (
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ tickets });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
