'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in ms
const PING_INTERVAL = 3 * 60 * 1000; // 3 minutes in ms

export default function IdleDetector() {
  const pathname = usePathname();
  const router = useRouter();
  const timeoutTimerRef = useRef(null);
  const pingTimerRef = useRef(null);
  const lastActivityRef = useRef(0);
  const hasBeenActiveSincePingRef = useRef(false);

  // Protected paths where auto-logout should apply
  const isProtectedPath = pathname && 
    !['/', '/login', '/api'].some(p => pathname === p || pathname.startsWith('/api'));

  useEffect(() => {
    if (!isProtectedPath) {
      // Clear timers if navigating to public pages
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      return;
    }

    const logoutUser = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        // Redirect to homepage with timeout message
        window.location.href = '/?reason=timeout';
      } catch (err) {
        console.error('Failed to log out after inactivity:', err);
      }
    };

    const resetTimeout = () => {
      lastActivityRef.current = Date.now();
      hasBeenActiveSincePingRef.current = true;
      
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = setTimeout(() => {
        logoutUser();
      }, INACTIVITY_TIMEOUT);
    };

    // Listeners for user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    // Start initial timeout timer
    resetTimeout();

    // Start periodic ping to extend the Supabase session if user has been active
    pingTimerRef.current = setInterval(async () => {
      if (hasBeenActiveSincePingRef.current) {
        // Reset activity flag for next interval
        hasBeenActiveSincePingRef.current = false;
        try {
          // A lightweight API call to refresh session and touch the cookies
          const res = await fetch('/api/auth/me');
          if (res.status === 401) {
            // User was already logged out or deleted
            window.location.href = '/';
          }
        } catch (err) {
          console.error('Failed to touch session:', err);
        }
      }
    }, PING_INTERVAL);

    return () => {
      // Cleanup event listeners and timers
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    };
  }, [isProtectedPath, pathname, router]);

  return null;
}
