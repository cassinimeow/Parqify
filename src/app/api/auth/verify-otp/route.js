import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

/**
 * POST /api/auth/verify-otp
 * Verifies a 6-digit OTP token for signup, email change, or password reset.
 * Body: { email: string, token: string, type: 'signup' | 'email_change' | 'recovery' }
 */
export async function POST(request) {
  try {
    const { email, token, type } = await request.json();

    if (!email || !token || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If verification is for email_change, update the user profile email in the database
    if (type === 'email_change' && data.user) {
      await supabase
        .from('users')
        .update({ email: data.user.email })
        .eq('id', data.user.id);
    }

    return NextResponse.json({ 
      message: 'Verification successful', 
      user: data.user 
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
