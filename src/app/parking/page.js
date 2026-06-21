'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { QRCodeSVG } from 'qrcode.react';

export default function ParkingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingLots, setIsLoadingLots] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [error, setError] = useState('');
  const [successTicket, setSuccessTicket] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);

  // Refs for stale closures in intervals
  const selectedSlotRef = useRef(null);
  const isBookingRef = useRef(false);

  useEffect(() => {
    selectedSlotRef.current = selectedSlot;
  }, [selectedSlot]);

  useEffect(() => {
    isBookingRef.current = isBooking;
  }, [isBooking]);

  // For real-time updates polling
  const pollingRef = useRef(null);

  // Authenticate user
  useEffect(() => {
    async function fetchUser() {
      try {
        const [meRes, lotsRes, ticketRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/parking/lots'),
          fetch('/api/user/tickets', { cache: 'no-store' })
        ]);

        if (!meRes.ok) {
          router.push('/login');
          return;
        }

        const meData = await meRes.json();
        setUser(meData.user);
        setProfile(meData.profile);

        if (lotsRes.ok) {
          const lotsData = await lotsRes.json();
          setLots(lotsData.lots || []);
          if (lotsData.lots && lotsData.lots.length > 0) {
            setSelectedLot(lotsData.lots[0]);
          }
        }

        if (ticketRes.ok) {
          const ticketData = await ticketRes.json();
          const active = ticketData.tickets?.find(t => t.status === 'ACTIVE' || t.status === 'RESERVED');
          setActiveTicket(active || null);
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setIsLoadingUser(false);
      }
    }
    fetchUser();
  }, [router]);

  // Fetch parking lots
  async function fetchLots(autoSelectFirst = false) {
    setIsLoadingLots(true);
    setError('');
    try {
      const res = await fetch('/api/parking/lots');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch parking lots');
      }
      setLots(data.lots || []);
      if (data.lots && data.lots.length > 0) {
        if (autoSelectFirst || !selectedLot) {
          setSelectedLot(data.lots[0]);
        } else {
          // Keep current lot selected but update its data
          const updated = data.lots.find(l => l.id === selectedLot.id);
          if (updated) setSelectedLot(updated);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingLots(false);
    }
  }

  useEffect(() => {
    fetchLots(true);
  }, []);

  // Fetch slots for selected lot
  async function fetchSlots(lotId, quiet = false) {
    if (!quiet) setIsLoadingSlots(true);
    try {
      const res = await fetch(`/api/parking/slots/${lotId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch slots');
      }
      
      const newSlots = data.slots || [];
      setSlots(newSlots);

      // If the currently selected slot was booked or occupied in the background, clear selection
      const currentSelected = selectedSlotRef.current;
      if (currentSelected && !isBookingRef.current) {
        const currentSelectedInNewData = newSlots.find(s => s.id === currentSelected.id);
        if (currentSelectedInNewData && currentSelectedInNewData.status !== 'AVAILABLE') {
          setSelectedSlot(null);
          setError(`Slot ${currentSelected.slot_name} is no longer available.`);
        }
      }
    } catch (err) {
      if (!quiet) setError(err.message);
    } finally {
      if (!quiet) setIsLoadingSlots(false);
    }
  }

  // Handle lot changes & set up 3-second polling interval (Task 5.3)
  useEffect(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    if (selectedLot) {
      fetchSlots(selectedLot.id);
      setSelectedSlot(null); // Reset selected slot

      // Setup 3-second polling
      pollingRef.current = setInterval(() => {
        fetchSlots(selectedLot.id, true);
      }, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [selectedLot]);



  // Book parking slot
  async function handleBookSlot() {
    if (!selectedLot || !selectedSlot || isBooking) return;
    setIsBooking(true);
    setError('');
    try {
      const res = await fetch('/api/parking/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lot_id: selectedLot.id,
          slot_id: selectedSlot.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setSuccessTicket({
        id: data.ticket.id,
        slotName: selectedSlot.slot_name,
        lotName: selectedLot.name,
        reservationTime: data.ticket.created_at || new Date().toISOString(),
        pupId: profile?.pup_id || 'N/A'
      });
      setActiveTicket(data.ticket);
      
      // Update slots display immediately
      await fetchSlots(selectedLot.id, true);
      setSelectedSlot(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsBooking(false);
    }
  }

  if (isLoadingUser) {
    return <LoadingScreen message="Loading Parking Zones..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-maroon-50/30 via-white to-brand-gold-50/30 dark:from-brand-maroon-950 dark:via-[#09090b] dark:to-brand-gold-950 relative overflow-hidden flex flex-col">
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-maroon-900/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-gold-900/10 blur-[100px]" />
      </div>

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 dark:bg-black/40 border-b border-gray-100 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-maroon-800 to-brand-maroon-900 flex items-center justify-center shadow-md hidden sm:flex">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <span className="text-lg font-bold font-outfit tracking-tight text-gray-900 dark:text-white">Parking Lots</span>
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

      {/* Main Grid Content */}
      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-8 flex-1 w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-outfit tracking-tight text-gray-900 dark:text-white">
              Find & Reserve Slot
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Select a campus parking lot, pick an available slot, and confirm your booking.
            </p>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-sm text-red-700 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div className="flex-1 font-sans">{error}</div>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Loading Lots Overlay */}
        {isLoadingLots ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-brand-maroon-800 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-gray-500">Loading campus lots...</p>
          </div>
        ) : lots.length === 0 ? (
          /* Empty DB State */
          <Card className="border-0 shadow-lg text-center p-12 max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto border border-gray-100 dark:border-white/5">
              <svg className="w-8 h-8 text-gray-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-outfit">No Parking Lots Found</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                There are currently no parking lots available in the system. An administrator must add campus locations via the Admin Space Management console.
              </CardDescription>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Lots list and parking grid Map (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Lot Selector Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {lots.map((lot) => {
                  const isActive = selectedLot?.id === lot.id;
                  return (
                    <Card
                      key={lot.id}
                      onClick={() => setSelectedLot(lot)}
                      className={`cursor-pointer transition-all duration-300 border ${
                        isActive
                          ? 'border-brand-maroon-800 bg-brand-maroon-50/30 shadow-md scale-[1.02] dark:border-brand-gold-500/80 dark:bg-brand-gold-500/10 ring-2 ring-brand-maroon-800/20 dark:ring-brand-gold-500/20'
                          : 'border-gray-200 hover:border-gray-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50 hover:bg-gray-50 dark:hover:bg-zinc-800/80'
                      }`}
                    >
                      <div className="p-5 sm:p-6 flex flex-col justify-between h-full min-h-[110px]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 ${
                              isActive ? 'text-brand-maroon-800 dark:text-brand-gold-400' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                              </svg>
                              Campus Lot
                            </span>
                            <h4 className={`font-bold font-outfit text-base mt-1.5 line-clamp-1 ${
                              isActive ? 'text-brand-maroon-950 dark:text-brand-gold-100' : 'text-gray-900 dark:text-white'
                            }`}>
                              {lot.name}
                            </h4>
                          </div>
                          
                          {/* Active Ping Indicator */}
                          {isActive && (
                            <span className="relative flex h-3 w-3 shrink-0 mt-1 mr-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-maroon-400 dark:bg-brand-gold-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-maroon-800 dark:bg-brand-gold-500"></span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest ${
                            isActive 
                              ? 'bg-brand-maroon-800 text-white dark:bg-brand-gold-500 dark:text-brand-gold-950 shadow-sm'
                              : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                            {lot.total_slots} {lot.total_slots === 1 ? 'SLOT' : 'SLOTS'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Parking Lot Map/Grid Wrapper */}
              <Card className="border-0 shadow-lg relative overflow-hidden">
                <CardHeader className="border-b border-gray-50 dark:border-white/10 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-xl">
                        {selectedLot ? selectedLot.name : 'Select a Lot'}
                      </CardTitle>
                      <CardDescription>
                        Interactive 2D top-down grid representation. Green slots are available.
                      </CardDescription>
                    </div>

                    {/* Status Legends */}
                    <div className="flex gap-4 text-xs font-sans text-gray-500 dark:text-zinc-400 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600 block shadow-sm" />
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-red-500 border border-red-600 block shadow-sm" />
                        <span>Occupied</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-600 block shadow-sm" />
                        <span>Reserved</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 md:p-8 bg-gray-50/30 dark:bg-zinc-900/10 min-h-[350px] flex items-center justify-center">
                  {isLoadingSlots ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-brand-maroon-800 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-gray-400 font-sans">Updating slots visualizer...</p>
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-gray-400">No slots created for this lot yet.</p>
                  ) : (
                    /* The 2D top-down visual map design */
                    <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-2 sm:p-6 mt-6 sm:mt-4 shadow-inner relative">
                      
                      {/* Top/Gate entry indicator */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-brand-gold-500 text-brand-gold-950 text-[10px] font-extrabold uppercase rounded-full shadow-md tracking-wider border border-brand-gold-400 select-none whitespace-nowrap">
                        ▲ PUP GATE - ENTRY
                      </div>

                      {/* Main road lane in center */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 border-dashed border-r border-l border-zinc-200 dark:border-zinc-800 flex items-center justify-center pointer-events-none select-none">
                        <div className="h-full w-[2px] bg-dashed border-zinc-300 dark:border-zinc-700 flex flex-col justify-around py-8 text-[10px] font-extrabold text-zinc-300 dark:text-zinc-700 writing-mode-vertical uppercase tracking-widest leading-none">
                          <span>D R I V E W A Y</span>
                        </div>
                      </div>

                      {/* Two Columns Grid for Parking Spaces */}
                      <div className="grid grid-cols-2 gap-x-12 sm:gap-x-20 gap-y-4 relative z-10 py-6">
                        
                        {/* Left Side Slots */}
                        <div className="space-y-4 pr-2">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold text-center block mb-2 tracking-widest select-none">
                            Lane Left
                          </span>
                          {slots.filter((_, idx) => idx % 2 === 0).map((slot) => {
                            const isSelected = selectedSlot?.id === slot.id;
                            const isAvailable = slot.status === 'AVAILABLE';
                            const isOccupied = slot.status === 'OCCUPIED';
                            const isReserved = slot.status === 'RESERVED';

                            return (
                              <button
                                key={slot.id}
                                disabled={!isAvailable}
                                onClick={() => setSelectedSlot(slot)}
                                className={`w-full py-3 sm:py-4 px-2 sm:px-3 rounded-xl border flex flex-col xl:flex-row items-center justify-center xl:justify-between text-center xl:text-left gap-1 xl:gap-0 transition-all duration-200 active:scale-[0.98] ${
                                  isSelected
                                    ? 'bg-brand-gold-500/10 border-brand-gold-600 ring-2 ring-brand-gold-500/40 text-brand-gold-950 dark:text-brand-gold-400 shadow-md font-bold hover:scale-[1.02]'
                                    : isAvailable
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-500 cursor-pointer shadow-sm hover:scale-[1.02]'
                                    : isOccupied
                                    ? 'bg-red-500/5 border-red-500/20 text-red-400 dark:text-red-900/60 cursor-not-allowed select-none'
                                    : 'bg-amber-500/5 border-amber-500/20 text-amber-500 dark:text-amber-800/60 cursor-not-allowed select-none'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                                  {/* Color Indicator Bullet */}
                                  <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${
                                    isSelected ? 'bg-brand-gold-600 animate-pulse' :
                                    isAvailable ? 'bg-emerald-500' :
                                    isOccupied ? 'bg-red-500' : 'bg-amber-500'
                                  }`} />
                                  <span className="font-outfit text-sm font-semibold tracking-tight">
                                    {slot.slot_name}
                                  </span>
                                </div>

                                <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider opacity-85 mt-0.5 xl:mt-0">
                                  {isSelected ? 'Selected' : slot.status.toLowerCase()}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Right Side Slots */}
                        <div className="space-y-4 pl-2">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold text-center block mb-2 tracking-widest select-none">
                            Lane Right
                          </span>
                          {slots.filter((_, idx) => idx % 2 !== 0).map((slot) => {
                            const isSelected = selectedSlot?.id === slot.id;
                            const isAvailable = slot.status === 'AVAILABLE';
                            const isOccupied = slot.status === 'OCCUPIED';
                            const isReserved = slot.status === 'RESERVED';

                            return (
                              <button
                                key={slot.id}
                                disabled={!isAvailable}
                                onClick={() => setSelectedSlot(slot)}
                                className={`w-full py-3 sm:py-4 px-2 sm:px-3 rounded-xl border flex flex-col xl:flex-row items-center justify-center xl:justify-between text-center xl:text-left gap-1 xl:gap-0 transition-all duration-200 active:scale-[0.98] ${
                                  isSelected
                                    ? 'bg-brand-gold-500/10 border-brand-gold-600 ring-2 ring-brand-gold-500/40 text-brand-gold-950 dark:text-brand-gold-400 shadow-md font-bold hover:scale-[1.02]'
                                    : isAvailable
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-500 cursor-pointer shadow-sm hover:scale-[1.02]'
                                    : isOccupied
                                    ? 'bg-red-500/5 border-red-500/20 text-red-400 dark:text-red-900/60 cursor-not-allowed select-none'
                                    : 'bg-amber-500/5 border-amber-500/20 text-amber-500 dark:text-amber-800/60 cursor-not-allowed select-none'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                                  <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${
                                    isSelected ? 'bg-brand-gold-600 animate-pulse' :
                                    isAvailable ? 'bg-emerald-500' :
                                    isOccupied ? 'bg-red-500' : 'bg-amber-500'
                                  }`} />
                                  <span className="font-outfit text-sm font-semibold tracking-tight">
                                    {slot.slot_name}
                                  </span>
                                </div>

                                <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-wider opacity-85 mt-0.5 xl:mt-0">
                                  {isSelected ? 'Selected' : slot.status.toLowerCase()}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                      </div>

                      {/* Bottom indicator */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-4 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-bold uppercase rounded-full tracking-wider select-none">
                        ▼ GATE EXIT
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* RIGHT COLUMN: Selection Summary & Checkout Confirmation (4 cols) */}
            <div className="lg:col-span-4">
              <Card className="border-0 shadow-lg bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md sticky top-24">
                <CardHeader>
                  <CardTitle>Reservation Summary</CardTitle>
                  <CardDescription>Confirm your selected slot and submit booking.</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Selection View */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 space-y-3">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Selected Location</span>
                        <span className="font-outfit font-bold text-gray-800 dark:text-white text-base">
                          {selectedLot ? selectedLot.name : 'None Selected'}
                        </span>
                      </div>
                      
                      <div className="border-t border-gray-100 dark:border-zinc-800/60 pt-3 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Chosen Slot</span>
                          <span className="font-outfit font-black text-xl text-brand-maroon-800 dark:text-brand-gold-500">
                            {selectedSlot ? selectedSlot.slot_name : 'No Slot Selected'}
                          </span>
                        </div>
                        {!selectedSlot && (
                          <span className="text-[10px] text-brand-maroon-800 dark:text-brand-gold-500 font-semibold animate-pulse">
                            Pick a green slot
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 space-y-2 text-xs font-sans text-gray-600 dark:text-zinc-400">
                      <div className="flex justify-between">
                        <span>User Account:</span>
                        <strong className="text-gray-900 dark:text-white truncate max-w-[160px]">
                          {profile?.full_name || 'Loading...'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>PUP ID Number:</span>
                        <strong className="font-mono text-gray-900 dark:text-white">
                          {profile?.pup_id || 'N/A'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Reservation validity:</span>
                        <span>Active session on scan</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  {activeTicket ? (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-sm text-center">
                      <p className="font-bold">Active Reservation Found</p>
                      <p className="mt-1">You cannot reserve multiple slots at once. Please complete your current session first.</p>
                      <Button variant="outline" className="mt-4 w-full border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30" onClick={() => router.push('/ticket')}>View Ticket</Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowConfirmModal(true)}
                      disabled={!selectedSlot || isBooking}
                      isLoading={isBooking}
                      variant="primary"
                      className="w-full py-3"
                    >
                      Confirm & Reserve Slot
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </main>

      {/* Success Modal / Receipt overlay */}
      {successTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-6 space-y-6 relative animate-in zoom-in-95 duration-200">
            
            {/* Visual Success Accent */}
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">
                Ticket Reserved Successfully
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Your slot is active. Present this digital ticket at the gate scan sensor.
              </p>
            </div>

            {/* QR Code Component */}
            <div className="relative mx-auto w-40 h-40 bg-white p-3 rounded-xl shadow-md border border-neutral-100 flex flex-col items-center justify-center">
              <QRCodeSVG 
                value={successTicket.id} 
                size={130} 
                level="H"
                fgColor="#800000"
                imageSettings={{
                  src: "/parqify.ico",
                  x: undefined,
                  y: undefined,
                  height: 20,
                  width: 20,
                  excavate: true,
                }}
              />
            </div>

            {/* Ticket receipt info */}
            <div className="bg-brand-maroon-50/30 dark:bg-brand-maroon-950/20 border border-brand-maroon-100/30 dark:border-brand-maroon-900/40 p-4 rounded-xl space-y-2 text-xs font-sans text-gray-700 dark:text-zinc-300">
              <div className="flex justify-between">
                <span>Ticket ID:</span>
                <span className="font-mono text-[10px] select-all font-bold text-gray-900 dark:text-white">
                  {successTicket.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User PUP ID:</span>
                <strong className="text-gray-900 dark:text-white">{successTicket.pupId}</strong>
              </div>
              <div className="flex justify-between">
                <span>Parking Location:</span>
                <strong className="text-gray-900 dark:text-white">{successTicket.lotName}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Assigned Slot:</span>
                <span className="px-2 py-0.5 bg-brand-gold-500/20 text-brand-gold-800 dark:text-brand-gold-400 rounded font-extrabold font-outfit text-sm">
                  {successTicket.slotName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reservation Timestamp:</span>
                <span>{new Date(successTicket.reservationTime).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setSuccessTicket(null)}
              >
                Done
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Footer removed to use global footer */}
      {/* Warning Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white">
                Confirm Parking Reservation
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                You should be within <strong>10 minutes away</strong> from the parking lot. Once confirmed, a 10-minute countdown starts immediately. If you do not occupy the slot within this period, your reservation will automatically expire and the slot will be released for other users.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isBooking}
                onClick={() => setShowConfirmModal(false)}
              >
                Go Back
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                isLoading={isBooking}
                onClick={async () => {
                  await handleBookSlot();
                  setShowConfirmModal(false);
                }}
              >
                Agree & Reserve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
