import { getSupabase } from './supabase';

/**
 * Register a new user with Supabase Auth and create a profile in public.users.
 * @param {{ email: string, password: string, fullName: string, pupId: string }} params
 * @returns {{ user: object, session: object } | { error: string }}
 */
export async function registerUser({ email, password, fullName, pupId }) {
  const supabase = getSupabase();

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
      data: {
        full_name: fullName,
        pup_id: pupId,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Step 2: Insert profile row into public.users linked to the auth user
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id, // Use the same UUID from Supabase Auth
    full_name: fullName,
    pup_id: pupId,
    email: email,
  });

  if (profileError) {
    return { error: profileError.message };
  }

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
export async function loginUser({ email, password }) {
  const supabase = getSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
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
  const supabase = getSupabase();
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
  const supabase = getSupabase();
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
