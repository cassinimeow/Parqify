'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Code } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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

export default function AuthDrawer({ isOpen, onClose, initialMode = 'login' }) {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSignupOtpInput, setShowSignupOtpInput] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Adjust state during render when props or tabs toggle
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
      setIsForgotPassword(false);
      setRememberMe(false);
      setError('');
      setSuccess('');
      setShowSignupOtpInput(false);
      setSignupEmail('');
      setOtpCode('');
      setIsGuestLoading(false);
      setCaptchaToken(null);
    }
  }

  const [prevIsSignUp, setPrevIsSignUp] = useState(isSignUp);
  const [prevIsForgotPassword, setPrevIsForgotPassword] = useState(isForgotPassword);
  if (isSignUp !== prevIsSignUp || isForgotPassword !== prevIsForgotPassword) {
    setPrevIsSignUp(isSignUp);
    setPrevIsForgotPassword(isForgotPassword);
    setCaptchaToken(null);
  }

  // Side-effect: reset external captcha widget when reopened or tabs change
  useEffect(() => {
    if (isOpen && captchaRef.current) {
      captchaRef.current.resetCaptcha();
    }
  }, [isOpen]);

  useEffect(() => {
    if (captchaRef.current) {
      captchaRef.current.resetCaptcha();
    }
  }, [isSignUp, isForgotPassword]);


  const [form, setForm] = useState({
    full_name: '',
    pup_id: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

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
      email: form.email,
      fullName: form.full_name,
      pupId: form.pup_id
    });
    if (hasExclusions) {
      score = Math.min(score, 2); // Cap at Weak if exclusion is triggered
    }

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
    if (score === 3) return { score, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score === 4) return { score, label: 'Strong', color: 'bg-blue-500', text: 'text-blue-500' };
    return { score, label: 'Excellent', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const handleBlur = (fieldName) => {
    const errors = { ...validationErrors };
    
    if (fieldName === 'full_name') {
      if (isSignUp) {
        if (!form.full_name) {
          errors.full_name = 'Full name is required';
        } else {
          const nameRegex = /^[a-zA-ZñÑ\s.\-]+$/;
          if (!nameRegex.test(form.full_name)) {
            errors.full_name = 'Full name cannot contain numbers or special characters';
          } else {
            delete errors.full_name;
          }
        }
      }
    }
    
    if (fieldName === 'pup_id') {
      if (isSignUp) {
        if (!form.pup_id) {
          errors.pup_id = 'PUP ID is required';
        } else {
          const pupIdRegex = /^[a-zA-Z0-9\-]+$/;
          if (!pupIdRegex.test(form.pup_id)) {
            errors.pup_id = 'PUP ID can only contain letters, numbers, and hyphens';
          } else {
            delete errors.pup_id;
          }
        }
      }
    }
    
    if (fieldName === 'email') {
      if (!form.email) {
        errors.email = 'Email is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
          errors.email = 'Invalid email format';
        } else {
          delete errors.email;
        }
      }
    }
    
    if (fieldName === 'password') {
      if (isSignUp) {
        const passwordErr = validatePasswordStrength(form.password, {
          email: form.email,
          fullName: form.full_name,
          pupId: form.pup_id
        });
        if (passwordErr) {
          errors.password = passwordErr;
        } else {
          delete errors.password;
        }
      }
    }
    
    if (fieldName === 'confirm_password') {
      if (isSignUp) {
        if (form.password !== form.confirm_password) {
          errors.confirm_password = 'Passwords do not match';
        } else {
          delete errors.confirm_password;
        }
      }
    }
    
    setValidationErrors(errors);
  };

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
    } else if (name === 'full_name') {
      value = value.replace(/[^a-zA-ZñÑ\s.\-]/g, '');
    }
    setForm({ ...form, [name]: value });
    setError('');
    
    // Clear validation error on type
    setValidationErrors(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, token: otpCode, type: 'signup' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid verification code.');
        return;
      }

      setSuccess('Verification successful! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!captchaToken) {
      setError('Please complete the Captcha verification.');
      setIsLoading(false);
      return;
    }

    try {
      if (isForgotPassword) {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, captchaToken }),
        });
        const data = await res.json();
        if (!res.ok) { 
          setError(data.error || 'Something went wrong'); 
          if (captchaRef.current) captchaRef.current.resetCaptcha();
          setCaptchaToken(null);
          return; 
        }
        setSuccess('Password reset link sent! Please check your email (including your spam folder).');
        setIsForgotPassword(false);
        setIsLoading(false);
        return;
      }

      if (isSignUp && form.password !== form.confirm_password) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        const passwordValidationError = validatePasswordStrength(form.password, {
          email: form.email,
          fullName: form.full_name,
          pupId: form.pup_id
        });
        if (passwordValidationError) {
          setError(passwordValidationError);
          setIsLoading(false);
          return;
        }
      }

      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp
        ? { email: form.email, password: form.password, full_name: form.full_name, pup_id: form.pup_id, captchaToken }
        : { email: form.email, password: form.password, captchaToken, rememberMe };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        if (captchaRef.current) captchaRef.current.resetCaptcha();
        setCaptchaToken(null);
        return;
      }

      if (isSignUp) {
        setSignupEmail(form.email);
        setShowSignupOtpInput(true);
        setSuccess('Account created! An 8-digit verification code has been sent to your email (including your spam folder). Please enter it below to confirm.');
        setForm({ ...form, full_name: '', pup_id: '', password: '', confirm_password: '' });
      } else {
        router.push('/dashboard');
        onClose(); // close drawer on success
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGuestLogin() {
    if (isGuestLoading) return;
    if (!captchaToken) {
      setError('Please complete the Captcha verification first to continue as visitor.');
      return;
    }
    setIsGuestLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/anonymous-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captchaToken })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to log in as guest.');
        if (captchaRef.current) captchaRef.current.resetCaptcha();
        setCaptchaToken(null);
        return;
      }

      setSuccess('Logged in as Guest Visitor! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
        onClose();
      }, 1000);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsGuestLoading(false);
    }
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header & Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg shadow-sm overflow-hidden bg-white">
              <img src="/parqify.ico" alt="Parqify Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold font-outfit text-zinc-900 dark:text-white">Parqify</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {showSignupOtpInput ? 'Confirm Code' : isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {showSignupOtpInput
                ? `Enter the 8-digit code sent to ${signupEmail}`
                : isForgotPassword
                ? 'Enter your email to receive a reset link'
                : isSignUp
                ? 'Register with your PUP credentials'
                : 'Sign in to manage your parking'}
            </p>
          </div>

          {showSignupOtpInput ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                id="otpCode"
                name="otpCode"
                type="text"
                label="Verification Code"
                placeholder="12345678"
                maxLength={8}
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                required
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-4"
              >
                Confirm Verification
              </Button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignupOtpInput(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-sm font-semibold text-brand-maroon-800 hover:text-brand-maroon-700 dark:text-brand-maroon-400 dark:hover:text-brand-maroon-300 underline-offset-2 hover:underline transition-colors"
                >
                  Back to Sign Up
                </button>
              </div>
            </form>
          ) : (
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
                  onBlur={() => handleBlur('full_name')}
                  error={validationErrors.full_name}
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
                  onBlur={() => handleBlur('pup_id')}
                  error={validationErrors.pup_id}
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
              onBlur={() => handleBlur('email')}
              error={validationErrors.email}
              required
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              }
            />

            {!isForgotPassword && (
              <div className="space-y-1.5 w-full">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  error={validationErrors.password}
                  required
                  helperText={isSignUp ? 'Must be at least 8 characters with mixed case, numbers, & symbols' : undefined}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  }
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 focus:outline-none"
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
                {isSignUp && form.password && (
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
              </div>
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
                onBlur={() => handleBlur('confirm_password')}
                error={validationErrors.confirm_password}
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
                    className="p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 focus:outline-none"
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
              <div className="flex items-center justify-between -mt-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-brand-maroon-800 focus:ring-brand-maroon-500 cursor-pointer accent-brand-maroon-800 dark:bg-zinc-900"
                  />
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Remember me</span>
                </label>
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

            {/* hCaptcha Verification */}
            {process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ? (
              <div className="flex justify-center my-4 min-h-[78px]">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                  onVerify={(token) => {
                    setCaptchaToken(token);
                    setError('');
                  }}
                  onExpire={() => setCaptchaToken(null)}
                />
              </div>
            ) : (
              <div className="text-center text-xs text-red-500 my-4">
                Error: hCaptcha Site Key is not configured in environment variables.
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={isGuestLoading}
              className="w-full mt-2"
            >
              {isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>

            {!isForgotPassword && (
              <>
                <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-zinc-400 uppercase tracking-widest">Or</span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  isLoading={isGuestLoading}
                  disabled={isLoading}
                  onClick={handleGuestLogin}
                  className="w-full border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  Continue as Visitor
                </Button>
              </>
            )}
          </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
          </div>
        </div>
      </div>
    </>
  );
}
