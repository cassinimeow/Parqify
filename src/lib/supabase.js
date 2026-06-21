import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';

/**
 * Returns the Supabase SSR server client instance.
 * Automatically handles server-side cookies for sessions.
 */
export async function getSupabase() {
  const cookieStore = await cookies();
  const globalHeaders = {};

  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent');
    const clientIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');
    
    if (userAgent) {
      globalHeaders['User-Agent'] = userAgent;
    }
    if (clientIp) {
      // Forward the original client IP (split if it contains multiple proxy hops)
      globalHeaders['X-Forwarded-For'] = clientIp.split(',')[0].trim();
    }
  } catch (error) {
    // headers() might throw in non-request contexts
  }

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
            const hasRememberMe = cookieStore.get('sb-remember-me')?.value === 'true';
            const maxAgeVal = hasRememberMe ? 30 * 24 * 60 * 60 : 900;
            cookiesToSet.forEach(({ name, value, options }) => {
              const opts = { ...options };
              if (opts.maxAge !== 0) {
                opts.maxAge = maxAgeVal;
                opts.expires = new Date(Date.now() + maxAgeVal * 1000);
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
      global: {
        headers: globalHeaders,
      }
    }
  );
}

/**
 * Checks and expires tickets that have been in RESERVED status for more than 10 minutes.
 * Frees up the occupied parking slots back to AVAILABLE and sets the tickets to EXPIRED.
 */
export async function expireOldReservations(supabase) {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    // 1. Get all tickets that are RESERVED and created more than 10 minutes ago
    const { data: expiredTickets, error: fetchError } = await supabase
      .from('tickets')
      .select('id, slot_id')
      .eq('status', 'RESERVED')
      .lt('created_at', tenMinutesAgo);
      
    if (fetchError || !expiredTickets || expiredTickets.length === 0) {
      return;
    }
    
    const ticketIds = expiredTickets.map(t => t.id);
    const slotIds = expiredTickets.map(t => t.slot_id).filter(Boolean);
    
    // 2. Update tickets status to EXPIRED and set exit_time to current time
    await supabase
      .from('tickets')
      .update({ 
        status: 'EXPIRED',
        exit_time: new Date().toISOString()
      })
      .in('id', ticketIds);
      
    // 3. Update parking_slots status to AVAILABLE
    if (slotIds.length > 0) {
      await supabase
        .from('parking_slots')
        .update({ status: 'AVAILABLE' })
        .in('id', slotIds);
    }
  } catch (err) {
    console.error('Error in expireOldReservations:', err);
  }
}

