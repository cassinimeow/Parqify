import { NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';

/**
 * POST /api/auth/logout
 */
export async function POST() {
  try {
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
