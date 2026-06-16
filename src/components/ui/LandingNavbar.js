'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import AuthDrawer from '@/components/ui/AuthDrawer';

export default function LandingNavbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <>
      <nav className="absolute top-0 left-0 w-full z-40 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl shadow-lg shadow-brand-maroon-800/20 overflow-hidden bg-white">
                <img src="/parqify.ico" alt="Parqify Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white tracking-tight">
                Parqify
              </span>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center gap-4">
              <button 
                onClick={() => openAuth('login')}
                className="text-sm font-semibold text-zinc-700 hover:text-brand-maroon-800 dark:text-zinc-300 dark:hover:text-brand-maroon-400 transition-colors"
              >
                Log In
              </button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => openAuth('signup')}
              >
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex sm:hidden items-center gap-3">
              <button 
                onClick={() => openAuth('login')}
                className="text-sm font-semibold text-brand-maroon-800 dark:text-brand-maroon-400"
              >
                Log In
              </button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => openAuth('signup')}
                className="px-3 py-1.5 text-xs"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <AuthDrawer 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authMode} 
      />
    </>
  );
}
