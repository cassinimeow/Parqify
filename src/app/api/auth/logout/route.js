import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logoutUser } from '@/lib/auth';

/**
 * POST /api/auth/logout
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('sb-remember-me');

    const result = await logoutUser();

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Logged out successfully',
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
