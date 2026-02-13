-- ============================================================
-- WARGA PINTAR - FULL DATABASE SCHEMA UPDATE
-- ============================================================

-- 1. INISIALISASI TIPE DATA ENUM (Jika belum ada)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'warga', 'security');
    END IF;
END $$;

-- 2. UPDATE TABEL PROFILES (Penyimpanan Utama User)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nik text UNIQUE,
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS wa_phone text,
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'warga'::user_role;

-- 3. TABEL VERIFIED_RESIDENTS (Whitelist Warga oleh Admin)
CREATE TABLE IF NOT EXISTS public.verified_residents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nik text NOT NULL UNIQUE,
  full_name text NOT NULL,
  address text,
  rt_rw text DEFAULT '005/003',
  email text,
  phone text,
  -- Generate 6 karakter kode unik (Token Akses)
  access_token text NOT NULL UNIQUE DEFAULT upper(substring(md5(random()::text) from 0 for 7)), 
  role user_role DEFAULT 'warga'::user_role,
  is_claimed boolean DEFAULT false,
  claimed_at timestamp with time zone,
  claimed_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- 4. KEAMANAN (Row Level Security)
ALTER TABLE public.verified_residents ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya Admin yang bisa mengelola daftar whitelist
DROP POLICY IF EXISTS "Admins can manage verified_residents" ON public.verified_residents;
CREATE POLICY "Admins can manage verified_residents" 
ON public.verified_residents 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 5. RPC FUNCTION: Verifikasi NIK & Token (Untuk Frontend)
-- Fungsi ini dipanggil saat user memasukkan NIK & Token di form registrasi
CREATE OR REPLACE FUNCTION public.verify_registration_token(
  input_nik text,
  input_token text
) 
RETURNS json 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
DECLARE
  resident_record RECORD;
BEGIN
  SELECT * INTO resident_record
  FROM public.verified_residents
  WHERE nik = input_nik 
    AND access_token = input_token 
    AND is_claimed = false;

  IF FOUND THEN
    RETURN json_build_object(
      'valid', true,
      'name', resident_record.full_name,
      'address', resident_record.address,
      'rt_rw', resident_record.rt_rw,
      'role', resident_record.role::text
    );
  ELSE
    RETURN json_build_object('valid', false);
  END IF;
END;
$$;

-- 6. TRIGGER FUNCTION: Auto-Claim & Assign Role
-- Berjalan otomatis saat user berhasil mendaftar (insert ke profiles)
CREATE OR REPLACE FUNCTION public.handle_new_resident_claim() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    v_role user_role;
BEGIN
    -- Jika user menyertakan NIK saat mendaftar
    IF NEW.nik IS NOT NULL THEN
        -- Cari role dari whitelist berdasarkan NIK
        SELECT role INTO v_role 
        FROM public.verified_residents 
        WHERE nik = NEW.nik AND is_claimed = false;

        -- Jika ditemukan di whitelist
        IF v_role IS NOT NULL THEN
            -- Tandai NIK sebagai sudah diklaim
            UPDATE public.verified_residents
            SET is_claimed = true,
                claimed_at = now(),
                claimed_by = NEW.id
            WHERE nik = NEW.nik;

            -- Berikan role sesuai yang ditentukan Admin di whitelist
            NEW.role := v_role;
        ELSE
            -- Jika NIK tidak ada di whitelist, paksa jadi warga biasa
            NEW.role := 'warga'::user_role;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 7. PASANG TRIGGER KE TABEL PROFILES
DROP TRIGGER IF EXISTS on_profile_created_claim_resident ON public.profiles;
CREATE TRIGGER on_profile_created_claim_resident
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_resident_claim();