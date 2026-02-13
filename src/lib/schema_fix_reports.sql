-- ========================================
-- WARGA PINTAR — RLS FIX FOR REPORTS
-- Run this in Supabase SQL Editor
-- Fixes "Reports not showing in list"
-- ========================================

-- 1. Enable RLS on reports table (safeguard)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES (Clean slate for reports)
DROP POLICY IF EXISTS "Public read access" ON public.reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
DROP POLICY IF EXISTS "Staff can manage reports" ON public.reports; 

-- 3. CREATE POLICIES

-- A. SELECT: All authenticated users can view ALL reports (Transparency)
-- If you want strictly private reports, change USING (true) to USING (auth.uid() = user_id)
CREATE POLICY "Public read access"
ON public.reports FOR SELECT
USING (true);

-- B. INSERT: Authenticated users can create reports for themselves
CREATE POLICY "Users can insert own reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- C. UPDATE: Users can update their own reports (e.g. fix typo)
CREATE POLICY "Users can update own reports"
ON public.reports FOR UPDATE
USING (auth.uid() = user_id);

-- D. DELETE: Users can delete their own reports (optional, good to have)
CREATE POLICY "Users can delete own reports"
ON public.reports FOR DELETE
USING (auth.uid() = user_id);

-- E. ADMIN/SECURITY: Full access (Controlled via boolean functions)
-- We reuse the functions created in V3 fix
CREATE POLICY "Staff can manage reports"
ON public.reports FOR ALL
USING (public.is_admin() OR public.is_security());
