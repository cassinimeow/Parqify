import { redirect } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import LandingNavbar from '@/components/ui/LandingNavbar';
import ParticlesBackground from '@/components/ui/ParticlesBackground';

export default async function Home() {
  const supabase = await getSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  // If user is already logged in, skip landing page and go to dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-brand-maroon-50/50 via-white to-brand-gold-50/50 dark:from-brand-maroon-950 dark:via-[#09090b] dark:to-brand-gold-950 flex flex-col transition-colors duration-300 select-none">
      <LandingNavbar />

      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden hidden dark:block pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-maroon-900/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-gold-900/10 blur-[100px]" />
      </div>

      {/* Light Mode Specific Decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden dark:hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-maroon-100/40 via-white to-brand-gold-50/20" />
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full bg-brand-maroon-600/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] -left-[15%] w-[600px] h-[600px] rounded-full bg-brand-gold-500/10 blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="absolute inset-0 z-0">
        {/* Interactive Mouse Particles */}
        <ParticlesBackground />
      </div>

      {/* Main Hero Content */}
      <main className="flex-grow flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-maroon-50 dark:bg-brand-maroon-900/30 border border-brand-maroon-100 dark:border-brand-maroon-800/50 text-brand-maroon-800 dark:text-brand-maroon-300 text-sm font-medium mb-4 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute top-0 left-0 inline-flex h-full w-full rounded-full bg-brand-maroon-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-maroon-500"></span>
            </span>
            Now Live for PUP ITECH
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-outfit tracking-tight text-zinc-900 dark:text-white leading-tight">
            Smart Parking for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-maroon-600 to-brand-gold-500 dark:from-brand-maroon-400 dark:to-brand-gold-400">
              PUP Community
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Parqify is the intelligent, real-time parking management system designed exclusively for the Polytechnic University of the Philippines. Secure your slot before you arrive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* We can leave buttons here or just rely on the navbar, but a hero CTA is good UI! */}
            {/* The actual click logic needs a client component, so we will create a simple wrapper or just let them use the navbar. */}
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              Use the <strong className="text-brand-maroon-800 dark:text-brand-maroon-400">Login</strong> or <strong className="text-brand-maroon-800 dark:text-brand-maroon-400">Sign Up</strong> buttons in the navigation bar to get started.
            </p>
          </div>
        </div>
      </main>

      {/* Decorative Bottom Graphic / Grid */}
      <div className="h-48 w-full relative z-0 mt-auto overflow-hidden opacity-50 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
      </div>
    </div>
  );
}