'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setTheme } = useTheme();

  // Force light theme on login page
  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  const [form, setForm] = useState({
    full_name: '',
    pup_id: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  function formatPUPID(value) {
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const limitedValue = cleanValue.slice(0, 12);
    let formatted = '';
    for (let i = 0; i < limitedValue.length; i++) {
      if (i === 4 || i === 9 || i === 11) {
        formatted += '-';
      }
      formatted += limitedValue[i];
    }
    return formatted;
  }

  function handleChange(e) {
    let { name, value } = e.target;
    if (name === 'pup_id') {
      value = formatPUPID(value);
    }
    setForm({ ...form, [name]: value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isForgotPassword) {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
        setSuccess('Password reset link sent! Please check your email.');
        setIsForgotPassword(false);
        setIsLoading(false);
        return;
      }

      if (isSignUp && form.password !== form.confirm_password) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp
        ? { email: form.email, password: form.password, full_name: form.full_name, pup_id: form.pup_id }
        : { email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      if (isSignUp) {
        setSuccess('Account created! Please check your email to confirm your account before signing in.');
        setIsSignUp(false);
        setForm({ ...form, full_name: '', pup_id: '', password: '', confirm_password: '' });
      } else {
        router.push('/dashboard');
      }
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
        {/* Logo / Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg shadow-brand-maroon-800/25 mb-2 overflow-hidden bg-white">
            <img src="/parqify.ico" alt="Parqify Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight text-gray-900 dark:text-white">
            Parqify
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            PUP Manila Community Parking System
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-0 shadow-xl shadow-gray-200/50 dark:shadow-black/20 backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl">
              {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-center">
              {isForgotPassword
                ? 'Enter your email to receive a reset link'
                : isSignUp
                ? 'Register with your PUP credentials'
                : 'Sign in to manage your parking'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error / Success Messages */}
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

              {/* Sign Up Fields */}
              {isSignUp && (
                <>
                  <Input
                    id="full_name"
                    name="full_name"
                    label="Full Name"
                    placeholder="Juan Dela Cruz"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    }
                  />
                  <Input
                    id="pup_id"
                    name="pup_id"
                    label="PUP ID Number"
                    placeholder="2024-00001-MN-0"
                    value={form.pup_id}
                    onChange={handleChange}
                    required
                    maxLength={15}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                      </svg>
                    }
                  />
                </>
              )}

              {/* Common Fields */}
              <Input
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                }
              />

              {!isForgotPassword && (
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  helperText={isSignUp ? 'Must be at least 6 characters' : undefined}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  }
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                      tabIndex="-1"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  }
                />
              )}

              {isSignUp && (
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={handleChange}
                  required
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  }
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  }
                />
              )}

              {!isForgotPassword && !isSignUp && (
                <div className="flex justify-end -mt-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm font-medium text-brand-maroon-800 hover:text-brand-maroon-700 dark:text-brand-maroon-400 dark:hover:text-brand-maroon-300 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
              >
                {isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="font-semibold text-brand-maroon-800 hover:text-brand-maroon-700 dark:text-brand-maroon-400 dark:hover:text-brand-maroon-300 underline-offset-2 hover:underline transition-colors"
                >
                  Back to Sign In
                </button>
              ) : (
                <>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                      setSuccess('');
                    }}
                    className="font-semibold text-brand-maroon-800 hover:text-brand-maroon-700 dark:text-brand-maroon-400 dark:hover:text-brand-maroon-300 underline-offset-2 hover:underline transition-colors"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </>
              )}
            </p>
          </CardFooter>
        </Card>

        {/* Footer branding */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600">
          Polytechnic University of the Philippines — Manila
        </p>
      </div>
    </div>
  );
}
