'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for storage upload
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Profile State
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // UI States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' });

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
      setAvatarFile(file);
      // Create a local preview
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
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
    setIsSavingSecurity(true);
    setSecurityMessage({ type: '', text: '' });

    try {
      const updates = {};
      if (email !== user.email) updates.email = email;
      if (password) updates.password = password;

      if (Object.keys(updates).length === 0) {
        setSecurityMessage({ type: 'error', text: 'No changes made.' });
        setIsSavingSecurity(false);
        return;
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
    } catch (err) {
      setSecurityMessage({ type: 'error', text: err.message || 'Failed to update security settings.' });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="w-8 h-8 border-3 border-brand-maroon-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-12">
      {/* Simple Header */}
      <nav className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold font-outfit text-gray-900 dark:text-white">Account Settings</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <Input
                id="full_name"
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              {profileMessage.text && (
                <div className={`p-3 rounded-lg text-sm ${profileMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {profileMessage.text}
                </div>
              )}

              <Button type="submit" isLoading={isSavingProfile} disabled={!(profile && (fullName !== (profile.full_name || '') || avatarFile !== null))}>
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
                required
              />
              <Input
                id="password"
                type="password"
                label="New Password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Must be at least 6 characters."
              />

              {securityMessage.text && (
                <div className={`p-3 rounded-lg text-sm ${securityMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {securityMessage.text}
                </div>
              )}

              <Button type="submit" variant="outline" isLoading={isSavingSecurity} disabled={!(user && (email !== (user.email || '') || password !== ''))}>
                Update Security Settings
              </Button>
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
