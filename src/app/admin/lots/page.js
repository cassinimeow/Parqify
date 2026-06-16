'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function AdminLotsPage() {
  const router = useRouter();
  
  // Data State
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [slots, setSlots] = useState([]);
  
  const [profile, setProfile] = useState(null);
  
  // Loading States
  const [isVerifying, setIsVerifying] = useState(true);
  const [isLoadingLots, setIsLoadingLots] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isAddingLot, setIsAddingLot] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  
  // Form States
  const [newLotName, setNewLotName] = useState('');
  const [newLotTotal, setNewLotTotal] = useState('');
  const [newSlotName, setNewSlotName] = useState('');
  const [newSlotStatus, setNewSlotStatus] = useState('AVAILABLE');
  
  const [error, setError] = useState('');

  // Verify Admin Access
  useEffect(() => {
    async function verifyAdmin() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!res.ok || !data.profile?.is_admin) {
          router.push('/dashboard');
          return;
        }
        
        setProfile(data.profile);
      } catch (err) {
        router.push('/dashboard');
      } finally {
        setIsVerifying(false);
      }
    }
    verifyAdmin();
  }, [router]);

  // Fetch Lots
  async function fetchLots() {
    setIsLoadingLots(true);
    try {
      const res = await fetch('/api/parking/lots');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLots(data.lots || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingLots(false);
    }
  }

  useEffect(() => {
    fetchLots();
  }, []);

  // Fetch Slots
  async function fetchSlots(lotId) {
    setIsLoadingSlots(true);
    try {
      const res = await fetch(`/api/parking/slots/${lotId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSlots(data.slots || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingSlots(false);
    }
  }

  useEffect(() => {
    if (selectedLot) {
      fetchSlots(selectedLot.id);
    } else {
      setSlots([]);
    }
  }, [selectedLot]);

  // Add Lot
  async function handleAddLot(e) {
    e.preventDefault();
    if (!newLotName || !newLotTotal) return;
    
    const slotsCount = parseInt(newLotTotal, 10);
    if (slotsCount > 30) {
      setError('Cannot create more than 30 slots per lot.');
      return;
    }

    setIsAddingLot(true);
    try {
      const res = await fetch('/api/parking/lots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLotName, total_slots: slotsCount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setNewLotName('');
      setNewLotTotal('');
      fetchLots();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAddingLot(false);
    }
  }

  // Delete Lot
  async function handleDeleteLot(id) {
    if (!confirm('Are you sure you want to delete this lot? All its slots and tickets will be deleted.')) return;
    try {
      const res = await fetch('/api/parking/lots', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      if (selectedLot?.id === id) setSelectedLot(null);
      fetchLots();
    } catch (err) {
      setError(err.message);
    }
  }

  // Add Slot
  async function handleAddSlot(e) {
    e.preventDefault();
    if (!selectedLot || !newSlotName) return;
    setIsAddingSlot(true);
    try {
      const res = await fetch('/api/parking/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lot_id: selectedLot.id, slot_name: newSlotName, status: newSlotStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setNewSlotName('');
      fetchSlots(selectedLot.id);
      fetchLots();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAddingSlot(false);
    }
  }

  // Update Slot Status
  async function handleUpdateSlotStatus(id, newStatus) {
    try {
      const res = await fetch('/api/parking/slots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchSlots(selectedLot.id);
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete Slot
  async function handleDeleteSlot(id) {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    try {
      const res = await fetch('/api/parking/slots', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchSlots(selectedLot.id);
      fetchLots();
    } catch (err) {
      setError(err.message);
    }
  }

  if (isVerifying) {
    return <LoadingScreen message="Loading Admin Dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-maroon-50/50 via-white to-brand-gold-50/50 dark:from-brand-maroon-950 dark:via-[#09090b] dark:to-brand-gold-950 pb-12">
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
              </div>
              <h1 className="text-xl font-bold font-outfit tracking-tight text-gray-900 dark:text-white">Admin / Space Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
              {profile?.full_name}
            </span>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-maroon-50 dark:bg-zinc-800 flex items-center justify-center border border-brand-maroon-100 dark:border-white/10">
                <span className="text-xs font-bold text-brand-maroon-800 dark:text-zinc-400">
                  {(profile?.full_name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-between shadow-sm">
            <span className="font-medium text-sm">{error}</span>
            <button 
              onClick={() => setError('')} 
              className="p-1 rounded-md hover:bg-red-100 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Parking Lots Management */}
          <Card>
            <CardHeader>
              <CardTitle>Parking Lots</CardTitle>
              <CardDescription>Manage campus parking zones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <form onSubmit={handleAddLot} className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-zinc-800/30 rounded-xl border border-gray-100 dark:border-white/5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Add New Lot</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    placeholder="Lot Name (e.g. Main Lot)" 
                    value={newLotName} 
                    onChange={e => setNewLotName(e.target.value)} 
                    required 
                  />
                  <Input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="Total Slots (max 30)" 
                    value={newLotTotal} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewLotTotal(val);
                    }}
                    required 
                  />
                </div>
                <Button type="submit" isLoading={isAddingLot} className="w-full">Create Lot</Button>
              </form>

              <div className="space-y-2">
                {isLoadingLots ? (
                  <p className="text-sm text-gray-500">Loading lots...</p>
                ) : lots.length === 0 ? (
                  <p className="text-sm text-gray-500">No parking lots exist yet.</p>
                ) : (
                  lots.map(lot => (
                    <div 
                      key={lot.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedLot?.id === lot.id ? 'border-brand-maroon-800 bg-brand-maroon-50/20 dark:border-brand-gold-500 dark:bg-brand-gold-500/10' : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'}`}
                      onClick={() => setSelectedLot(lot)}
                    >
                      <div>
                        <h4 className="font-bold font-outfit text-gray-900 dark:text-white">{lot.name}</h4>
                        <p className="text-xs text-gray-500">{lot.total_slots} Slots capacity</p>
                      </div>
                      {profile?.is_super_admin && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteLot(lot.id); }}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          title="Delete Lot"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Slots Management */}
          <Card>
            <CardHeader>
              <CardTitle>Slots Configuration</CardTitle>
              <CardDescription>
                {selectedLot ? `Manage slots for ${selectedLot.name}` : 'Select a lot to manage its slots.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {selectedLot ? (
                <>
                  <form onSubmit={handleAddSlot} className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-zinc-800/30 rounded-xl border border-gray-100 dark:border-white/5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Add New Slot</h4>
                    <div className="flex gap-3">
                      <Input 
                        placeholder="Slot Name (e.g. A-1)" 
                        value={newSlotName} 
                        onChange={e => setNewSlotName(e.target.value)} 
                        required 
                        className="flex-1"
                      />
                      {profile?.is_super_admin && (
                        <select 
                          value={newSlotStatus}
                          onChange={e => setNewSlotStatus(e.target.value)}
                          className="w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-800 dark:focus:ring-brand-gold-500"
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="OCCUPIED">Occupied</option>
                          <option value="RESERVED">Reserved</option>
                        </select>
                      )}
                    </div>
                    <Button type="submit" isLoading={isAddingSlot} variant="outline" className="w-full">Create Slot</Button>
                  </form>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {isLoadingSlots ? (
                      <p className="text-sm text-gray-500">Loading slots...</p>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-gray-500">No slots in this lot.</p>
                    ) : (
                      slots.map(slot => (
                        <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-white/10">
                          <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${slot.status === 'AVAILABLE' ? 'bg-emerald-500' : slot.status === 'OCCUPIED' ? 'bg-red-500' : 'bg-amber-500'}`} />
                            <span className="font-bold font-outfit text-gray-900 dark:text-white">{slot.slot_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {profile?.is_super_admin ? (
                              <select
                                value={slot.status}
                                onChange={(e) => handleUpdateSlotStatus(slot.id, e.target.value)}
                                className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 focus:outline-none"
                              >
                                <option value="AVAILABLE">AVAILABLE</option>
                                <option value="OCCUPIED">OCCUPIED</option>
                                <option value="RESERVED">RESERVED</option>
                              </select>
                            ) : (
                              <span className="text-xs font-semibold text-gray-500">{slot.status}</span>
                            )}
                            
                            <button 
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                              title="Delete Slot"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
                  <p className="text-gray-400">Select a lot to view its slots</p>
                </div>
              )}
              
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
