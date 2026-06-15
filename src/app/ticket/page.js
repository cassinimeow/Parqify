"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Clock, Car, CheckCircle, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function DigitalTicket() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchActiveTicket = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/login');
          return;
        }

        // Fetch user tickets from the API
        const response = await fetch('/api/user/tickets');
        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }

        const data = await response.json();
        
        // Find the active ticket
        const activeTicket = data.tickets?.find(t => t.status === 'ACTIVE');
        
        if (activeTicket) {
          setTicket(activeTicket);
        }
        
      } catch (err) {
        console.error(err);
        setError('Failed to load active ticket.');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTicket();
  }, [router]);

  const handleCheckout = async () => {
    if (!ticket) return;
    setCheckoutLoading(true);
    
    try {
      const response = await fetch('/api/parking/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticketId: ticket.id })
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <Car className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">No Active Parking</h2>
        <p className="text-gray-500 mt-2">You don't have an active parking session.</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-6 px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 font-sans">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => router.push('/dashboard')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="flex-1 text-center text-xl font-bold text-red-900 mr-9">Digital Ticket</h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Ticket Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Top colored band */}
          <div className="h-4 bg-gradient-to-r from-red-800 to-yellow-500"></div>
          
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
                <div className="flex items-center mt-1">
                  {ticket.status === 'ACTIVE' ? (
                    <span className="flex items-center text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                      Currently Parked
                    </span>
                  ) : (
                    <span className="flex items-center text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Slot</p>
                <p className="text-3xl font-black text-red-900">{ticket?.parking_slots?.slot_name || 'N/A'}</p>
              </div>
            </div>

            {/* Location & Time Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-5 h-5 text-red-800 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-semibold">{ticket?.parking_slots?.parking_lots?.name || 'PUP Manila'}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                <Clock className="w-5 h-5 text-red-800 mr-3" />
                <div className="flex-1 flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Entry Time</p>
                    <p className="text-sm font-semibold">
                      {formatTime(ticket.entry_time)} <span className="text-xs font-normal text-gray-500 ml-1">{formatDate(ticket.entry_time)}</span>
                    </p>
                  </div>
                  {ticket.exit_time && (
                    <div className="text-right border-l border-gray-200 pl-4">
                      <p className="text-xs text-gray-500">Exit Time</p>
                      <p className="text-sm font-semibold">
                        {formatTime(ticket.exit_time)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center border-t border-dashed border-gray-300 pt-8 pb-4 relative">
              {/* Decorative cutout circles for ticket effect */}
              <div className="absolute top-0 left-0 w-6 h-6 bg-gray-50 rounded-full -translate-x-10 -translate-y-3"></div>
              <div className="absolute top-0 right-0 w-6 h-6 bg-gray-50 rounded-full translate-x-10 -translate-y-3"></div>
              
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
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
              <p className="text-sm text-center text-gray-500 mt-2">
                Scan this code at the exit gate
              </p>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        {ticket.status === 'ACTIVE' && (
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className={`w-full mt-6 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex justify-center items-center
              ${checkoutLoading 
                ? 'bg-red-800/70 text-white cursor-not-allowed' 
                : 'bg-red-800 text-white hover:bg-red-900 hover:shadow-xl active:scale-[0.98]'
              }`}
          >
            {checkoutLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processing...
              </span>
            ) : (
              'Complete Parking & Checkout'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
