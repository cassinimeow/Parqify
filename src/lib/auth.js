import { getSupabase } from './supabase';

/**
 * Register a new user with Supabase Auth and create a profile in public.users.
 * @param {{ email: string, password: string, fullName: string, pupId: string }} params
 * @returns {{ user: object, session: object } | { error: string }}
 */
export async function registerUser({ email, password, fullName, pupId, captchaToken, userAgent }) {
  const supabase = await getSupabase();

  // Step -1: Call DB cleaner to wipe old unconfirmed accounts matching email or PUP ID
  await supabase.rpc('check_and_delete_unconfirmed_user', { 
    email_to_check: email, 
    pup_id_to_check: pupId 
  });

  // Step 0: Check if email or pup_id already exists in public.users to prevent ghost auth accounts
  const { data: existingUsers } = await supabase
    .from('users')
    .select('email, pup_id')
    .or(`email.eq.${email},pup_id.eq.${pupId}`)
    .limit(1);

  if (existingUsers && existingUsers.length > 0) {
    const existing = existingUsers[0];
    if (existing.email === email) {
      return { error: 'Account with this email already exists' };
    }
    if (existing.pup_id === pupId) {
      return { error: 'Account with this PUP ID already exists' };
    }
    return { error: 'Account is already existing' };
  }

  // Step 1: Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      captchaToken,
      data: {
        full_name: fullName,
        pup_id: pupId,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Update session user agent if provided
  if (authData.session && userAgent) {
    try {
      const payload = JSON.parse(Buffer.from(authData.session.access_token.split('.')[1], 'base64').toString());
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

  // Profile creation is now handled securely inside the database via a Postgres Trigger 
  // (handle_new_user) listening to auth.users, which bypasses RLS issues.

  return {
    user: authData.user,
    session: authData.session,
  };
}

/**
 * Log in an existing user with email and password.
 * @param {{ email: string, password: string }} params
 * @returns {{ user: object, session: object } | { error: string }}
 */
export async function loginUser({ email, password, captchaToken, userAgent }) {
  const supabase = await getSupabase();

  // Step 1: Check if the user exists in our public schema to provide better error messages
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  if (!existingUser) {
    return { error: 'Account with this email does not exist. Please sign up first.' };
  }

  // Step 2: Attempt to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken },
  });

  if (error) {
    // Since we know the email exists, a generic 'Invalid login credentials' means the password is wrong
    if (error.message === 'Invalid login credentials') {
      return { error: 'Incorrect password. Please try again.' };
    }
    return { error: error.message };
  }

  // Update session user agent if provided
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

  // Fetch the user's profile from public.users
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    user: data.user,
    profile: profileError ? null : profile,
    session: data.session,
  };
}

/**
 * Log out the current user.
 * @returns {{ success: boolean } | { error: string }}
 */
export async function logoutUser() {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Get the currently authenticated user and their profile.
 * @returns {{ user: object, profile: object } | { error: string }}
 */
export async function getCurrentUser() {
  const supabase = await getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: error?.message || 'Not authenticated' };
  }

  // Fetch profile from public.users
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user,
    profile: profileError ? null : profile,
  };
}

export { validatePasswordStrength } from './validation';

