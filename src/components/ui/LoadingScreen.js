'use client';

import ParticlesBackground from '@/components/ui/ParticlesBackground';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-brand-maroon-50 via-white to-brand-gold-50 dark:from-brand-maroon-950 dark:via-zinc-950 dark:to-brand-gold-950 overflow-hidden">
      <ParticlesBackground />
      <div className="flex flex-col items-center gap-6 relative z-50">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-maroon-100 dark:bg-brand-maroon-900/30 rounded-3xl animate-ping opacity-50"></div>
          <img src="/parqify.ico" alt="Parqify Logo" className="w-16 h-16 animate-spin relative z-10 drop-shadow-xl" style={{ animationDuration: '3s' }} />
        </div>
        <p className="text-sm font-bold text-brand-maroon-800 dark:text-brand-maroon-400 font-outfit tracking-widest uppercase animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
