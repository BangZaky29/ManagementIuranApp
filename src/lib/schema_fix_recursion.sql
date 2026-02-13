-- ========================================
-- WARGA PINTAR — RLS FIX (Infinite Recursion)
-- Run this in Supabase SQL Editor
-- Fixes "infinite recursion detected in policy for relation profiles"
-- ========================================

-- PROBLEM:
-- The policy "Admins can manage news" (and others) checks `EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')`.
-- If `public.profiles` also has an RLS policy that queries `public.profiles` (e.g., to check if the viewer is an admin), 
-- it creates an infinite loop.

-- SOLUTION:
-- 1. Drop existing policies on profiles to clear the slate.
-- 2. Create simple, non-recursive policies for profiles.
-- 3. Use a SECURITY DEFINER function to check roles to bypass RLS for role checks.

-- 1. DROP POLICIES ON PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;

-- 2. CREATE NON-RECURSIVE POLICIES FOR PROFILES
-- Users can read any profile (needed for referencing authors, etc.)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (usually handled by trigger, but good to have)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. HELPER FUNCTION TO CHECK ROLE (Bypasses RLS)
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


-- 4. UPDATE OTHER TABLES TO USE HELPER (Optional but recommended for news/fees)
-- Re-apply policies for NEWS to use is_admin()
DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
CREATE POLICY "Admins can manage news"
  ON public.news FOR ALL
  USING (public.is_admin());

-- Re-apply policies for FEES
DROP POLICY IF EXISTS "Admins can manage fees" ON public.fees;
CREATE POLICY "Admins can manage fees"
  ON public.fees FOR ALL
  USING (public.is_admin());

-- Re-apply policies for PAYMENTS
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (public.is_admin());

-- Re-apply policies for REPORTS
DROP POLICY IF EXISTS "Staff can manage reports" ON public.reports;
CREATE POLICY "Staff can manage reports"
  ON public.reports FOR ALL
  USING (public.is_admin() OR public.is_security());

-- Re-apply policies for PANIC LOGS
DROP POLICY IF EXISTS "Staff can manage panic logs" ON public.panic_logs;
CREATE POLICY "Staff can manage panic logs"
  ON public.panic_logs FOR ALL
  USING (public.is_admin() OR public.is_security());
