-- ========================================
-- WARGA PINTAR — TRIGGER FIX v2
-- Run this in Supabase SQL Editor
-- Fixes "Database error saving new user"
-- ========================================

-- 1. Drop existing broken trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create robust trigger function with error handling
-- Avoids enum casting issues by defaulting to 'warga'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role public.user_role := 'warga';
BEGIN
  -- Safely try to cast role
  BEGIN
    IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
      _role := (NEW.raw_user_meta_data->>'role')::public.user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    _role := 'warga';
  END;

  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    _role
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't crash the signup
  RAISE LOG 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Re-create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Make sure update_timestamp function exists
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
