import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { ticket_id } = body;

    if (!ticket_id) {
      return NextResponse.json({ error: 'ticket_id is required' }, { status: 400 });
    }

    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await getSupabase();

    // Verify ticket belongs to user and is ACTIVE
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, slot_id, status')
      .eq('id', ticket_id)
      .eq('user_id', user.id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Ticket is already completed or invalid' }, { status: 400 });
    }

    // Begin checkout process
    // 1. Update ticket status to COMPLETED and set exit_time
    const { error: updateTicketError } = await supabase
      .from('tickets')
      .update({ 
        status: 'COMPLETED',
        exit_time: new Date().toISOString()
      })
      .eq('id', ticket_id);

    if (updateTicketError) {
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }

    // 2. Free up the parking slot
    const { error: updateSlotError } = await supabase
      .from('parking_slots')
      .update({ status: 'AVAILABLE' })
      .eq('id', ticket.slot_id);

    if (updateSlotError) {
      console.error('Failed to free slot:', ticket.slot_id);
    }

    return NextResponse.json({ message: 'Checkout successful', success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
