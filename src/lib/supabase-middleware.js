import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  // Skip middleware for Next.js background prefetches to drastically improve performance
  if (request.headers.get('next-router-prefetch') || request.headers.get('purpose') === 'prefetch') {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            const opts = { ...options };
            if (opts.maxAge !== 0) {
              opts.maxAge = 900;
              opts.expires = new Date(Date.now() + 900 * 1000);
            }
            opts.path = '/';
            supabaseResponse.cookies.set(name, value, opts);
          });
        },
      },
    }
  );

  // IMPORTANT: DO NOT WRITE ANY LOGIC BETWEEN createServerClient and supabase.auth.getSession()
  // Refresh the session token locally
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If a session exists, extend the cookie lifetime (sliding session window)
  if (session) {
    const supabaseCookies = request.cookies.getAll().filter(c => c.name.startsWith('sb-'));
    supabaseCookies.forEach(cookie => {
      supabaseResponse.cookies.set({
        name: cookie.name,
        value: cookie.value,
        maxAge: 900,
        expires: new Date(Date.now() + 900 * 1000),
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
    });
  }

  return supabaseResponse;
}
