import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * POST /api/parking/seed
 * Seeds the database with default parking lots and slots if they don't exist.
 */
export async function POST() {
  try {
    const supabase = await getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    // 1. Check if lots already exist
    const { data: existingLots, error: checkError } = await supabase
      .from('parking_lots')
      .select('id')
      .limit(1);

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 400 });
    }

    if (existingLots && existingLots.length > 0) {
      return NextResponse.json({ message: 'Database already has parking lots. Skipping seed.' });
    }

    // 2. Define default lots
    const defaultLots = [
      { name: 'PUP Main Campus Lot', total_slots: 12 },
      { name: 'ITECH Campus Lot', total_slots: 16 }
    ];

    // Insert lots and get their IDs
    const { data: insertedLots, error: insertLotsError } = await supabase
      .from('parking_lots')
      .insert(defaultLots)
      .select();

    if (insertLotsError) {
      return NextResponse.json({ error: insertLotsError.message }, { status: 500 });
    }

    // 3. For each lot, insert default slots
    const allSlots = [];
    insertedLots.forEach((lot) => {
      const prefix = lot.name.includes('Main') ? 'A' : lot.name.includes('CEA') ? 'B' : 'C';
      for (let i = 1; i <= lot.total_slots; i++) {
        // Randomly assign some occupied/reserved slots for testing
        let status = 'AVAILABLE';
        if (i % 5 === 0) {
          status = 'OCCUPIED';
        } else if (i % 7 === 0) {
          status = 'RESERVED';
        }
        allSlots.push({
          lot_id: lot.id,
          slot_name: `${prefix}-${i}`,
          status: status
        });
      }
    });

    const { error: insertSlotsError } = await supabase
      .from('parking_slots')
      .insert(allSlots);

    if (insertSlotsError) {
      return NextResponse.json({ error: insertSlotsError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Database seeded successfully with default lots and slots!',
      lotsCount: insertedLots.length,
      slotsCount: allSlots.length
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error: ' + err.message },
      { status: 500 }
    );
  }
}
