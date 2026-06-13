'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';

const AuthContext = createContext({
  user: null,
  profile: null,
  activeTicket: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshActiveTicket: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        setLoading(true);
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setProfile(data.profile);
          if (data.profile?.id) {
            await fetchActiveTicket(data.profile.id);
          }
        } else {
          // If api/auth/me fails, try reading from local storage fallback
          const localUser = localStorage.getItem('parqify_user');
          const localProfile = localStorage.getItem('parqify_profile');
          if (localUser && localProfile) {
            const parsedUser = JSON.parse(localUser);
            const parsedProfile = JSON.parse(localProfile);
            setUser(parsedUser);
            setProfile(parsedProfile);
            await fetchActiveTicket(parsedProfile.id);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  // Fetch active ticket from Supabase database
  const fetchActiveTicket = async (userId) => {
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          id,
          entry_time,
          status,
          parking_slots (
            id,
            slot_name,
            parking_lots (
              id,
              name
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (ticketError) {
        console.error('Error fetching active ticket:', ticketError);
      } else {
        setActiveTicket(data);
      }
    } catch (err) {
      console.error('Active ticket fetch error:', err);
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setUser(data.user);
      setProfile(data.profile);
      
      // Store in localStorage for frontend persistence
      localStorage.setItem('parqify_user', JSON.stringify(data.user));
      localStorage.setItem('parqify_profile', JSON.stringify(data.profile));

      if (data.profile?.id) {
        await fetchActiveTicket(data.profile.id);
      }
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (email, password, fullName, pupId) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          pup_id: pupId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Automatically log in the user after successful registration
      return await login(email, password);
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API warning:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setActiveTicket(null);
      localStorage.removeItem('parqify_user');
      localStorage.removeItem('parqify_profile');
    }
  };

  const refreshActiveTicket = async () => {
    if (profile?.id) {
      await fetchActiveTicket(profile.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activeTicket,
        loading,
        error,
        login,
        register,
        logout,
        refreshActiveTicket,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
