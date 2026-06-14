import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/user/security
 * Updates the user's email and/or password via Supabase Auth.
 * Body: { email?: string, password?: string }
 */
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const { user, error: authError } = await getCurrentUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await getSupabase();
    
    const updates = {};
    if (email) updates.email = email;
    if (password) updates.password = password;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No changes provided' });
    }

    const { data, error } = await supabase.auth.updateUser(updates);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (email) {
       await supabase.from('users').update({ email }).eq('id', user.id);
    }

    let message = 'Security settings updated successfully';
    if (email) {
      message = 'Please check your new email inbox to confirm the email change.';
    }

    return NextResponse.json({ message, user: data.user });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
