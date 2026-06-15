'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const toggleTicket = (id) => {
    setExpandedTicketId(expandedTicketId === id ? null : id);
  };

  useEffect(() => {
    async function fetchUserAndTickets() {
      try {
        const [res, ticketsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/user/tickets')
        ]);

        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);

        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json();
          setTickets(ticketsData.tickets || []);
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserAndTickets();
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-maroon-50 via-white to-brand-gold-50 dark:from-brand-maroon-950 dark:via-zinc-950 dark:to-brand-gold-950">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-brand-maroon-100 dark:bg-brand-maroon-900/30 rounded-3xl animate-ping opacity-50"></div>
            <img src="/parqify.ico" alt="Parqify Logo" className="w-16 h-16 animate-spin relative z-10 drop-shadow-xl" style={{ animationDuration: '3s' }} />
          </div>
          <p className="text-sm font-bold text-brand-maroon-800 dark:text-brand-maroon-400 font-outfit tracking-widest uppercase animate-pulse">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email || 'User';
  const greeting = getGreeting();
  
  const activeTicket = tickets.find(t => t.status === 'ACTIVE' || t.status === 'RESERVED');
  const recentTickets = tickets;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-maroon-50/50 via-white to-brand-gold-50/50 dark:from-brand-maroon-950 dark:via-[#09090b] dark:to-brand-gold-950 relative overflow-hidden">
      {/* Dark Mode Background Accents */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-maroon-900/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-gold-900/10 blur-[100px]" />
      </div>

      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 dark:bg-black/40 border-b border-gray-100 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg shadow-md overflow-hidden bg-white">
              <img src="/parqify.ico" alt="Parqify Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold font-outfit tracking-tight text-gray-900 dark:text-white">Parqify</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-gold-50 dark:bg-brand-gold-950/30 border border-brand-gold-200 dark:border-brand-gold-900/30">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-brand-gold-800 dark:text-brand-gold-400">Online</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} isLoading={isLoggingOut}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center gap-5">
          {profile?.avatar_url && (
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg overflow-hidden shrink-0">
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover select-none" onContextMenu={(e) => e.preventDefault()} draggable={false} />
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-brand-maroon-800 dark:text-brand-maroon-400 uppercase tracking-wider">
              {greeting}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold font-outfit tracking-tight text-gray-900 dark:text-white">
              {displayName}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Welcome to your parking dashboard. Here&apos;s your overview.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Active Session */}
          <Card className="border-0 shadow-lg shadow-brand-maroon-100/20 dark:shadow-black/10 bg-gradient-to-br from-brand-maroon-800 to-brand-maroon-900 text-white hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-maroon-800/30 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6 !pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                  </svg>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    {activeTicket?.status === 'ACTIVE' && (
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    )}
                    {activeTicket?.status === 'RESERVED' && (
                      <span className="w-3 h-3 rounded-full bg-brand-gold-500 shrink-0"></span>
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                      {activeTicket ? activeTicket.status : 'NO TICKET'}
                    </span>
                  </div>
                  {activeTicket && (
                    <span className="text-[10px] font-mono opacity-50 mt-1 tracking-widest uppercase">
                      ID: {activeTicket.id.substring(0, 8)}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-2xl font-bold font-outfit">
                {activeTicket ? activeTicket.parking_slots?.slot_name : 'None'}
              </p>
              <p className="text-sm opacity-70 mt-1 truncate">
                {activeTicket ? activeTicket.parking_slots?.parking_lots?.name : 'No active parking session'}
              </p>
            </CardContent>
          </Card>

          {/* PUP ID */}
          <Card className="border border-gray-200/60 dark:border-white/10 shadow-xl shadow-gray-200/60 dark:shadow-black/30 bg-white dark:bg-zinc-900/50 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-default">
            <CardContent className="p-6 !pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-gold-50 dark:bg-brand-gold-950/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">PUP ID</span>
              </div>
              <p className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">
                {profile?.pup_id || '—'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Student / Employee ID</p>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="border border-gray-200/60 dark:border-white/10 shadow-xl shadow-gray-200/60 dark:shadow-black/30 bg-white dark:bg-zinc-900/50 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-default">
            <CardContent className="p-6 !pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status</span>
              </div>
              <p className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">Active</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Account verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-outfit text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Find Parking CTA */}
            <Card 
              className="border border-gray-200/60 dark:border-white/10 shadow-xl shadow-gray-200/60 dark:shadow-black/30 bg-white dark:bg-zinc-900/50 group cursor-pointer hover:scale-[1.01] transition-transform duration-200"
              onClick={() => router.push('/parking')}
            >
              <CardContent className="p-6 !pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-maroon-800 to-brand-gold-600 flex items-center justify-center shrink-0 shadow-lg shadow-brand-maroon-800/20 group-hover:shadow-xl transition-shadow">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white">Find Parking</h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Browse available parking lots and reserve a slot</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 dark:text-zinc-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* View Ticket */}
            <Card 
              className="border border-gray-200/60 dark:border-white/10 shadow-xl shadow-gray-200/60 dark:shadow-black/30 bg-white dark:bg-zinc-900/50 group cursor-pointer hover:scale-[1.01] transition-transform duration-200"
              onClick={() => router.push('/ticket')}
            >
              <CardContent className="p-6 !pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-gold-500 to-brand-gold-700 flex items-center justify-center shrink-0 shadow-lg shadow-brand-gold-600/20 group-hover:shadow-xl transition-shadow">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white">My Tickets</h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">View your parking tickets and session history</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 dark:text-zinc-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Admin Management (Only for Admins) */}
            {profile?.is_admin && (
              <Card 
                className="border border-gray-200/60 dark:border-white/10 shadow-xl shadow-gray-200/60 dark:shadow-black/30 bg-white dark:bg-zinc-900/50 group cursor-pointer hover:scale-[1.01] transition-transform duration-200"
                onClick={() => router.push('/admin/lots')}
              >
                <CardContent className="p-6 !pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20 group-hover:shadow-xl transition-shadow">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold font-outfit text-gray-900 dark:text-white">Admin Console</h3>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">Manage parking lots and slots</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 dark:text-zinc-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-outfit text-gray-900 dark:text-white">Recent Activity</h2>
            {tickets.length > 2 && (
              <button 
                onClick={() => setShowAllHistory(true)}
                className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400 transition-colors"
                title="Complete History"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </button>
            )}
          </div>
          <Card className="border border-gray-200/60 dark:border-white/10 shadow-xl shadow-gray-200/60 dark:shadow-black/30 bg-white dark:bg-zinc-900/50">
            <CardContent className={recentTickets.length > 0 ? "!p-0" : "p-12 sm:p-9.5"}>
              {recentTickets.length > 0 ? (
                <div className="flex flex-col p-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {recentTickets.map(ticket => (
                    <div key={ticket.id} className="border-b border-gray-100 dark:border-white/10 last:border-0 flex flex-col rounded-xl overflow-hidden transition-all shrink-0">
                      <div 
                        onClick={() => toggleTicket(ticket.id)}
                        className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                            ticket.status === 'ACTIVE' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                            ticket.status === 'RESERVED' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-50 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                            {ticket.status === 'ACTIVE' ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                              </svg>
                            ) : ticket.status === 'RESERVED' ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white font-outfit">
                              {ticket.parking_slots?.parking_lots?.name || 'Unknown Lot'} • {ticket.parking_slots?.slot_name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                              {new Date(ticket.entry_time || ticket.created_at).toLocaleDateString()} at {new Date(ticket.entry_time || ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            ticket.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                            {ticket.status}
                          </span>
                          <div className={`p-1 rounded-full transition-colors group-hover:bg-gray-200 dark:group-hover:bg-zinc-700`}>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedTicketId === ticket.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedTicketId === ticket.id ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                        <div className="px-6 pb-2 pt-2">
                          <div className="bg-gray-50/50 dark:bg-zinc-800/30 rounded-xl p-4 grid grid-cols-2 gap-4 border border-gray-100 dark:border-zinc-800">
                            <div>
                              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Ticket ID</p>
                              <p className="text-[10px] sm:text-xs font-mono text-gray-700 dark:text-gray-300 break-all">{ticket.id}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Exit Time</p>
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {ticket.exit_time ? new Date(ticket.exit_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Not yet exited'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-400 dark:text-zinc-400">No recent activity</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">Your parking history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 dark:border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            © 2025 Parqify — PUP Manila Community Parking System
          </p>
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            {profile?.email || user?.email || ''}
          </p>
        </div>
      </footer>

      {/* All History Modal */}
      {showAllHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAllHistory(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800 shrink-0">
              <h2 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Complete Parking History</h2>
              <button 
                onClick={() => setShowAllHistory(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar max-h-[500px]">
              {tickets.map(ticket => (
                <div key={ticket.id} className="border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-xl overflow-hidden flex flex-col transition-all shrink-0 shadow-sm hover:shadow-md">
                  <div 
                    onClick={() => toggleTicket(ticket.id)}
                    className="p-4 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        ticket.status === 'ACTIVE' ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        ticket.status === 'RESERVED' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-50 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {ticket.status === 'ACTIVE' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                        ) : ticket.status === 'RESERVED' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white font-outfit">
                          {ticket.parking_slots?.parking_lots?.name || 'Unknown Lot'} • {ticket.parking_slots?.slot_name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                          {new Date(ticket.entry_time || ticket.created_at).toLocaleDateString()} at {new Date(ticket.entry_time || ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block ${
                        ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        ticket.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {ticket.status}
                      </span>
                      <div className={`p-1 rounded-full transition-colors group-hover:bg-gray-200 dark:group-hover:bg-zinc-700`}>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedTicketId === ticket.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedTicketId === ticket.id ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                    <div className="px-4 pb-0 pt-2">
                      <div className="bg-gray-50/50 dark:bg-zinc-800/30 rounded-xl p-4 grid grid-cols-2 gap-4 border border-gray-100 dark:border-zinc-800">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Ticket ID</p>
                          <p className="text-[10px] sm:text-xs font-mono text-gray-700 dark:text-gray-300 break-all">{ticket.id}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">Exit Time</p>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {ticket.exit_time ? new Date(ticket.exit_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Not yet exited'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
