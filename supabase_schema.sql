-- Supabase Database Schema for Parqify (PUP Manila Community Parking Management System)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE, -- Links to Supabase Auth user email
    pup_id TEXT UNIQUE NOT NULL, -- Student or Employee ID
    rfid_tag TEXT UNIQUE, -- Unique RFID chip ID
    avatar_url TEXT, -- URL for the user's uploaded profile picture
    is_admin BOOLEAN DEFAULT false, -- True if the user is an administrator
    is_super_admin BOOLEAN DEFAULT false, -- True if the user is a super administrator
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PARKING LOTS TABLE
CREATE TABLE IF NOT EXISTS public.parking_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., "PUP Main Campus Lot", "CEA Lot"
    total_slots INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PARKING SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.parking_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID REFERENCES public.parking_lots(id) ON DELETE CASCADE NOT NULL,
    slot_name TEXT NOT NULL, -- e.g., "A-1", "A-2", "B-1"
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(lot_id, slot_name) -- Ensure unique slot names within the same lot
);

-- 4. TICKETS TABLE (Transactions)
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    slot_id UUID REFERENCES public.parking_slots(id) ON DELETE SET NULL,
    entry_time TIMESTAMP WITH TIME ZONE,
    exit_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('RESERVED', 'ACTIVE', 'COMPLETED', 'EXPIRED', 'OVERRIDDEN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create partial unique index to enforce at most one active (RESERVED or ACTIVE) ticket per user
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_ticket_per_user 
ON public.tickets (user_id) 
WHERE (status IN ('RESERVED', 'ACTIVE'));


-- ----------------------------------------------------
-- Row Level Security (RLS) Settings (Optional/Recommended for Production)
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create basic public read policies (for simplified testing/MVP)
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public read lots" ON public.parking_lots FOR SELECT USING (true);
CREATE POLICY "Allow public insert lots" ON public.parking_lots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete lots" ON public.parking_lots FOR DELETE USING (true);

CREATE POLICY "Allow public read slots" ON public.parking_slots FOR SELECT USING (true);
CREATE POLICY "Allow public insert slots" ON public.parking_slots FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update slots" ON public.parking_slots FOR UPDATE USING (true);
CREATE POLICY "Allow public delete slots" ON public.parking_slots FOR DELETE USING (true);

CREATE POLICY "Allow public read tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tickets" ON public.tickets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tickets" ON public.tickets FOR DELETE USING (true);

-- ----------------------------------------------------
-- 5. STORAGE BUCKETS
-- ----------------------------------------------------
-- Note: You may need to run this as a superuser or manually create the bucket in the Supabase Dashboard
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Set up RLS for storage (allow public viewing of avatars, but only authenticated users can modify their own)
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Users can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );

CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( auth.uid() = owner );

CREATE POLICY "Users can delete their own avatar."
  ON storage.objects FOR DELETE
  USING ( auth.uid() = owner );

-- ----------------------------------------------------
-- 6. SESSION MANAGEMENT HELPER FUNCTIONS
-- ----------------------------------------------------

-- Function to retrieve all active sessions for the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_user_sessions()
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  ip inet,
  user_agent text,
  is_current boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, 
    s.created_at, 
    s.updated_at, 
    s.ip, 
    s.user_agent,
    s.id = COALESCE((auth.jwt() ->> 'session_id')::uuid, '00000000-0000-0000-0000-000000000000'::uuid) AS is_current
  FROM auth.sessions s
  WHERE s.user_id = auth.uid()
  ORDER BY s.created_at DESC;
END;
$$;

-- Function to revoke a specific session for the currently authenticated user
CREATE OR REPLACE FUNCTION public.revoke_user_session(target_session_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.sessions s
  WHERE s.id = target_session_id AND s.user_id = auth.uid();
  RETURN FOUND;
END;
$$;

-- Function to update the user agent of the current session to match the browser
CREATE OR REPLACE FUNCTION public.update_current_session_user_agent(browser_user_agent text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_sid uuid;
BEGIN
  current_sid := COALESCE((auth.jwt() ->> 'session_id')::uuid, '00000000-0000-0000-0000-000000000000'::uuid);
  
  IF current_sid != '00000000-0000-0000-0000-000000000000'::uuid THEN
    UPDATE auth.sessions
    SET user_agent = browser_user_agent
    WHERE id = current_sid 
      AND user_id = auth.uid();
    RETURN FOUND;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to update the user agent of a specific session for the currently authenticated user
CREATE OR REPLACE FUNCTION public.update_session_user_agent(target_session_id uuid, browser_user_agent text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.sessions
  SET user_agent = browser_user_agent
  WHERE id = target_session_id 
    AND user_id = auth.uid();
  RETURN FOUND;
END;
$$;

