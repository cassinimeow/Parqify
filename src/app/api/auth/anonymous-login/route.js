import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { isRateLimited } from '@/lib/rate-limit';

/**
 * POST /api/auth/anonymous-login
 * Signs in a guest user anonymously and registers their unique profile in public.users.
 */
export async function POST(request) {
  try {
    // 1. Apply rate limit check (Max 5 requests per 15 minutes per IP)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
               
    const { limited, resetTime } = isRateLimited(ip, 5, 15 * 60 * 1000);
    if (limited) {
      const retryAfter = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
      return NextResponse.json(
        { error: 'Too many visitor sessions requested from this IP. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }

    let captchaToken = null;
    try {
      const body = await request.json();
      captchaToken = body?.captchaToken;
    } catch (e) {
      // Ignore if body is empty
    }

    const supabase = await getSupabase();

    // 2. Sign in anonymously with Supabase Auth (passing captchaToken if configured)
    const { data, error } = await supabase.auth.signInAnonymously({
      options: { captchaToken }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data.user;

    // Update session user agent if provided
    const userAgent = request.headers.get('user-agent');
    if (data.session && userAgent) {
      try {
        const payload = JSON.parse(Buffer.from(data.session.access_token.split('.')[1], 'base64').toString());
        const sessionId = payload.session_id;
        if (sessionId) {
          await supabase.rpc('update_session_user_agent', {
            target_session_id: sessionId,
            browser_user_agent: userAgent
          });
        }
      } catch (e) {
        console.error('Failed to update session user agent:', e);
      }
    }

    // 3. Fetch the profile that was automatically created by the database trigger
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to fetch auto-created guest profile:', profileError);
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
