import Link from 'next/link';
import { Code } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg shadow-md overflow-hidden bg-white">
                <img src="/parqify.ico" alt="Parqify Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold font-outfit text-zinc-900 dark:text-white">Parqify</span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Smart Parking System for the PUP Community. Built to make campus parking seamless and efficient.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-zinc-600 dark:text-zinc-400 hover:text-brand-maroon-800 dark:hover:text-brand-maroon-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/parking" className="text-zinc-600 dark:text-zinc-400 hover:text-brand-maroon-800 dark:hover:text-brand-maroon-400 transition-colors">
                  Find Parking
                </Link>
              </li>
              <li>
                <Link href="/ticket" className="text-zinc-600 dark:text-zinc-400 hover:text-brand-maroon-800 dark:hover:text-brand-maroon-400 transition-colors">
                  My Tickets
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & GitHub */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">The Project</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              This is an academic capstone project developed by Team Parqify. View our source code and documentation on GitHub.
            </p>
            <a 
              href="https://github.com/cassinimeow/Parqify" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-800 text-white rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
            >
              <Code size={18} />
              View Repository
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center md:text-left">
            &copy; {currentYear} Parqify. All rights reserved.
          </p>
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            Built with <span className="text-brand-maroon-800 dark:text-brand-maroon-400">❤</span> by Team Parqify | PUP Community
          </div>
        </div>
      </div>
    </footer>
  );
}
