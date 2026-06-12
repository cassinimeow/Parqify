import { createClient } from '@supabase/supabase-js';

let _supabase = null;

/**
 * Returns the Supabase client instance (lazy-initialized).
 * This prevents build-time crashes when env vars are not yet configured.
 */
export function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Supabase credentials are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
      );
      // Return a dummy object during build to prevent crashes
      return null;
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Backward-compatible export — use getSupabase() in new code
export const supabase = null; // Lazy-only; import getSupabase() instead
