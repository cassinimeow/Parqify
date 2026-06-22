import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

/**
 * POST /api/parking/slots
 * Adds a new slot to a lot.
 */
export async function POST(request) {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { lot_id, slot_name, status } = body;
    const supabase = await getSupabase();
    
    if (!lot_id || !slot_name) {
      return NextResponse.json({ error: 'lot_id and slot_name are required' }, { status: 400 });
    }

    // Enforce max 30 slots per lot constraint
    const { count, error: countError } = await supabase
      .from('parking_slots')
      .select('id', { count: 'exact', head: true })
      .eq('lot_id', lot_id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }

    if (count >= 30) {
      return NextResponse.json({ error: 'Cannot add slot. Maximum limit of 30 slots reached for this lot.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('parking_slots')
      .insert({ lot_id, slot_name, status: status || 'AVAILABLE' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Increment lot total_slots
    const { data: lotData } = await supabase.from('parking_lots').select('name, total_slots').eq('id', lot_id).single();
    if (lotData) {
      await supabase.from('parking_lots').update({ total_slots: lotData.total_slots + 1 }).eq('id', lot_id);
    }

    const lotName = lotData ? lotData.name : 'Unknown';

    // Log the audit event
    await logAdminAction(
      supabase,
      userResult.user.id,
      'ADD_PARKING_SLOT',
      'SLOT',
      data.id,
      `Admin "${userResult.profile.full_name}" added slot "${slot_name}" (Initial Status: ${status || 'AVAILABLE'}) to lot "${lotName}".`
    );

    return NextResponse.json({ slot: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/parking/slots
 * Deletes a parking slot.
 */
export async function DELETE(request) {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 });

    const supabase = await getSupabase();
    
    // Get the slot details before deleting so we can decrement count and audit log
    const { data: slotToDelete } = await supabase
      .from('parking_slots')
      .select('lot_id, slot_name, parking_lots(name)')
      .eq('id', id)
      .single();
    
    const slotName = slotToDelete ? slotToDelete.slot_name : 'Unknown';
    const lotName = slotToDelete?.parking_lots ? slotToDelete.parking_lots.name : 'Unknown';

    const { error } = await supabase.from('parking_slots').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Decrement lot total_slots
    if (slotToDelete) {
      const { data: lotData } = await supabase.from('parking_lots').select('total_slots').eq('id', slotToDelete.lot_id).single();
      if (lotData) {
        await supabase.from('parking_lots').update({ total_slots: Math.max(0, lotData.total_slots - 1) }).eq('id', slotToDelete.lot_id);
      }
    }

    // Log the audit event
    await logAdminAction(
      supabase,
      userResult.user.id,
      'DELETE_PARKING_SLOT',
      'SLOT',
      id,
      `Admin "${userResult.profile.full_name}" deleted slot "${slotName}" from lot "${lotName}".`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/parking/slots
 * Updates a parking slot's status.
 */
export async function PUT(request) {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) return NextResponse.json({ error: 'Slot ID and new status are required' }, { status: 400 });

    const supabase = await getSupabase();
    
    // Fetch current slot state for audit details
    const { data: currentSlot } = await supabase
      .from('parking_slots')
      .select('slot_name, status, parking_lots(name)')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('parking_slots')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const slotName = currentSlot ? currentSlot.slot_name : 'Unknown';
    const lotName = currentSlot?.parking_lots ? currentSlot.parking_lots.name : 'Unknown';
    const oldStatus = currentSlot ? currentSlot.status : 'Unknown';

    // If the slot is being overridden to AVAILABLE, automatically complete any active/reserved tickets
    // so the user's ticket page is cleared and accurate.
    if (status === 'AVAILABLE') {
      await supabase
        .from('tickets')
        .update({ status: 'OVERRIDDEN', exit_time: new Date().toISOString() })
        .eq('slot_id', id)
        .in('status', ['ACTIVE', 'RESERVED']);
    } else if (status === 'OCCUPIED') {
      // If the admin forcefully occupies a slot, any RESERVED ticket on it should become ACTIVE
      await supabase
        .from('tickets')
        .update({ status: 'ACTIVE', entry_time: new Date().toISOString() })
        .eq('slot_id', id)
        .eq('status', 'RESERVED');
    } else if (status === 'RESERVED') {
      // If the admin forcefully reverts a slot to RESERVED, any ACTIVE ticket on it should become RESERVED
      await supabase
        .from('tickets')
        .update({ status: 'RESERVED' })
        .eq('slot_id', id)
        .eq('status', 'ACTIVE');
    }

    // Log the audit event
    await logAdminAction(
      supabase,
      userResult.user.id,
      'UPDATE_PARKING_SLOT',
      'SLOT',
      id,
      `Admin "${userResult.profile.full_name}" updated slot "${slotName}" in lot "${lotName}" from status "${oldStatus}" to "${status}".`
    );

    return NextResponse.json({ slot: data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
