-- Supabase Database Schema for Parqify (PUP Manila Community Parking Management System)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    pup_id TEXT UNIQUE NOT NULL, -- Student or Employee ID
    rfid_tag TEXT UNIQUE, -- Unique RFID chip ID
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
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
CREATE POLICY "Allow public read slots" ON public.parking_slots FOR SELECT USING (true);
CREATE POLICY "Allow public update slots" ON public.parking_slots FOR UPDATE USING (true);

CREATE POLICY "Allow public read tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tickets" ON public.tickets FOR UPDATE USING (true);

-- ----------------------------------------------------
-- SEED DATA FOR TESTING IN PUP MANILA
-- ----------------------------------------------------

-- Insert Parking Lots
INSERT INTO public.parking_lots (id, name, total_slots) VALUES
('a3e21820-2a78-43b9-a9a3-5c0293ee0991', 'PUP Main Campus Lot', 10),
('b3e21820-2a78-43b9-a9a3-5c0293ee0992', 'PUP CEA Campus Lot', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert Slots for PUP Main Campus Lot (A-1 to A-10)
INSERT INTO public.parking_slots (lot_id, slot_name, status) VALUES
('a3e21820-2a78-43b9-a9a3-5c0293ee0991', 'A-1', 'AVAILABLE'),
('a3e21820-2a78-43b9-a9a3-5c0293ee0991', 'A-2', 'AVAILABLE'),
('a3e21820-2a78-43b9-a9a3-5c0293ee0991', 'A-3', 'AVAILABLE'),
('a3e21820-2a78-43b9-a9a3-5c0293ee0991', 'A-4', 'AVAILABLE'),
('a3e21820-2a78-43b9-a9a3-5c0293ee0991', 'A-5', 'AVAILABLE'),
('a3e21820-2a78-43b9-a9a3-5c0293ee0991', 'A-6', 'AVAILABLE'),
('a3e21820-2a78-43b9-a9a3-5c0293ee0991', 'A-7', 'AVAILABLE'),
('a3e21820-2a78-43b9-a9a3-5c0293ee0991', 'A-8', 'AVAILABLE'),
('a3e21820-2a78-43b9-a9a3-5c0293ee0991', 'A-9', 'AVAILABLE'),
('a3e21820-2a78-43b9-a9a3-5c0293ee0991', 'A-10', 'AVAILABLE')
ON CONFLICT (lot_id, slot_name) DO NOTHING;

-- Insert Slots for PUP CEA Campus Lot (B-1 to B-6)
INSERT INTO public.parking_slots (lot_id, slot_name, status) VALUES
('b3e21820-2a78-43b9-a9a3-5c0293ee0992', 'B-1', 'AVAILABLE'),
('b3e21820-2a78-43b9-a9a3-5c0293ee0992', 'B-2', 'AVAILABLE'),
('b3e21820-2a78-43b9-a9a3-5c0293ee0992', 'B-3', 'AVAILABLE'),
('b3e21820-2a78-43b9-a9a3-5c0293ee0992', 'B-4', 'AVAILABLE'),
('b3e21820-2a78-43b9-a9a3-5c0293ee0992', 'B-5', 'AVAILABLE'),
('b3e21820-2a78-43b9-a9a3-5c0293ee0992', 'B-6', 'AVAILABLE')
ON CONFLICT (lot_id, slot_name) DO NOTHING;
