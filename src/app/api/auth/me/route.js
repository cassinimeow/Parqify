import { NextResponse } from 'next/server';
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

    return NextResponse.json({
      user: result.user,
      profile: result.profile,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
