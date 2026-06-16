'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [fontSizeScale, setFontSizeScale] = useState(100);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved font scale on mount
    const savedScale = localStorage.getItem('accessibility_font_scale');
    if (savedScale) {
      const scale = parseInt(savedScale, 10);
      setFontSizeScale(scale);
      document.documentElement.style.fontSize = `${(scale / 100) * 16}px`;
    }
  }, []);

  if (!mounted) return null;

  const toggleHighContrast = () => {
    if (theme === 'high-contrast') {
      setTheme('system'); // Revert to system or light/dark
    } else {
      setTheme('high-contrast');
    }
  };

  const adjustFontSize = (increment) => {
    setFontSizeScale((prev) => {
      let newScale = prev;
      if (increment && prev < 150) newScale += 10;
      if (!increment && prev > 80) newScale -= 10;
      
      localStorage.setItem('accessibility_font_scale', newScale);
      document.documentElement.style.fontSize = `${(newScale / 100) * 16}px`;
      return newScale;
    });
  };

  const resetFontSize = () => {
    setFontSizeScale(100);
    localStorage.setItem('accessibility_font_scale', 100);
    document.documentElement.style.fontSize = '16px';
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] font-sans">
      {/* Widget Panel */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5 animate-in slide-in-from-bottom-2 fade-in duration-200 origin-bottom-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-zinc-900 dark:text-white">Accessibility</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close Accessibility Panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">High Contrast</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Increase visual readability</p>
              </div>
              <button
                onClick={toggleHighContrast}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-maroon-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${
                  theme === 'high-contrast' ? 'bg-brand-maroon-600' : 'bg-zinc-200 dark:bg-zinc-700'
                }`}
                role="switch"
                aria-checked={theme === 'high-contrast'}
              >
                <span className="sr-only">Toggle high contrast</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'high-contrast' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Text Scaling Controls */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">Text Size</p>
                <span className="text-xs font-bold text-brand-maroon-600 dark:text-brand-maroon-400">
                  {fontSizeScale}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustFontSize(false)}
                  disabled={fontSizeScale <= 80}
                  className="flex-1 py-1.5 flex justify-center items-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium border border-zinc-200 dark:border-zinc-700 shadow-sm"
                  aria-label="Decrease text size"
                >
                  <span className="text-sm">A-</span>
                </button>
                <button
                  onClick={resetFontSize}
                  className="px-3 py-1.5 flex justify-center items-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors border border-zinc-200 dark:border-zinc-700 shadow-sm"
                  title="Reset text size"
                  aria-label="Reset text size"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => adjustFontSize(true)}
                  disabled={fontSizeScale >= 150}
                  className="flex-1 py-1.5 flex justify-center items-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium border border-zinc-200 dark:border-zinc-700 shadow-sm"
                  aria-label="Increase text size"
                >
                  <span className="text-lg">A+</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-lg hover:shadow-xl border border-zinc-200 dark:border-zinc-700 text-brand-maroon-800 dark:text-brand-maroon-400 transition-all duration-300 hover:scale-105"
        aria-label="Accessibility Options"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
        
        {/* Tooltip on hover (when closed) */}
        {!isOpen && (
          <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-md pointer-events-none">
            Accessibility
          </div>
        )}
      </button>
    </div>
  );
}
