-- ========================================
-- WARGA PINTAR — RLS FIX v3 (AGGRESSIVE)
-- Run this in Supabase SQL Editor
-- Fixes "infinite recursion" by removing ALL circular dependencies
-- ========================================

-- 1. DROP EVERYTHING THAT MIGHT CAUSE RECURSION (Variations included)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles; -- Fix: Drop new name too

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles; -- Fix: Drop new name too

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles; -- Variant

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

-- 2. CREATE PURE SQL HELPER FUNCTIONS (SECURITY DEFINER)
-- These run with owner privileges, bypassing RLS entirely to avoid loops
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

-- 3. RE-APPLY CLEAN PROFILES POLICIES
-- Simple, direct checks. No joins, no function calls that lookup profiles again.

-- VIEW: Everyone can view profiles (needed for UI to show author names)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- UPDATE: Users can ONLY update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- INSERT: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. FIX OTHER TABLES TO USE THE SECURE FUNCTIONS
-- This breaks the loop because is_admin() bypasses RLS on profilesTable

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
