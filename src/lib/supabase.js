import { createClient } from '@supabase/supabase-js';

let _supabase = null;

/**
 * Returns the Supabase client instance (lazy-initialized).
 * This prevents build-time crashes when env vars are not yet configured.
 */
export function getSupabase() {
  if (!globalThis._supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Supabase credentials are missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
      );
      return null;
    }

    globalThis._supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return globalThis._supabaseInstance;
}

// Backward-compatible export — use getSupabase() in new code
export const supabase = null; // Lazy-only; import getSupabase() instead
