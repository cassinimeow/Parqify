'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSupabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, activeTicket, loading, logout, refreshActiveTicket } = useAuth();
  
  // Local state for statistics and counts
  const [stats, setStats] = useState({
    mainOccupied: 4,
    mainTotal: 10,
    ceaOccupied: 2,
    ceaTotal: 6,
  });
  const [dbLoading, setDbLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Route protection guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch slot occupancy statistics from Supabase
  useEffect(() => {
    if (!user) return;
    
    async function fetchStats() {
      try {
        setDbLoading(true);
        const supabase = getSupabase();
        if (!supabase) return;

        // Query slots along with their lot relationships
        const { data: slots, error } = await supabase
          .from('parking_slots')
          .select('status, lot_id, parking_lots(name)');

        if (error) {
          console.error('Error fetching slot statistics:', error);
          return;
        }

        if (slots && slots.length > 0) {
          let mainOcc = 0;
          let mainTot = 0;
          let ceaOcc = 0;
          let ceaTot = 0;

          slots.forEach(slot => {
            const lotName = slot.parking_lots?.name || '';
            const isOccupied = slot.status !== 'AVAILABLE';
            
            if (lotName.includes('Main')) {
              mainTot++;
              if (isOccupied) mainOcc++;
            } else if (lotName.includes('CEA')) {
              ceaTot++;
              if (isOccupied) ceaOcc++;
            }
          });

          setStats({
            mainOccupied: mainOcc,
            mainTotal: mainTot || 10,
            ceaOccupied: ceaOcc,
            ceaTotal: ceaTot || 6,
          });
        }
      } catch (err) {
        console.error('Failed to query Supabase statistics:', err);
      } finally {
        setDbLoading(false);
      }
    }

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Real-time counter for the active ticket elapsed time
  useEffect(() => {
    if (!activeTicket || !activeTicket.entry_time) return;

    const timer = setInterval(() => {
      const entryDate = new Date(activeTicket.entry_time);
      const now = new Date();
      const diffMs = now - entryDate;

      if (diffMs < 0) {
        setElapsedTime('00:00:00');
        return;
      }

      const totalSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      const pad = (num) => String(num).padStart(2, '0');
      setElapsedTime(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTicket]);

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  // Render loading screen if verifying session
  if (loading || (!user && !loading)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <div className="h-16 w-16 rounded-xl bg-brand-gold-500 flex items-center justify-center font-bold text-3xl text-black font-outfit shadow-inner animate-pulse">
          P
        </div>
        <p className="mt-4 font-outfit text-brand-gold-400 tracking-wider text-sm animate-pulse">
          AUTHENTICATING SESSION...
        </p>
      </div>
    );
  }

  // Formatting date helper
  const formatEntryTime = (timeString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(timeString).toLocaleDateString('en-US', options);
    } catch {
      return timeString;
    }
  };

  const mainAvailable = stats.mainTotal - stats.mainOccupied;
  const ceaAvailable = stats.ceaTotal - stats.ceaOccupied;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-brand-maroon-950/90 border-b border-brand-gold-500/25 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-brand-gold-600 flex items-center justify-center font-bold text-lg text-black font-outfit shadow-inner">
            P
          </div>
          <div>
            <h1 className="text-xl font-bold font-outfit tracking-wide flex items-center">
              PARQIFY
              <span className="ml-2 px-1.5 py-0.5 text-[8px] font-semibold bg-brand-gold-500 text-brand-gold-950 rounded-full tracking-normal">
                STUDENT
              </span>
            </h1>
            <p className="text-[9px] text-zinc-400 font-sans">PUP Manila Smart Parking Portal</p>
          </div>
        </div>

        {/* Profile Card & Log Out */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-gray-200 font-outfit">{profile?.full_name || 'Student Account'}</p>
            <p className="text-[10px] text-zinc-400 font-mono">{profile?.pup_id || '2023-XXXXX-MN-0'}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-950 dark:hover:bg-red-950/25 px-3 py-1.5"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Dashboard Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">
        
        {/* Column 1 & 2: Main Session Visuals */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-maroon-900 to-brand-maroon-950 border border-brand-maroon-800 p-6 shadow-xl">
            <div className="absolute right-[-10%] top-[-20%] w-[40%] h-[150%] bg-brand-gold-500/5 rotate-12 blur-[40px] pointer-events-none"></div>
            <h2 className="text-2xl sm:text-3xl font-bold font-outfit text-white">
              Welcome Back, {profile?.full_name?.split(' ')[0] || 'User'}!
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm mt-1 leading-relaxed max-w-lg">
              Manage your parking tickets and slots in real-time. Use the QR ticket to scan at the gate scanners.
            </p>
          </div>

          {/* ACTIVE parking session card */}
          {activeTicket ? (
            <Card className="border border-emerald-550/30 bg-zinc-900/60 shadow-lg relative overflow-hidden">
              {/* Status Header Indicator */}
              <div className="bg-emerald-600/10 px-6 py-4 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Active Parking Session</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  REF: {activeTicket.id?.slice(0, 8).toUpperCase() || 'TICKET'}
                </span>
              </div>

              <CardContent className="p-6 grid sm:grid-cols-2 gap-6 items-center">
                {/* Visual slot indicator */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold block">Assigned Slot</span>
                    <span className="text-4xl font-extrabold font-outfit text-brand-gold-500 tracking-wide mt-1 block">
                      {activeTicket.parking_slots?.slot_name || 'N/A'}
                    </span>
                    <span className="text-sm font-semibold text-zinc-300 block mt-1">
                      {activeTicket.parking_slots?.parking_lots?.name || 'PUP Main Campus Lot'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/60 pt-4">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-bold block">Entry Time</span>
                      <span className="text-xs font-semibold text-zinc-300 block mt-0.5">
                        {formatEntryTime(activeTicket.entry_time)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-bold block">Elapsed Duration</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono block mt-0.5 animate-pulse">
                        {elapsedTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Mock QR / CTA to Digital Ticket Page */}
                <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center">
                  <div className="w-32 h-32 bg-white p-2 rounded-lg relative shadow-lg flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform duration-200" onClick={() => router.push('/ticket')}>
                    {/* Fake QR pattern */}
                    <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-90">
                      {Array.from({ length: 25 }).map((_, i) => {
                        const isFill = (i * 3 + 7) % 2 === 0 || i === 0 || i === 4 || i === 20 || i === 24;
                        return (
                          <div
                            key={i}
                            className={`rounded-sm ${isFill ? 'bg-zinc-900' : 'bg-transparent'}`}
                          ></div>
                        );
                      })}
                    </div>
                    <div className="absolute inset-0 m-auto w-8 h-8 bg-brand-maroon-800 rounded flex items-center justify-center text-white text-[7px] font-bold">PUP</div>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-2 font-sans">Click QR Code to expand digital ticket</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push('/ticket')}
                    className="w-full mt-4 text-xs font-bold"
                  >
                    View Ticket Screen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* NO active parking session empty state */
            <Card className="border border-dashed border-zinc-800 bg-zinc-900/10 shadow-sm p-8 text-center flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="text-lg font-bold font-outfit text-zinc-200">No Active Parking Session</h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  You do not currently have a parking slot reserved. Scan your ID at the gate or check available slots below.
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => router.push('/parking')}
                className="mt-2 text-xs font-bold px-6 shadow-lg shadow-brand-gold-950/20"
              >
                Find & Reserve Parking
              </Button>
            </Card>
          )}

        </div>

        {/* Column 3: Stats Widgets and Campus Parking Occupancy */}
        <div className="space-y-8">
          
          {/* Real-time occupancy widget */}
          <Card className="border border-zinc-800/80 bg-zinc-900/60 shadow-lg">
            <CardHeader className="border-b border-zinc-800/80 pb-4">
              <CardTitle className="text-sm font-bold tracking-wide flex items-center">
                <span className="w-1.5 h-4.5 bg-brand-gold-500 rounded mr-2 inline-block"></span>
                CAMPUS SLOT OCCUPANCY
              </CardTitle>
              <CardDescription className="text-[10px] text-zinc-400">
                Real-time vacancy counts for PUP Manila parking lots
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Lot 1: Main Lot */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-200">PUP Main Campus Lot</span>
                  <span className="font-bold font-mono text-brand-gold-400">
                    {mainAvailable} / {stats.mainTotal} Available
                  </span>
                </div>
                <div className="w-full h-2.5 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-maroon-700 transition-all duration-500"
                    style={{ width: `${(stats.mainOccupied / stats.mainTotal) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500">
                  <span>{stats.mainOccupied} slots occupied</span>
                  <span>{Math.round((mainAvailable / stats.mainTotal) * 100)}% vacant</span>
                </div>
              </div>

              {/* Lot 2: CEA Campus */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-200">PUP CEA Campus Lot</span>
                  <span className="font-bold font-mono text-brand-gold-400">
                    {ceaAvailable} / {stats.ceaTotal} Available
                  </span>
                </div>
                <div className="w-full h-2.5 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-maroon-700 transition-all duration-500"
                    style={{ width: `${(stats.ceaOccupied / stats.ceaTotal) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500">
                  <span>{stats.ceaOccupied} slots occupied</span>
                  <span>{Math.round((ceaAvailable / stats.ceaTotal) * 100)}% vacant</span>
                </div>
              </div>

              {dbLoading && (
                <div className="text-[10px] text-zinc-500 text-center animate-pulse flex items-center justify-center gap-1.5">
                  <svg className="animate-spin h-3 w-3 text-zinc-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Syncing with Supabase Live...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guidelines / Helper Card */}
          <Card className="border border-zinc-800/80 bg-zinc-900/60 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold tracking-wide">PARKING RULES</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-xs text-zinc-400 space-y-2 leading-relaxed">
              <p>• Reservations are valid for up to 3 hours.</p>
              <p>• Ensure your physical RFID tag is active on file.</p>
              <p>• Park strictly within your designated slot lines.</p>
              <p>• Show ticket barcode to exit gates.</p>
            </CardContent>
          </Card>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-[10px] text-zinc-500">
        <p>© 2026 Parqify Management System. Polytechnic University of the Philippines Manila.</p>
      </footer>
    </div>
  );
}
