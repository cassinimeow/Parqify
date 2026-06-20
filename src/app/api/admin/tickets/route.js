import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

/**
 * GET /api/admin/tickets - List all tickets (Admins & Super Admins)
 * PUT /api/admin/tickets - Modify ticket status & slots (Super Admins ONLY)
 * DELETE /api/admin/tickets - Delete ticket row (Super Admins ONLY)
 */

export async function GET() {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const supabase = await getSupabase();
    
    // Fetch tickets with joined slot and lot data
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        *,
        parking_slots (
          slot_name,
          parking_lots (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (ticketsError) {
      return NextResponse.json({ error: ticketsError.message }, { status: 400 });
    }

    // Fetch all users to map them in memory (bypasses cross-schema relation query limitations)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, pup_id');

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 400 });
    }

    // Map the users to their tickets in memory
    const mappedTickets = tickets.map(ticket => ({
      ...ticket,
      users: users.find(u => u.id === ticket.user_id) || null
    }));

    return NextResponse.json({ tickets: mappedTickets });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_super_admin) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, entry_time, exit_time } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Ticket ID and status are required' }, { status: 400 });
    }

    const supabase = await getSupabase();

    // 1. Get the ticket details to find the slot_id
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('slot_id, status')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: ticketError?.message || 'Ticket not found' }, { status: 400 });
    }

    // 2. Perform database update for the ticket status
    const updateData = { status };
    if (entry_time !== undefined) updateData.entry_time = entry_time;
    if (exit_time !== undefined) updateData.exit_time = exit_time;

    const { data: updatedTicketData, error: updateError } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', id)
      .select();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (!updatedTicketData || updatedTicketData.length === 0) {
      return NextResponse.json({ 
        error: 'Update failed. The ticket could not be modified. Please ensure you have RLS "UPDATE" permissions enabled for the tickets table in your Supabase Dashboard.' 
      }, { status: 400 });
    }

    const updatedTicket = updatedTicketData[0];

    // 3. Keep slot status synchronized
    if (ticket.slot_id) {
      let slotStatus = 'AVAILABLE';
      if (status === 'ACTIVE') {
        slotStatus = 'OCCUPIED';
      } else if (status === 'RESERVED') {
        slotStatus = 'RESERVED';
      } else if (status === 'COMPLETED' || status === 'EXPIRED' || status === 'OVERRIDDEN') {
        slotStatus = 'AVAILABLE';
      }

      await supabase
        .from('parking_slots')
        .update({ status: slotStatus })
        .eq('id', ticket.slot_id);
    }

    return NextResponse.json({ ticket: updatedTicket });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_super_admin) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const supabase = await getSupabase();

    // 1. Get the ticket details to find slot_id and check status
    const { data: ticket } = await supabase
      .from('tickets')
      .select('slot_id, status')
      .eq('id', id)
      .single();

    // 2. If the deleted ticket was active or reserved, free up its slot
    if (ticket && (ticket.status === 'ACTIVE' || ticket.status === 'RESERVED') && ticket.slot_id) {
      await supabase
        .from('parking_slots')
        .update({ status: 'AVAILABLE' })
        .eq('id', ticket.slot_id);
    }

    // 3. Delete the ticket
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
