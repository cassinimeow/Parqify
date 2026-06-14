import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * POST /api/parking/slots
 * Adds a new slot to a lot.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { lot_id, slot_name, status } = body;
    const supabase = getSupabase();
    
    if (!lot_id || !slot_name) {
      return NextResponse.json({ error: 'lot_id and slot_name are required' }, { status: 400 });
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
    const { data: lotData } = await supabase.from('parking_lots').select('total_slots').eq('id', lot_id).single();
    if (lotData) {
      await supabase.from('parking_lots').update({ total_slots: lotData.total_slots + 1 }).eq('id', lot_id);
    }

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
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 });

    const supabase = getSupabase();
    
    // Get the lot_id before deleting so we can decrement its count
    const { data: slotToDelete } = await supabase.from('parking_slots').select('lot_id').eq('id', id).single();
    
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

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
