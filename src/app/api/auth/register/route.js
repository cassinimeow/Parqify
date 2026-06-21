import { NextResponse } from 'next/server';
import { registerUser, validatePasswordStrength } from '@/lib/auth';

/**
 * POST /api/auth/register
 * Body: { email, password, full_name, pup_id, captchaToken }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, full_name, pup_id, captchaToken } = body;

    // Validate required fields
    if (!email || !password || !full_name || !pup_id) {
      return NextResponse.json(
        { error: 'All fields are required: email, password, full_name, pup_id' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password complexity
    const passwordValidationError = validatePasswordStrength(password, { 
      email, 
      fullName: full_name, 
      pupId: pup_id 
    });
    if (passwordValidationError) {
      return NextResponse.json(
        { error: passwordValidationError },
        { status: 400 }
      );
    }

    // Validate full name format (only letters, spaces, dots, hyphens, and Filipino letters ñ/Ñ)
    const nameRegex = /^[a-zA-ZñÑ\s.\-]+$/;
    if (!nameRegex.test(full_name)) {
      return NextResponse.json(
        { error: 'Full name cannot contain numbers or special characters' },
        { status: 400 }
      );
    }

    // Validate PUP ID format (only alphanumeric and hyphens)
    const pupIdRegex = /^[a-zA-Z0-9\-]+$/;
    if (!pupIdRegex.test(pup_id)) {
      return NextResponse.json(
        { error: 'PUP ID can only contain letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const result = await registerUser({
      email,
      password,
      fullName: full_name,
      pupId: pup_id,
      captchaToken,
    });

    if (result.error) {
      let errorMessage = result.error;
      const lowerError = errorMessage.toLowerCase();
      
      if (lowerError.includes('already registered') || lowerError.includes('already exists') || lowerError.includes('duplicate key') || lowerError.includes('unique constraint')) {
        errorMessage = 'Account is already existing';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: result.user,
        session: result.session,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
