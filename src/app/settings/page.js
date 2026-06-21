'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Button from '@/components/ui/Button';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { createClient } from '@supabase/supabase-js';
import { validatePasswordStrength } from '@/lib/validation';

// Initialize Supabase client for storage upload
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Profile State
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isGuest = profile?.pup_id?.startsWith('VISITOR-');

  // Theme State
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form States
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [validationErrors, setValidationErrors] = useState({});

  // UI States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' });

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
      fullName: fullName || '',
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

  const handleBlur = (fieldName) => {
    const errors = { ...validationErrors };
    
    if (fieldName === 'full_name') {
      if (!fullName) {
        errors.full_name = 'Full name is required';
      } else {
        const nameRegex = /^[a-zA-ZñÑ\s.\-]+$/;
        if (!nameRegex.test(fullName)) {
          errors.full_name = 'Full name cannot contain numbers or special characters';
        } else {
          delete errors.full_name;
        }
      }
    }
    
    if (fieldName === 'password') {
      if (isChangingPassword) {
        if (!password) {
          errors.password = 'Password is required';
        } else {
          const passwordErr = validatePasswordStrength(password, {
            email: user?.email || '',
            fullName: fullName || '',
            pupId: profile?.pup_id || ''
          });
          if (passwordErr) {
            errors.password = passwordErr;
          } else {
            delete errors.password;
          }
        }
      }
    }
    
    if (fieldName === 'confirm_password') {
      if (isChangingPassword) {
        if (password !== confirmPassword) {
          errors.confirm_password = 'New passwords do not match';
        } else {
          delete errors.confirm_password;
        }
      }
    }
    
    setValidationErrors(errors);
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!res.ok) {
          router.push('/login');
          return;
        }

        setUser(data.user);
        setProfile(data.profile);
        setFullName(data.profile.full_name || '');
        setAvatarUrl(data.profile.avatar_url || null);
        setEmail(data.user.email || '');
      } catch (err) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Enforce file size limit (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setProfileMessage({ type: 'error', text: 'Avatar image must be smaller than 5 MB.' });
        return;
      }
      
      // Enforce image MIME types (JPEG, PNG, WebP)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setProfileMessage({ type: 'error', text: 'Invalid image format. Only JPEG, PNG, and WebP are allowed.' });
        return;
      }

      setAvatarFile(file);
      // Create a local preview
      setAvatarUrl(URL.createObjectURL(file));
      setProfileMessage({ type: '', text: '' });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      let avatarBase64 = null;
      let avatarExt = null;

      if (avatarFile) {
        avatarExt = avatarFile.name.split('.').pop();
        avatarBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(avatarFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      }

      // Update database via API
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          avatar_base64: avatarBase64,
          avatar_ext: avatarExt,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setProfile(data.profile);
      setAvatarUrl(data.profile.avatar_url);
      setAvatarFile(null);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (isSavingSecurity) return;
    setIsSavingSecurity(true);
    setSecurityMessage({ type: '', text: '' });

    try {
      if (isChangingPassword && password) {
        const passwordValidationError = validatePasswordStrength(password, {
          email: user?.email || '',
          fullName: profile?.full_name || '',
          pupId: profile?.pup_id || ''
        });
        if (passwordValidationError) {
          setSecurityMessage({ type: 'error', text: passwordValidationError });
          setIsSavingSecurity(false);
          return;
        }
      }

      if (password && password !== confirmPassword) {
        setSecurityMessage({ type: 'error', text: 'New passwords do not match.' });
        setIsSavingSecurity(false);
        return;
      }

      const updates = {};
      if (email !== user.email && !isChangingPassword) updates.email = email;
      if (isChangingPassword) {
        if (!currentPassword || !password || !confirmPassword) {
            setSecurityMessage({ type: 'error', text: 'All password fields are required.' });
            setIsSavingSecurity(false);
            return;
        }
        updates.password = password;
        updates.currentPassword = currentPassword;
      }

      if (Object.keys(updates).length === 0) {
        setSecurityMessage({ type: 'error', text: 'No changes made.' });
        setIsSavingSecurity(false);
        return;
      }

      // If we are changing password and haven't sent the OTP yet, send it now.
      if (isChangingPassword && !showOtpInput) {
        const reauthRes = await fetch('/api/auth/reauthenticate', { method: 'POST' });
        const reauthData = await reauthRes.json();
        if (!reauthRes.ok) throw new Error(reauthData.error || 'Failed to send OTP.');
        
        setShowOtpInput(true);
        setSecurityMessage({ type: 'success', text: 'An 8-digit verification code has been sent to your email. Please check your inbox (including your spam folder) and enter it below to confirm.' });
        setIsSavingSecurity(false);
        return;
      }

      if (showOtpInput) {
        if (!otpCode || otpCode.trim().length < 8) {
          setSecurityMessage({ type: 'error', text: 'Verification code must be at least 8 characters.' });
          setIsSavingSecurity(false);
          return;
        }
        updates.nonce = otpCode;
      }

      const res = await fetch('/api/user/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSecurityMessage({ type: 'success', text: data.message });
      setPassword(''); // Clear password field
      setConfirmPassword(''); // Clear confirm password field
      setCurrentPassword(''); // Clear current password field
      setIsChangingPassword(false);
      setShowPasswords(false); // Reset visibility
      setShowOtpInput(false);
      setOtpCode('');
    } catch (err) {
      setSecurityMessage({ type: 'error', text: err.message || 'Failed to update security settings.' });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading Settings..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-12">
      {/* Simple Header */}
      <nav className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-maroon-800 to-brand-maroon-900 flex items-center justify-center shadow-md hidden sm:flex">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold font-outfit tracking-tight text-gray-900 dark:text-white">Account Settings</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 hidden sm:flex">
            <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
              {profile?.full_name}
            </span>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-maroon-50 dark:bg-zinc-800 flex items-center justify-center border border-brand-maroon-100 dark:border-white/10">
                <span className="text-xs font-bold text-brand-maroon-800 dark:text-zinc-400">
                  {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        
        {isGuest && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="font-bold font-outfit">Guest Account Mode</p>
              <p className="mt-0.5 text-xs opacity-90">You are logged in as a Guest Visitor. Public profile modifications and security password/email changes are disabled. You can still adjust appearance themes below.</p>
            </div>
          </div>
        )}

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Public Profile</CardTitle>
            <CardDescription>Update your avatar and display name.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-maroon-800 to-brand-gold-600 flex items-center justify-center overflow-hidden border-4 border-white dark:border-zinc-900 shadow-lg shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover select-none" onContextMenu={(e) => e.preventDefault()} draggable={false} />
                    ) : (
                      <span className="text-3xl font-bold text-white font-outfit">
                        {fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {!isGuest && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-brand-maroon-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                    </button>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleAvatarChange} 
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Profile Picture</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG or WEBP. 5MB max.</p>
                </div>
              </div>

              <Input
                id="full_name"
                label="Full Name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value.replace(/[^a-zA-ZñÑ\s.\-]/g, ''));
                  setValidationErrors(prev => {
                    const copy = { ...prev };
                    delete copy.full_name;
                    return copy;
                  });
                }}
                onBlur={() => {
                  handleBlur('full_name');
                  if (!fullName || fullName.trim() === '') {
                    setFullName(profile?.full_name || '');
                  }
                }}
                error={validationErrors.full_name}
                disabled={isGuest}
                required
              />

              {profileMessage.text && (
                <div className={`p-3 rounded-lg text-sm ${profileMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {profileMessage.text}
                </div>
              )}

              <Button type="submit" isLoading={isSavingProfile} disabled={isGuest || !(profile && (fullName !== (profile.full_name || '') || avatarFile !== null))}>
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your email address or password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSecuritySubmit} className="space-y-4">
              <Input
                id="email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  if (!email || email.trim() === '') {
                    setEmail(user?.email || '');
                  }
                }}
                disabled={isGuest || isChangingPassword}
                required
              />
              {!isChangingPassword ? (
                <>
                  {!isGuest && (
                    <div className="flex justify-start">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsChangingPassword(true);
                          setSecurityMessage({ type: '', text: '' });
                        }}
                      >
                        Change Password
                      </Button>
                    </div>
                  )}

                  {securityMessage.text && (
                    <div className={`p-3 rounded-lg text-sm ${securityMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                      {securityMessage.text}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    variant="default" 
                    isLoading={isSavingSecurity} 
                    disabled={isGuest || !(user && email !== (user.email || ''))}
                  >
                    Update Email
                  </Button>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <Input
                    id="current_password"
                    type={showPasswords ? "text" : "password"}
                    label="Current Password"
                    placeholder="Enter your current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isGuest || showOtpInput}
                    required
                    rightIcon={
                      <button 
                        type="button" 
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                      >
                        {showPasswords ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                      </button>
                    }
                  />
                  <div className="space-y-1.5 w-full">
                    <Input
                      id="password"
                      type={showPasswords ? "text" : "password"}
                      label="New Password"
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setValidationErrors(prev => {
                          const copy = { ...prev };
                          delete copy.password;
                          return copy;
                        });
                      }}
                      onBlur={() => handleBlur('password')}
                      error={validationErrors.password}
                      disabled={isGuest || showOtpInput}
                      required
                      rightIcon={
                        <button 
                          type="button" 
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                        >
                          {showPasswords ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          )}
                        </button>
                      }
                    />
                    {password && (
                      <div className="mt-2.5 px-1 space-y-2 animate-in slide-in-from-top-1 duration-200">
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getPasswordStrength(password).color}`} 
                            style={{ width: `${(getPasswordStrength(password).score / 5) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs font-semibold font-sans">
                          <span className="text-gray-500 dark:text-zinc-400">Strength: </span>
                          <span className={getPasswordStrength(password).text}>
                            {getPasswordStrength(password).label}
                          </span>
                        </div>
                        {/* Requirement Checklist */}
                        <div className="space-y-1.5 pt-0.5">
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                            {password.length >= 8 ? <CheckIcon /> : <CrossIcon />}
                            <span>At least 8 characters</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                            {/[A-Z]/.test(password) ? <CheckIcon /> : <CrossIcon />}
                            <span>One uppercase letter (A-Z)</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                            {/[a-z]/.test(password) ? <CheckIcon /> : <CrossIcon />}
                            <span>One lowercase letter (a-z)</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                            {/\d/.test(password) ? <CheckIcon /> : <CrossIcon />}
                            <span>One number (0-9)</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                            {/[^a-zA-Z0-9]/.test(password) ? <CheckIcon /> : <CrossIcon />}
                            <span>One special character (!@#$...)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Input
                    id="confirm_password"
                    type={showPasswords ? "text" : "password"}
                    label="Confirm New Password"
                    placeholder="Re-type your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setValidationErrors(prev => {
                        const copy = { ...prev };
                        delete copy.confirm_password;
                        return copy;
                      });
                    }}
                    onBlur={() => handleBlur('confirm_password')}
                    error={validationErrors.confirm_password}
                    disabled={isGuest || showOtpInput}
                    required
                    rightIcon={
                      <button 
                        type="button" 
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                      >
                        {showPasswords ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                      </button>
                    }
                  />

                  {showOtpInput && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-gray-100 dark:border-zinc-800">
                      <Input
                        id="otpCode"
                        type="text"
                        label="Verification Code (OTP)"
                        placeholder="12345678"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={8}
                        required
                        icon={
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                          </svg>
                        }
                      />
                    </div>
                  )}

                  {securityMessage.text && (
                    <div className={`p-3 rounded-lg text-sm ${securityMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                      {securityMessage.text}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Button 
                      type="submit" 
                      variant="default" 
                      isLoading={isSavingSecurity} 
                      disabled={isGuest || !currentPassword || !password || !confirmPassword}
                    >
                      {showOtpInput ? 'Verify and Save Password' : 'Send Verification Code'}
                    </Button>
                    {!showOtpInput && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPassword('');
                          setConfirmPassword('');
                          setCurrentPassword('');
                          setSecurityMessage({ type: '', text: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Switch between light and dark themes.</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    mounted && theme === 'light'
                      ? 'bg-white text-brand-maroon-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    mounted && theme === 'dark'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    mounted && theme === 'system'
                      ? 'bg-white dark:bg-zinc-900 text-brand-maroon-800 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  System
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
