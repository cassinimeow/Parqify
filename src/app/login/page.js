'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, register, loading, error: authError } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPupId, setRegPupId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // Validation / Local UI state
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Handle format styling for PUP ID as user types
  const handlePupIdChange = (e) => {
    let value = e.target.value.toUpperCase();
    // Keep only digits, letters and dashes
    value = value.replace(/[^A-Z0-9-]/g, '');
    setRegPupId(value);
    
    // Validate live
    if (value.length > 0 && !/^\d{4}-\d{5}-MN-\d$/i.test(value)) {
      setFormErrors(prev => ({
        ...prev,
        pupId: 'ID must match format: YYYY-XXXXX-MN-X (e.g. 2023-01053-MN-0)'
      }));
    } else {
      setFormErrors(prev => ({ ...prev, pupId: '' }));
    }
  };

  // Live email validation
  const handleEmailChange = (email, isLogin = true) => {
    if (isLogin) {
      setLoginEmail(email);
    } else {
      setRegEmail(email);
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 0 && !emailRegex.test(email)) {
      setFormErrors(prev => ({
        ...prev,
        [isLogin ? 'loginEmail' : 'regEmail']: 'Please enter a valid email address'
      }));
    } else {
      setFormErrors(prev => ({ ...prev, [isLogin ? 'loginEmail' : 'regEmail']: '' }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return;
    
    // Clear errors
    setFormErrors({});
    setSuccessMsg('');
    
    if (!loginEmail || !loginPassword) {
      setFormErrors({ general: 'Please fill in all fields' });
      return;
    }
    
    setSubmitLoading(true);
    const result = await login(loginEmail, loginPassword);
    setSubmitLoading(false);
    
    if (result.success) {
      setSuccessMsg('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      setFormErrors({ general: result.error || 'Invalid credentials' });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return;
    
    setFormErrors({});
    setSuccessMsg('');
    
    // Validation
    const errors = {};
    if (!regFullName) errors.fullName = 'Full Name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail) {
      errors.regEmail = 'Email is required';
    } else if (!emailRegex.test(regEmail)) {
      errors.regEmail = 'Invalid email address';
    }
    
    if (!regPupId) {
      errors.pupId = 'PUP ID is required';
    } else if (!/^\d{4}-\d{5}-MN-\d$/i.test(regPupId)) {
      errors.pupId = 'ID must match format: YYYY-XXXXX-MN-X';
    }
    
    if (!regPassword) {
      errors.regPassword = 'Password is required';
    } else if (regPassword.length < 6) {
      errors.regPassword = 'Password must be at least 6 characters';
    }
    
    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitLoading(true);
    const result = await register(regEmail, regPassword, regFullName, regPupId);
    setSubmitLoading(false);
    
    if (result.success) {
      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      setFormErrors({ general: result.error || 'Registration failed' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <div className="h-16 w-16 rounded-xl bg-brand-gold-500 flex items-center justify-center font-bold text-3xl text-black font-outfit shadow-inner animate-pulse">
          P
        </div>
        <p className="mt-4 font-outfit text-brand-gold-400 tracking-wider text-sm animate-pulse">
          LOADING PARQIFY AUTH...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 overflow-hidden font-sans">
      {/* Aesthetic Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-brand-maroon-950/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-brand-gold-950/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-brand-gold-600 items-center justify-center font-bold text-3xl text-black font-outfit shadow-lg shadow-brand-gold-950/50 mb-4 transition-transform duration-300 hover:scale-105">
            P
          </div>
          <h2 className="text-3xl font-extrabold font-outfit tracking-wider text-white">
            PARQIFY
          </h2>
          <p className="mt-1 text-xs text-zinc-400 uppercase tracking-widest font-semibold font-outfit">
            PUP Manila Community Portal
          </p>
        </div>

        {/* Auth card wrapper */}
        <Card className="backdrop-blur-md bg-zinc-900/60 border border-zinc-800/80 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="p-0">
            {/* Sliding Tab headers */}
            <div className="flex border-b border-zinc-800 bg-zinc-900/80">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setFormErrors({});
                  setSuccessMsg('');
                }}
                className={`w-1/2 py-4 text-center text-sm font-bold tracking-wide transition-all duration-200 ${
                  activeTab === 'login'
                    ? 'text-brand-gold-500 border-b-2 border-brand-gold-500 bg-zinc-900/40'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setFormErrors({});
                  setSuccessMsg('');
                }}
                className={`w-1/2 py-4 text-center text-sm font-bold tracking-wide transition-all duration-200 ${
                  activeTab === 'register'
                    ? 'text-brand-gold-500 border-b-2 border-brand-gold-500 bg-zinc-900/40'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Create Account
              </button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 pt-6">
            
            {/* Alert boxes */}
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs font-semibold text-red-400 flex items-center gap-2 animate-shake">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{formErrors.general}</span>
              </div>
            )}

            {authError && !formErrors.general && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs font-semibold text-red-400 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{authError}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-xs font-semibold text-emerald-400 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN TAB */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  id="login-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => handleEmailChange(e.target.value, true)}
                  error={formErrors.loginEmail}
                  icon={
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  }
                />

                <Input
                  label="Password"
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  icon={
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={submitLoading}
                >
                  Sign In
                </Button>
              </form>
            )}

            {/* REGISTER TAB */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Christian Abelarde"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  error={formErrors.fullName}
                  icon={
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                <Input
                  label="PUP ID Number"
                  id="reg-pup-id"
                  type="text"
                  required
                  placeholder="YYYY-XXXXX-MN-X"
                  value={regPupId}
                  onChange={handlePupIdChange}
                  error={formErrors.pupId}
                  helperText="Format: 2023-01053-MN-0"
                  icon={
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0v1m-4 1h4" />
                    </svg>
                  }
                />

                <Input
                  label="Email Address"
                  id="reg-email"
                  type="email"
                  required
                  placeholder="christian@example.com"
                  value={regEmail}
                  onChange={(e) => handleEmailChange(e.target.value, false)}
                  error={formErrors.regEmail}
                  icon={
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    id="reg-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    error={formErrors.regPassword}
                  />

                  <Input
                    label="Confirm"
                    id="reg-confirm"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    error={formErrors.confirmPassword}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={submitLoading}
                >
                  Create Account
                </Button>
              </form>
            )}

          </CardContent>
        </Card>

        {/* Back navigation */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-xs font-semibold text-zinc-500 hover:text-brand-gold-500 transition-colors flex items-center justify-center gap-1.5 mx-auto py-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Design System Showcase
          </button>
        </div>
        
      </div>
    </div>
  );
}
