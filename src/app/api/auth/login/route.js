import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, captchaToken } = body;

    const userAgent = request.headers.get('user-agent');

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await loginUser({ email, password, captchaToken, userAgent });

    if (result.error) {
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
