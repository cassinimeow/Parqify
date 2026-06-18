import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { email, captchaToken } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = await getSupabase();
    
    // Construct the callback URL
    const { origin } = new URL(request.url);
    const redirectTo = `${origin}/api/auth/callback?next=/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
      captchaToken,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password reset email sent' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
