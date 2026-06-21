import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';

/**
 * GET /api/parking/lots
 * Returns all parking lots.
 */
export async function GET() {
  try {
    const supabase = await getSupabase();
    
    const { data: lots, error } = await supabase
      .from('parking_lots')
      .select(`
        id, 
        name, 
        created_at,
        parking_slots(id)
      `)
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Dynamically calculate live slots to ensure 100% accuracy
    const liveLots = lots.map(lot => {
      const trueCount = lot.parking_slots ? lot.parking_slots.length : 0;
      const { parking_slots, ...rest } = lot;
      return { ...rest, total_slots: trueCount };
    });

    return NextResponse.json({ lots: liveLots });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/parking/lots
 * Creates a new parking lot and generates default slots for it.
 */
export async function POST(request) {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, total_slots } = body;
    const supabase = await getSupabase();
    
    if (!name || total_slots === undefined) {
      return NextResponse.json({ error: 'Name and total_slots are required' }, { status: 400 });
    }

    if (total_slots > 500) {
      return NextResponse.json({ error: 'Cannot create more than 500 slots at once' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('parking_lots')
      .insert({ name, total_slots })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Auto-generate generic slots
    const slotsToInsert = [];
    for (let i = 1; i <= total_slots; i++) {
      slotsToInsert.push({
        lot_id: data.id,
        slot_name: `S-${i}`,
        status: 'AVAILABLE'
      });
    }
    
    if (slotsToInsert.length > 0) {
      await supabase.from('parking_slots').insert(slotsToInsert);
    }

    // Log the audit event
    await logAdminAction(
      supabase,
      userResult.user.id,
      'ADD_PARKING_LOT',
      'LOT',
      data.id,
      `Admin "${userResult.profile.full_name}" created parking lot "${name}" with ${total_slots} slots.`
    );

    return NextResponse.json({ lot: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/parking/lots
 * Deletes a parking lot.
 */
export async function DELETE(request) {
  try {
    const userResult = await getCurrentUser();
    if (userResult.error || !userResult.profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Lot ID is required' }, { status: 400 });

    const supabase = await getSupabase();

    // Fetch lot name before deletion for audit logging details
    const { data: lotData } = await supabase
      .from('parking_lots')
      .select('name')
      .eq('id', id)
      .single();

    const lotName = lotData ? lotData.name : 'Unknown';

    const { error } = await supabase.from('parking_lots').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log the audit event
    await logAdminAction(
      supabase,
      userResult.user.id,
      'DELETE_PARKING_LOT',
      'LOT',
      id,
      `Admin "${userResult.profile.full_name}" deleted parking lot "${lotName}".`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
