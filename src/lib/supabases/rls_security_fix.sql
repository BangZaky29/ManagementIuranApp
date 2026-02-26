-- ============================================================================
-- RLS SECURITY HARDENING MIGRATION — Warga Pintar
-- ============================================================================
-- Jalankan script ini di Supabase Dashboard → SQL Editor
-- Backup database sebelum menjalankan!
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. NEWS — Restrict write operations to admin only
-- ============================================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON news;
DROP POLICY IF EXISTS "Enable read access for all users" ON news;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON news;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON news;

-- NEW: Published news readable by authenticated users, all news readable by admin
CREATE POLICY "Authenticated can read published news"
    ON news FOR SELECT
    TO authenticated
    USING (is_published = true OR is_admin());

-- NEW: Only admin can create/update/delete news
CREATE POLICY "Admin can insert news"
    ON news FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Admin can update news"
    ON news FOR UPDATE
    TO authenticated
    USING (is_admin());

CREATE POLICY "Admin can delete news"
    ON news FOR DELETE
    TO authenticated
    USING (is_admin());

-- ============================================================================
-- 2. REPORTS — Remove public read, require authentication
-- ============================================================================

-- Drop the dangerous public read policy
DROP POLICY IF EXISTS "Public read access" ON reports;

-- Drop duplicate insert policy (keep "Users can insert own reports")
DROP POLICY IF EXISTS "Users can create reports" ON reports;

-- NEW: Authenticated users can read own reports + admin/security can read all
-- (We keep "Users can view own reports" and "Staff can manage reports" which already handle this)
-- No new policy needed — existing "Users can view own reports" + "Staff can manage reports" + "Report Isolation" cover it

-- ============================================================================
-- 3. auth_debug_logs — Enable RLS and restrict to admin only
-- ============================================================================

-- Enable RLS on the table (might already be enabled, safe to run)
ALTER TABLE IF EXISTS auth_debug_logs ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner too
ALTER TABLE IF EXISTS auth_debug_logs FORCE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admin can manage auth_debug_logs"
    ON auth_debug_logs FOR ALL
    TO authenticated
    USING (is_admin());

-- ============================================================================
-- 4. PROFILES — Remove duplicate policies
-- ============================================================================

-- Drop duplicate INSERT (keep "Insert Profiles Safe" which has same logic)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Drop duplicate UPDATE (keep "Update Profiles Safe" which includes admin access)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- ============================================================================
-- 5. ROLE HARDENING — Change {public} to {authenticated} on auth-dependent policies
-- ============================================================================
-- Policies that check auth.uid() should use 'authenticated' role, not 'public'
-- This prevents unauthenticated requests from even reaching the policy logic

-- FEES: Change "Admins can manage fees" from {public} to {authenticated}
DROP POLICY IF EXISTS "Admins can manage fees" ON fees;
CREATE POLICY "Admins can manage fees"
    ON fees FOR ALL
    TO authenticated
    USING (is_admin());

-- FEES: Change "Public can view fees" from {public} to {authenticated}
DROP POLICY IF EXISTS "Public can view fees" ON fees;
CREATE POLICY "Authenticated can view active fees"
    ON fees FOR SELECT
    TO authenticated
    USING (is_active = true);

-- HOUSING_COMPLEXES: Change INSERT from {public} to {authenticated}
DROP POLICY IF EXISTS "Enable insert for admins safe" ON housing_complexes;
CREATE POLICY "Admin can insert housing complexes"
    ON housing_complexes FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

-- PANIC_LOGS: Change from {public} to {authenticated}
DROP POLICY IF EXISTS "Staff can manage panic logs" ON panic_logs;
CREATE POLICY "Staff can manage panic logs"
    ON panic_logs FOR ALL
    TO authenticated
    USING (is_admin() OR is_security());

DROP POLICY IF EXISTS "Users can trigger panic" ON panic_logs;
CREATE POLICY "Users can trigger panic"
    ON panic_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- PAYMENTS: Change from {public} to {authenticated}
DROP POLICY IF EXISTS "Users can create payments" ON payments;
CREATE POLICY "Users can create payments"
    ON payments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
CREATE POLICY "Admins can manage payments"
    ON payments FOR ALL
    TO authenticated
    USING (is_admin());

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
    ON payments FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- PROFILES: Change from {public} to {authenticated}
DROP POLICY IF EXISTS "View Profiles Safe" ON profiles;
CREATE POLICY "View Profiles Safe"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Insert Profiles Safe" ON profiles;
CREATE POLICY "Insert Profiles Safe"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Update Profiles Safe" ON profiles;
CREATE POLICY "Update Profiles Safe"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR is_admin());

-- REPORTS: Change from {public} to {authenticated}
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports"
    ON reports FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
CREATE POLICY "Users can insert own reports"
    ON reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reports" ON reports;
CREATE POLICY "Users can update own reports"
    ON reports FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reports" ON reports;
CREATE POLICY "Users can delete own reports"
    ON reports FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can manage reports" ON reports;
CREATE POLICY "Staff can manage reports"
    ON reports FOR ALL
    TO authenticated
    USING (is_admin() OR is_security());

-- VERIFIED_RESIDENTS: Change from {public} to {authenticated}, remove duplicate
DROP POLICY IF EXISTS "Admin Verify Safe" ON verified_residents;
DROP POLICY IF EXISTS "Admins can manage verified_residents_safe" ON verified_residents;
CREATE POLICY "Admin can manage verified residents"
    ON verified_residents FOR ALL
    TO authenticated
    USING (is_admin());

-- ============================================================================
-- 6. MULTI-TENANCY — Add housing_complex_id isolation
-- ============================================================================

-- NEWS: Add housing_complex_id isolation for admin
-- Admin only sees news from their own complex (or global news where housing_complex_id IS NULL)
DROP POLICY IF EXISTS "Authenticated can read published news" ON news;
CREATE POLICY "Authenticated can read published news"
    ON news FOR SELECT
    TO authenticated
    USING (
        -- Published news visible to users in same complex or global news
        (is_published = true AND (
            housing_complex_id IS NULL
            OR housing_complex_id = (SELECT housing_complex_id FROM profiles WHERE id = auth.uid())
        ))
        -- Admin can see all news in their complex
        OR (is_admin() AND (
            housing_complex_id IS NULL
            OR housing_complex_id = (SELECT housing_complex_id FROM profiles WHERE id = auth.uid())
        ))
    );

-- VERIFIED_RESIDENTS: Admin only manages residents in their own complex
DROP POLICY IF EXISTS "Admin can manage verified residents" ON verified_residents;
CREATE POLICY "Admin can manage verified residents"
    ON verified_residents FOR ALL
    TO authenticated
    USING (
        is_admin() AND (
            housing_complex_id IS NULL
            OR housing_complex_id = (SELECT housing_complex_id FROM profiles WHERE id = auth.uid())
        )
    );

-- PANIC_LOGS: Staff sees only their complex's panic logs
DROP POLICY IF EXISTS "Staff can manage panic logs" ON panic_logs;
CREATE POLICY "Staff can manage panic logs"
    ON panic_logs FOR ALL
    TO authenticated
    USING (
        (is_admin() OR is_security()) AND (
            EXISTS (
                SELECT 1 FROM profiles p1
                JOIN profiles p2 ON p1.housing_complex_id = p2.housing_complex_id
                WHERE p1.id = panic_logs.user_id AND p2.id = auth.uid()
            )
        )
    );

COMMIT;

-- ============================================================================
-- VERIFICATION: Run this after the migration to confirm policy count
-- ============================================================================
-- SELECT tablename, policyname, roles, operation
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
