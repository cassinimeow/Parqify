'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { validatePasswordStrength } from '@/lib/validation';

const CheckIcon = () => (
  <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center shrink-0">
    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

const CrossIcon = () => (
  <div className="w-4 h-4 rounded bg-rose-500 flex items-center justify-center shrink-0">
    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </div>
);

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Force light theme and fetch user context
  useEffect(() => {
    setTheme('light');
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setProfile(data.profile);
        }
      } catch (err) {
        console.error('Failed to fetch user context:', err);
      }
    }
    fetchUser();
  }, [setTheme]);

  const [form, setForm] = useState({
    password: '',
    confirm_password: '',
  });

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-200', text: 'text-gray-400' };
    let score = 0;
    
    // Check complexity criteria:
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    
    // Check credentials exclusions
    const hasExclusions = validatePasswordStrength(pwd, {
      email: user?.email || '',
      fullName: profile?.full_name || '',
      pupId: profile?.pup_id || ''
    });
    if (hasExclusions) {
      score = Math.min(score, 2); // Cap at Weak if exclusion is triggered
    }

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
    if (score === 3) return { score, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score === 4) return { score, label: 'Strong', color: 'bg-blue-500', text: 'text-blue-500' };
    return { score, label: 'Excellent', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const passwordValidationError = validatePasswordStrength(form.password, {
      email: user?.email || '',
      fullName: profile?.full_name || '',
      pupId: profile?.pup_id || ''
    });

    if (passwordValidationError) {
      setError(passwordValidationError);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setSuccess('Password successfully updated! Redirecting to dashboard...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-maroon-50 via-white to-brand-gold-50 dark:from-brand-maroon-950 dark:via-zinc-950 dark:to-brand-gold-950" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-maroon-100/30 dark:bg-brand-maroon-900/10 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] rounded-full bg-brand-gold-100/40 dark:bg-brand-gold-900/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg shadow-brand-maroon-800/25 mb-2 overflow-hidden bg-white">
            <img src="/parqify.ico" alt="Parqify Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight text-gray-900 dark:text-white">
            Parqify
          </h1>
        </div>

        <Card className="border-0 shadow-xl shadow-gray-200/50 dark:shadow-black/20 backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl">
              Reset Password
            </CardTitle>
            <CardDescription className="text-center">
              Please enter your new password below.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-sm text-red-700 dark:text-red-400 animate-in">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-sm text-green-700 dark:text-green-400 animate-in">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {success}
                </div>
              )}

              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                disabled={!!success}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                }
                action={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                }
              />

              {form.password && (
                <div className="mt-2.5 px-1 space-y-2 animate-in slide-in-from-top-1 duration-200">
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getPasswordStrength(form.password).color}`} 
                      style={{ width: `${(getPasswordStrength(form.password).score / 5) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold font-sans">
                    <span className="text-gray-500 dark:text-zinc-400">Strength: </span>
                    <span className={getPasswordStrength(form.password).text}>
                      {getPasswordStrength(form.password).label}
                    </span>
                  </div>
                  {/* Requirement Checklist */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                      {form.password.length >= 8 ? <CheckIcon /> : <CrossIcon />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                      {/[A-Z]/.test(form.password) ? <CheckIcon /> : <CrossIcon />}
                      <span>One uppercase letter (A-Z)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                      {/[a-z]/.test(form.password) ? <CheckIcon /> : <CrossIcon />}
                      <span>One lowercase letter (a-z)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                      {/\d/.test(form.password) ? <CheckIcon /> : <CrossIcon />}
                      <span>One number (0-9)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                      {/[^a-zA-Z0-9]/.test(form.password) ? <CheckIcon /> : <CrossIcon />}
                      <span>One special character (!@#$...)</span>
                    </div>
                  </div>
                </div>
              )}

              <Input
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm New Password"
                placeholder="••••••••"
                value={form.confirm_password}
                onChange={handleChange}
                required
                disabled={!!success}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                }
                action={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-6"
                isLoading={isLoading}
                disabled={!!success}
              >
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
