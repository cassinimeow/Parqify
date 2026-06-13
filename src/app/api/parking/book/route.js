import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/parking/book
 * Books a parking slot for the authenticated user.
 * Body: { lot_id: string, slot_id: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { lot_id, slot_id } = body;

    if (!lot_id || !slot_id) {
      return NextResponse.json(
        { error: 'lot_id and slot_id are required' },
        { status: 400 }
      );
    }

    // 1. Authenticate user
    const { user, profile, error: authError } = await getCurrentUser();
    
    if (authError || !user || !profile) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const supabase = getSupabase();

    // 2. Check if the slot is actually AVAILABLE
    const { data: slotData, error: slotError } = await supabase
      .from('parking_slots')
      .select('status')
      .eq('id', slot_id)
      .single();

    if (slotError || !slotData) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    if (slotData.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'This slot is no longer available.' },
        { status: 400 }
      );
    }

    // 3. Check if the user already has an active ticket
    const { data: activeTicket } = await supabase
      .from('tickets')
      .select('id')
      .eq('user_id', profile.id)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (activeTicket) {
      return NextResponse.json(
        { error: 'You already have an active parking session.' },
        { status: 400 }
      );
    }

    // 4. Update the slot status to RESERVED
    const { error: updateError } = await supabase
      .from('parking_slots')
      .update({ status: 'RESERVED' })
      .eq('id', slot_id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to reserve slot' }, { status: 500 });
    }

    // 5. Create the Ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        user_id: profile.id,
        slot_id: slot_id,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (ticketError) {
      // If ticket creation fails, rollback slot status
      await supabase
        .from('parking_slots')
        .update({ status: 'AVAILABLE' })
        .eq('id', slot_id);
        
      return NextResponse.json({ error: 'Failed to generate ticket' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Booking successful',
      ticket,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
