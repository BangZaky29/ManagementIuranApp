-- ========================================
-- WARGA PINTAR — RLS FIX V3 (FINAL CLEANUP)
-- Run this in Supabase SQL Editor
-- Fixes "Policy for relation profile" and "Infinite Recursion"
-- ========================================

-- 1. DROP ALL EXISTING POLICIES ON PROFILES (Based on your screenshot)
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

-- 2. ENSURE HELPER FUNCTIONS EXIST (SECURITY DEFINER)
-- These allow checking roles without triggering RLS on the profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_security()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'security'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RE-CREATE ONLY 3 ESSENTIAL POLICIES FOR PROFILES

-- A. VIEW: Public (Needed so users can see who wrote news/reports)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- B. INSERT: Users can create their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- C. UPDATE: Users can ONLY update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. APPLY ROLE CHECKS TO OTHER TABLES (Using safe functions)

-- News
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
CREATE POLICY "Admins can manage news" ON public.news FOR ALL USING (public.is_admin());

-- Fees
DROP POLICY IF EXISTS "Admins can manage fees" ON public.fees;
CREATE POLICY "Admins can manage fees" ON public.fees FOR ALL USING (public.is_admin());

-- Payments
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.is_admin());

-- Reports
DROP POLICY IF EXISTS "Staff can manage reports" ON public.reports;
CREATE POLICY "Staff can manage reports" ON public.reports FOR ALL USING (public.is_admin() OR public.is_security());

-- Panic Logs
DROP POLICY IF EXISTS "Staff can manage panic logs" ON public.panic_logs;
CREATE POLICY "Staff can manage panic logs" ON public.panic_logs FOR ALL USING (public.is_admin() OR public.is_security());
