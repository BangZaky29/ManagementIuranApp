-- ========================================
-- WARGA PINTAR — STORAGE SETUP
-- Run this in Supabase SQL Editor
-- Fixes "New row violates row level security policy" on image upload
-- ========================================

-- 1. Create Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('wargaPintar', 'wargaPintar', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Delete" ON storage.objects;

-- 3. Create Policies

-- Allow Public Read Access (Images are public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'wargaPintar' );

-- Allow Authenticated Users to Upload (INSERT)
CREATE POLICY "Authenticated User Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'wargaPintar' );

-- Allow Users to Update their own files
CREATE POLICY "Authenticated User Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'wargaPintar' AND auth.uid() = owner );

-- Allow Users to Delete their own files
CREATE POLICY "Authenticated User Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'wargaPintar' AND auth.uid() = owner );
