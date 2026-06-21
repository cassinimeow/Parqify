import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginUser } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, captchaToken, rememberMe } = body;

    const userAgent = request.headers.get('user-agent');
    
    const cookieStore = await cookies();
    if (rememberMe) {
      cookieStore.set('sb-remember-me', 'true', {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
    } else {
      cookieStore.delete('sb-remember-me');
    }

    // Validate required fields
    if (!email || !password) {
      cookieStore.delete('sb-remember-me');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await loginUser({ email, password, captchaToken, userAgent });

    if (result.error) {
      cookieStore.delete('sb-remember-me');
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Login successful',
      user: result.user,
      profile: result.profile,
      session: result.session,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
