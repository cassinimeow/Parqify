import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * POST /api/auth/anonymous-login
 * Signs in a guest user anonymously and registers their unique profile in public.users.
 */
export async function POST() {
  try {
    const supabase = await getSupabase();

    // 1. Sign in anonymously with Supabase Auth
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data.user;

    // 2. Check if a profile already exists for this anonymous user (precautionary)
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    let profile = existingProfile;

    if (!existingProfile) {
      // Generate a unique PUP-ID style guest tag using the first 4 characters of their UUID
      const guestSuffix = user.id.substring(0, 4).toUpperCase();
      const guestPupId = `VISITOR-${guestSuffix}`;

      // Insert profile row in public.users
      const { data: newProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          full_name: 'Guest Visitor',
          pup_id: guestPupId,
          email: null, // Anonymous users have no email
        })
        .select()
        .single();

      if (profileError) {
        // If profile creation fails, we still return success but profile is null
        console.error('Failed to create guest profile:', profileError);
      } else {
        profile = newProfile;
      }
    }

    return NextResponse.json({
      message: 'Anonymous login successful',
      user,
      profile,
    });
  } catch (err) {
    console.error('Anonymous login error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
