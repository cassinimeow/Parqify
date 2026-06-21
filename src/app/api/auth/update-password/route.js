import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { validatePasswordStrength } from '@/lib/auth';

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const supabase = await getSupabase();
    
    // Fetch the authenticated user and profile to validate credentials exclusion
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('full_name, pup_id')
      .eq('id', user.id)
      .single();

    const passwordValidationError = validatePasswordStrength(password, {
      email: user.email,
      fullName: profile?.full_name || '',
      pupId: profile?.pup_id || ''
    });

    if (passwordValidationError) {
      return NextResponse.json({ error: passwordValidationError }, { status: 400 });
    }
    
    // Auth middleware ensures this API is only callable if there's a valid session.
    // The updateUser method automatically updates the authenticated user's password.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
