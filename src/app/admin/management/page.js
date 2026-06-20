'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function AdminManagementPage() {
  const router = useRouter();

  // Role Verification State
  const [profile, setProfile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Tab State: 'users' | 'tickets'
  const [activeTab, setActiveTab] = useState('users');

  // Data States
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL');

  // Modals & Action States (Super Admin Only)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // User Role Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [adminFlag, setAdminFlag] = useState(false);
  const [superAdminFlag, setSuperAdminFlag] = useState(false);

  // User Delete Modal
  const [userToDelete, setUserToDelete] = useState(null);

  // Ticket Status Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketStatus, setTicketStatus] = useState('RESERVED');

  // Ticket Delete Modal
  const [ticketToDelete, setTicketToDelete] = useState(null);

  // Verify Admin Access & Load Info
  useEffect(() => {
    async function verifyAndLoad() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!res.ok || !data.profile?.is_admin) {
          router.push('/dashboard');
          return;
        }

        setProfile(data.profile);
        await loadData();
      } catch (err) {
        router.push('/dashboard');
      } finally {
        setIsVerifying(false);
      }
    }
    verifyAndLoad();
  }, [router]);

  async function loadData() {
    setIsLoadingData(true);
    setError('');
    try {
      const [usersRes, ticketsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/tickets')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData.tickets || []);
      }
    } catch (err) {
      setError('Failed to fetch admin data.');
    } finally {
      setIsLoadingData(false);
    }
  }

  // Handle User Privilege Edit (Super Admin Only)
  async function handleUpdateRole(e) {
    e.preventDefault();
    if (!selectedUser || !profile?.is_super_admin) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          is_admin: adminFlag,
          is_super_admin: superAdminFlag
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user privileges');

      setSuccessMessage(`Updated privileges for ${selectedUser.full_name || 'user'} successfully.`);
      setIsRoleModalOpen(false);
      setSelectedUser(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle User Delete (Super Admin Only)
  async function handleDeleteUser() {
    if (!userToDelete || !profile?.is_super_admin) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userToDelete.id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      setSuccessMessage(`User profile deleted successfully.`);
      setUserToDelete(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Ticket Status Override (Super Admin Only)
  async function handleUpdateTicket(e) {
    e.preventDefault();
    if (!selectedTicket || !profile?.is_super_admin) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTicket.id,
          status: ticketStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to override ticket status');

      setSuccessMessage(`Ticket overridden to ${ticketStatus} successfully.`);
      setIsTicketModalOpen(false);
      setSelectedTicket(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Ticket Delete (Super Admin Only)
  async function handleDeleteTicket() {
    if (!ticketToDelete || !profile?.is_super_admin) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketToDelete.id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete ticket');

      setSuccessMessage(`Ticket deleted successfully.`);
      setTicketToDelete(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filtering Logic
  const filteredUsers = users.filter(user => {
    const search = userSearch.toLowerCase();
    return (
      (user.full_name || '').toLowerCase().includes(search) ||
      (user.email || '').toLowerCase().includes(search) ||
      (user.pup_id || '').toLowerCase().includes(search)
    );
  });

  const filteredTickets = tickets.filter(ticket => {
    const search = ticketSearch.toLowerCase();
    const matchesSearch =
      (ticket.users?.full_name || '').toLowerCase().includes(search) ||
      (ticket.parking_slots?.slot_name || '').toLowerCase().includes(search) ||
      (ticket.parking_slots?.parking_lots?.name || '').toLowerCase().includes(search);

    const matchesStatus = ticketStatusFilter === 'ALL' || ticket.status === ticketStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isVerifying) {
    return <LoadingScreen message="Verifying Admin Access..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-12">
      {/* Navbar Header */}
      <nav className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-maroon-800 to-brand-maroon-900 flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 20a11.383 11.383 0 0 1-4.714-.952 4.125 4.125 0 0 1 7.533-2.493M10.089 20v-.003c0-1.113.285-2.16.786-3.07M10.089 20v.109A11.386 11.386 0 0 1 5 19.128m10-9.9c0 2.209-1.791 4-4 4s-4-1.791-4-4 1.791-4 4-4 4 1.791 4 4Zm6.496-1.5c0 1.933-1.567 3.5-3.5 3.5s-3.5-1.567-3.5-3.5 1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5Z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold font-outfit tracking-tight text-gray-900 dark:text-white">
                User & Ticket Management
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              profile?.is_super_admin 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                : 'bg-brand-maroon-100 text-brand-maroon-800 dark:bg-brand-maroon-900/30 dark:text-brand-maroon-400'
            }`}>
              {profile?.is_super_admin ? 'Super Admin Access' : 'Admin Access (Read-Only)'}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Status Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-sm">
            {successMessage}
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-white dark:bg-zinc-800 text-brand-maroon-800 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Users ({filteredUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'tickets'
                ? 'bg-white dark:bg-zinc-800 text-brand-maroon-800 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Tickets ({filteredTickets.length})
          </button>
        </div>

        {/* TABS CONTAINER */}
        <Card className="border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <CardContent className="p-0">

            {/* TAB 1: USERS */}
            {activeTab === 'users' && (
              <div>
                {/* Search Header */}
                <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                  <div className="w-full max-w-md">
                    <Input
                      id="userSearch"
                      placeholder="Search users by name, email, or PUP ID..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                      }
                    />
                  </div>
                  <button 
                    onClick={loadData}
                    className="p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors shrink-0"
                    title="Reload data"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                  {isLoadingData ? (
                    <div className="p-12 text-center text-gray-500">Loading user directories...</div>
                  ) : filteredUsers.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400 select-none">
                          <th className="py-4 px-6">Name</th>
                          <th className="py-4 px-6">PUP ID</th>
                          <th className="py-4 px-6">Email</th>
                          <th className="py-4 px-6">RFID Tag</th>
                          <th className="py-4 px-6">Role</th>
                          {profile?.is_super_admin && <th className="py-4 px-6 text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                        {filteredUsers.map(user => {
                          const isGuest = user.pup_id?.startsWith('VISITOR-');
                          return (
                            <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                              <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                                <div className="flex items-center gap-3">
                                  {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-brand-maroon-50 dark:bg-zinc-800 text-brand-maroon-800 dark:text-zinc-400 flex items-center justify-center text-xs font-bold shrink-0">
                                      {user.full_name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <span>{user.full_name}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 font-mono text-xs text-gray-600 dark:text-zinc-400">{user.pup_id}</td>
                              <td className="py-4 px-6 text-gray-500 dark:text-zinc-400">{user.email || '—'}</td>
                              <td className="py-4 px-6 font-mono text-xs text-gray-500 dark:text-zinc-400">{user.rfid_tag || 'Not Bound'}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  isGuest ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' :
                                  user.is_super_admin ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                  user.is_admin ? 'bg-brand-maroon-100 text-brand-maroon-800 dark:bg-brand-maroon-900/30 dark:text-brand-maroon-400' :
                                  'bg-brand-gold-100 text-brand-gold-800 dark:bg-brand-gold-900/30 dark:text-brand-gold-400'
                                }`}>
                                  {isGuest ? 'Guest' : user.is_super_admin ? 'Super Admin' : user.is_admin ? 'Admin' : 'User'}
                                </span>
                              </td>
                              {profile?.is_super_admin && (
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setAdminFlag(user.is_admin);
                                        setSuperAdminFlag(user.is_super_admin);
                                        setIsRoleModalOpen(true);
                                      }}
                                      className="p-1 text-gray-400 hover:text-brand-maroon-800 dark:hover:text-white transition-colors"
                                      title="Edit privileges"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => setUserToDelete(user)}
                                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                      title="Delete profile"
                                      disabled={user.id === profile.id}
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center text-gray-500">No users found matching your search.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: TICKETS */}
            {activeTab === 'tickets' && (
              <div>
                {/* Filters Header */}
                <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:max-w-md">
                    <Input
                      id="ticketSearch"
                      placeholder="Search by name, slot, or lot..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                      value={ticketStatusFilter}
                      onChange={(e) => setTicketStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-800"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="OVERRIDDEN">Overridden</option>
                    </select>
                    <button 
                      onClick={loadData}
                      className="p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors shrink-0"
                      title="Reload data"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                  {isLoadingData ? (
                    <div className="p-12 text-center text-gray-500">Loading session logs...</div>
                  ) : filteredTickets.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400 select-none">
                          <th className="py-4 px-6">Ticket ID</th>
                          <th className="py-4 px-6">User</th>
                          <th className="py-4 px-6">Lot / Slot</th>
                          <th className="py-4 px-6">Timestamps</th>
                          <th className="py-4 px-6">Status</th>
                          {profile?.is_super_admin && <th className="py-4 px-6 text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                        {filteredTickets.map(ticket => (
                          <tr key={ticket.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td className="py-4 px-6 font-mono text-xs text-gray-900 dark:text-white">
                              {ticket.id.substring(0, 8).toUpperCase()}
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-semibold text-gray-900 dark:text-white">{ticket.users?.full_name || 'Visitor / Guest'}</div>
                              <div className="text-xs text-gray-500 dark:text-zinc-400">{ticket.users?.email || 'No email'}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-semibold text-gray-900 dark:text-white">{ticket.parking_slots?.slot_name || 'N/A'}</div>
                              <div className="text-xs text-gray-500 dark:text-zinc-400">{ticket.parking_slots?.parking_lots?.name || 'Released / Removed'}</div>
                            </td>
                            <td className="py-4 px-6 space-y-1 text-xs text-gray-500 dark:text-zinc-400">
                              <div><span className="font-bold">Book:</span> {new Date(ticket.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                              {ticket.entry_time && <div><span className="font-bold">Entry:</span> {new Date(ticket.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                              {ticket.exit_time && <div><span className="font-bold">Exit:</span> {new Date(ticket.exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                ticket.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                ticket.status === 'EXPIRED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                ticket.status === 'OVERRIDDEN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                              }`}>
                                {ticket.status}
                              </span>
                            </td>
                            {profile?.is_super_admin && (
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedTicket(ticket);
                                      setTicketStatus(ticket.status);
                                      setIsTicketModalOpen(true);
                                    }}
                                    className="p-1 text-gray-400 hover:text-brand-maroon-800 dark:hover:text-white transition-colors"
                                    title="Override ticket status"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setTicketToDelete(ticket)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete ticket record"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center text-gray-500">No tickets found matching filters.</div>
                  )}
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </main>

      {/* ==================================================== */}
      {/* MODALS SECTION (Super Admin Only) */}
      {/* ==================================================== */}

      {/* 1. Edit User Privilege Modal */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsRoleModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
              <CardTitle>Modify Privileges</CardTitle>
              <CardDescription>Adjust roles for {selectedUser.full_name}</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateRole}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-950/40 rounded-xl">
                  <div>
                    <label className="text-sm font-bold text-gray-900 dark:text-white">Admin Access</label>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Can view slot grids, user registers, and ticket states.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={adminFlag}
                    onChange={(e) => {
                      setAdminFlag(e.target.checked);
                      if (!e.target.checked) setSuperAdminFlag(false);
                    }}
                    className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-brand-maroon-800 focus:ring-brand-maroon-800"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-950/40 rounded-xl">
                  <div>
                    <label className="text-sm font-bold text-gray-900 dark:text-white">Super Admin Access</label>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Full capabilities to modify flags, delete items, and override statuses.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={superAdminFlag}
                    onChange={(e) => {
                      setSuperAdminFlag(e.target.checked);
                      if (e.target.checked) setAdminFlag(true);
                    }}
                    className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-brand-maroon-800 focus:ring-brand-maroon-800"
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting}>Save Roles</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. User Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setUserToDelete(null)}></div>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-950/30">
              <CardTitle className="text-red-700 dark:text-red-400">Delete Profile</CardTitle>
              <CardDescription>Confirm deletion of account</CardDescription>
            </CardHeader>
            <CardContent className="p-6 text-sm text-gray-600 dark:text-zinc-400">
              Are you sure you want to delete the profile of <strong className="text-gray-900 dark:text-white">{userToDelete.full_name}</strong>? 
              <p className="mt-2 text-xs text-red-500">Warning: This action deletes their profile data immediately. Active tickets referencing this user will be set to NULL.</p>
            </CardContent>
            <div className="p-6 pt-0 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setUserToDelete(null)}>Cancel</Button>
              <Button type="button" variant="primary" className="!bg-red-600 hover:!bg-red-700 text-white" isLoading={isSubmitting} onClick={handleDeleteUser}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Ticket Override Modal */}
      {isTicketModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsTicketModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
              <CardTitle>Override Ticket Status</CardTitle>
              <CardDescription>Force modify state for Ticket #{selectedTicket.id.substring(0, 8).toUpperCase()}</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateTicket}>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2">Select Override State</label>
                  <select
                    value={ticketStatus}
                    onChange={(e) => setTicketStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon-800"
                  >
                    <option value="RESERVED">RESERVED (Pending Entry)</option>
                    <option value="ACTIVE">ACTIVE (Currently Parked)</option>
                    <option value="COMPLETED">COMPLETED (Exited Normal)</option>
                    <option value="EXPIRED">EXPIRED (Reservation Timed Out)</option>
                    <option value="OVERRIDDEN">OVERRIDDEN (Forced Release)</option>
                  </select>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Note: Overriding a ticket status will automatically update the corresponding slot status (e.g. COMPLETED or OVERRIDDEN frees the slot to AVAILABLE).
                </p>
              </CardContent>
              <div className="p-6 pt-0 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsTicketModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting}>Confirm Override</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Ticket Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setTicketToDelete(null)}></div>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-950/30">
              <CardTitle className="text-red-700 dark:text-red-400">Delete Ticket Log</CardTitle>
              <CardDescription>Confirm delete ticket record</CardDescription>
            </CardHeader>
            <CardContent className="p-6 text-sm text-gray-600 dark:text-zinc-400">
              Are you sure you want to delete the log for ticket <strong className="font-mono text-gray-900 dark:text-white">#{ticketToDelete.id.substring(0, 8).toUpperCase()}</strong>?
              <p className="mt-2 text-xs text-red-500">Warning: This operation deletes the ticket history permanently. If the ticket is active/reserved, the parking slot will be set back to AVAILABLE.</p>
            </CardContent>
            <div className="p-6 pt-0 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setTicketToDelete(null)}>Cancel</Button>
              <Button type="button" variant="primary" className="!bg-red-600 hover:!bg-red-700 text-white" isLoading={isSubmitting} onClick={handleDeleteTicket}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
