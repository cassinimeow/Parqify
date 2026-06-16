import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Returns the Supabase SSR server client instance.
 * Automatically handles server-side cookies for sessions.
 */
export async function getSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const opts = { ...options };
              if (opts.maxAge !== 0) {
                opts.maxAge = 604800;
                opts.expires = new Date(Date.now() + 604800 * 1000);
              }
              opts.path = '/';
              cookieStore.set(name, value, opts);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
