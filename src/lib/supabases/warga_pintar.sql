-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.fees (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  due_date_day integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  housing_complex_id bigint,
  CONSTRAINT fees_pkey PRIMARY KEY (id),
  CONSTRAINT fees_housing_complex_id_fkey FOREIGN KEY (housing_complex_id) REFERENCES public.housing_complexes(id)
);
CREATE TABLE public.housing_complexes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT housing_complexes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.news (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'PENGUMUMAN'::text,
  author_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  is_published boolean DEFAULT true,
  image_url text,
  housing_complex_id bigint,
  CONSTRAINT news_pkey PRIMARY KEY (id),
  CONSTRAINT news_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT news_housing_complex_id_fkey FOREIGN KEY (housing_complex_id) REFERENCES public.housing_complexes(id)
);
CREATE TABLE public.panic_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  location text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT panic_logs_pkey PRIMARY KEY (id),
  CONSTRAINT panic_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fee_id bigint,
  amount numeric NOT NULL,
  period date NOT NULL,
  status text DEFAULT 'pending'::text,
  payment_method text,
  paid_at timestamp with time zone,
  proof_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT payments_fee_id_fkey FOREIGN KEY (fee_id) REFERENCES public.fees(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'warga'::user_role,
  address text,
  rt_rw text,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  nik text UNIQUE,
  username text,
  wa_phone text,
  housing_complex_id bigint,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_housing_complex_id_fkey FOREIGN KEY (housing_complex_id) REFERENCES public.housing_complexes(id),
  CONSTRAINT profiles_nik_fkey FOREIGN KEY (nik) REFERENCES public.verified_residents(nik)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  status text DEFAULT 'Menunggu'::text,
  image_url text,
  location text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.verified_residents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nik text NOT NULL UNIQUE,
  full_name text NOT NULL,
  access_token text NOT NULL DEFAULT upper(SUBSTRING(md5((random())::text) FROM 0 FOR 7)) UNIQUE,
  is_claimed boolean DEFAULT false,
  claimed_at timestamp with time zone,
  claimed_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  housing_complex_id bigint,
  role USER-DEFINED DEFAULT 'warga'::user_role,
  CONSTRAINT verified_residents_pkey PRIMARY KEY (id),
  CONSTRAINT verified_residents_claimed_by_fkey FOREIGN KEY (claimed_by) REFERENCES public.profiles(id),
  CONSTRAINT verified_residents_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT verified_residents_housing_complex_id_fkey FOREIGN KEY (housing_complex_id) REFERENCES public.housing_complexes(id)
);