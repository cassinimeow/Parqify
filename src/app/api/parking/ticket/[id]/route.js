import { NextResponse } from 'next/server';
import { getSupabase, expireOldReservations } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticketId = params.id;
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const supabase = await getSupabase();
    
    // Automatically release expired reservations
    await expireOldReservations(supabase);
    
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        id, 
        status, 
        entry_time, 
        exit_time, 
        created_at,
        parking_slots (
          id,
          slot_name,
          status,
          parking_lots (
            id,
            name
          )
        )
      `)
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
