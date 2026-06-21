import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
export async function GET() {
  try {
    const result = await getCurrentUser();

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const hasRememberMe = cookieStore.get('sb-remember-me')?.value === 'true';

    return NextResponse.json({
      user: result.user,
      profile: result.profile,
      rememberMe: hasRememberMe,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
