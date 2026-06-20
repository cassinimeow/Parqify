"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Clock, Car, CheckCircle, ChevronLeft, Ticket as TicketIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Button from '@/components/ui/Button';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function DigitalTicket() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!ticket || ticket.status !== 'RESERVED') {
      setCountdown('');
      return;
    }

    const expiryTime = new Date(ticket.created_at).getTime() + 10 * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setCountdown('00:00');
        clearInterval(interval);
        // Expire the ticket in the local UI state
        setTicket(null);
      } else {
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, ticketRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/user/tickets')
        ]);
        
        if (meRes.status === 401 || ticketRes.status === 401) {
          router.push('/login');
          return;
        }

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
          setProfile(meData.profile);
        }
        
        if (!ticketRes.ok) {
          throw new Error('Failed to fetch tickets');
        }

        const data = await ticketRes.json();
        
        // Find the active ticket
        const activeTicket = data.tickets?.find(t => t.status === 'ACTIVE' || t.status === 'RESERVED');
        
        if (activeTicket) {
          setTicket(activeTicket);
        }
        
      } catch (err) {
        console.error(err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Realtime subscription for this specific ticket updates (overrides, checkout, scans, etc.)
  useEffect(() => {
    if (!supabase || !ticket?.id) return;

    const channel = supabase
      .channel(`ticket-single-${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticket.id}`,
        },
        (payload) => {
          if (payload.new) {
            setTicket(prev => {
              if (!prev || prev.id !== payload.new.id) return prev;
              return {
                ...prev,
                ...payload.new,
                parking_slots: prev.parking_slots // Preserve relation data
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticket?.id]);

  const handleSimulateScan = async () => {
    if (!ticket) return;
    setScanLoading(true);
    
    try {
      const response = await fetch('/api/parking/enter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticket_id: ticket.id })
      });
      
      if (!response.ok) {
        throw new Error('Scan failed');
      }

      setTicket(prev => ({ 
        ...prev, 
        status: 'ACTIVE',
        entry_time: new Date().toISOString()
      }));
      
    } catch (err) {
      console.error(err);
      setError('Scan failed. Please try again.');
    } finally {
      setScanLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!ticket) return;
    setCheckoutLoading(true);
    
    try {
      const response = await fetch('/api/parking/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticket_id: ticket.id })
      });
      
      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      setTicket(prev => ({ 
        ...prev, 
        status: 'COMPLETED', 
        exit_time: new Date().toISOString() 
      }));
      
    } catch (err) {
      console.error(err);
      setError('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return <LoadingScreen message="Loading Ticket..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-gray-100 font-sans relative flex flex-col">
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-maroon-900/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-gold-900/10 blur-[100px]" />
      </div>

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 dark:bg-black/40 border-b border-gray-100 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-maroon-800 to-brand-maroon-900 flex items-center justify-center shadow-md hidden sm:flex">
                <TicketIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold font-outfit tracking-tight text-gray-900 dark:text-white">Your Ticket</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
              {profile?.full_name || user?.email}
            </span>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-maroon-50 dark:bg-zinc-800 flex items-center justify-center border border-brand-maroon-100 dark:border-white/10">
                <span className="text-xs font-bold text-brand-maroon-800 dark:text-zinc-400">
                  {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {!ticket ? (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
          <Car className="w-16 h-16 text-gray-400 dark:text-zinc-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">No Active Parking</h2>
          <p className="text-gray-500 dark:text-zinc-400 mt-2">You don't have an active parking session.</p>
          <button 
            onClick={() => router.push('/parking')}
            className="mt-6 px-6 py-2 bg-brand-maroon-800 dark:bg-brand-maroon-700 text-white rounded-lg hover:bg-brand-maroon-900 transition-colors shadow-md active:scale-95 font-semibold"
          >
            Find Parking
          </button>
        </main>
      ) : (
        <main className="max-w-md mx-auto w-full p-4 md:p-8 relative z-10 flex-1">

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Ticket Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-zinc-800 backdrop-blur-sm">
          
          {/* Top colored band */}
          <div className="h-4 bg-gradient-to-r from-red-800 to-yellow-500"></div>
          
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
                <div className="flex items-center mt-1">
                  {ticket.status === 'ACTIVE' ? (
                    <span className="flex items-center text-sm font-semibold text-green-600 bg-green-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-1 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-emerald-500 mr-2 animate-pulse"></span>
                      Currently Parked
                    </span>
                  ) : ticket.status === 'RESERVED' ? (
                    <span className="flex items-center text-sm font-semibold text-yellow-600 bg-yellow-50 dark:bg-brand-gold-950/40 dark:text-brand-gold-400 px-2 py-1 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-brand-gold-500 mr-2 animate-pulse"></span>
                      Expires in: {countdown || '10:00'}
                    </span>
                  ) : ticket.status === 'OVERRIDDEN' ? (
                    <span className="flex items-center text-[10px] font-bold text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-md uppercase tracking-wider">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Overridden by Super Admin
                    </span>
                  ) : (
                    <span className="flex items-center text-sm font-semibold text-gray-600 bg-gray-100 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-1 rounded-md">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {ticket.status === 'EXPIRED' ? 'Expired' : 'Completed'}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Slot</p>
                <p className="text-3xl font-black text-brand-maroon-800 dark:text-brand-maroon-400">{ticket?.parking_slots?.slot_name || 'N/A'}</p>
              </div>
            </div>

            {/* Location & Time Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center p-3 bg-gray-50 dark:bg-zinc-950/50 rounded-xl">
                <MapPin className="w-5 h-5 text-brand-maroon-800 dark:text-brand-maroon-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Location</p>
                  <p className="text-sm font-semibold dark:text-gray-200">{ticket?.parking_slots?.parking_lots?.name || 'PUP Manila'}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 dark:bg-zinc-950/50 rounded-xl">
                <Clock className="w-5 h-5 text-brand-maroon-800 dark:text-brand-maroon-500 mr-3" />
                <div className="flex-1 flex justify-between">
                  {ticket.status === 'RESERVED' ? (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Reserved At</p>
                      <p className="text-sm font-semibold dark:text-gray-200">
                        {formatTime(ticket.created_at)} <span className="text-xs font-normal text-gray-500 dark:text-zinc-500 ml-1">{formatDate(ticket.created_at)}</span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Entry Time (Occupied)</p>
                      <p className="text-sm font-semibold dark:text-gray-200">
                        {formatTime(ticket.entry_time) || '--:--'} <span className="text-xs font-normal text-gray-500 dark:text-zinc-500 ml-1">{formatDate(ticket.entry_time)}</span>
                      </p>
                    </div>
                  )}
                  {ticket.exit_time && (
                    <div className="text-right border-l border-gray-200 dark:border-zinc-700 pl-4">
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {ticket.status === 'EXPIRED' ? 'Expired At' : ticket.status === 'OVERRIDDEN' ? 'Cancelled At' : 'Exit Time'}
                      </p>
                      <p className="text-sm font-semibold dark:text-gray-200">
                        {formatTime(ticket.exit_time)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center border-t border-dashed border-gray-300 dark:border-zinc-700 pt-8 pb-4 relative">
              {/* Decorative cutout circles for ticket effect */}
              <div className="absolute top-0 left-0 w-6 h-6 bg-gray-50 dark:bg-[#09090b] rounded-full -translate-x-10 -translate-y-3"></div>
              <div className="absolute top-0 right-0 w-6 h-6 bg-gray-50 dark:bg-[#09090b] rounded-full translate-x-10 -translate-y-3"></div>
              
              <div className="bg-white dark:bg-gray-100 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                <QRCodeSVG 
                  value={ticket.id} 
                  size={160} 
                  level="H"
                  fgColor="#800000" // PUP Maroon
                  imageSettings={{
                    src: "/parqify.ico", // Using the existing ico
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-4 font-mono">{ticket.id.split('-').shift()}</p>
              <p className="text-sm text-center text-gray-500 dark:text-zinc-400 mt-2">
                Scan this code at the exit gate
              </p>
            </div>
          </div>
        </div>

        {/* Simulate Scan Button */}
        {ticket.status === 'RESERVED' && (
          <Button
            onClick={handleSimulateScan}
            isLoading={scanLoading}
            className="w-full mt-6 py-4 text-lg shadow-lg !bg-blue-600 hover:!bg-blue-700 text-white"
          >
            Simulate Gate Scan
          </Button>
        )}

        {/* Checkout Button */}
        {(ticket.status === 'ACTIVE' || ticket.status === 'RESERVED') && (
          <Button
            onClick={handleCheckout}
            isLoading={checkoutLoading}
            variant="primary"
            className="w-full mt-6 py-4 text-lg shadow-lg"
          >
            Complete Parking & Checkout
          </Button>
        )}
      </main>
      )}
    </div>
  );
}
