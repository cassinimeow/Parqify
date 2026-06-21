'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Button from '@/components/ui/Button';
import AuthDrawer from '@/components/ui/AuthDrawer';

export default function LandingNavbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
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
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100/50 hover:bg-zinc-200/50 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/50 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {currentTheme === 'dark' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              )}
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
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100/50 dark:bg-zinc-800/50 transition-colors"
                >
                  {currentTheme === 'dark' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              )}
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
