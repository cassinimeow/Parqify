import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * POST /api/auth/revoke-other-sessions
 * Signs out all other active sessions for the authenticated user.
 */
export async function POST() {
  try {
    const supabase = await getSupabase();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // Call Supabase signOut with scope 'others' to revoke other refresh tokens
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'others' });
    if (signOutError) {
      return NextResponse.json({ error: signOutError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Successfully signed out of all other devices' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
