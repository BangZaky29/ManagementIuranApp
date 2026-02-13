-- Create housing_complexes table
CREATE TABLE IF NOT EXISTS public.housing_complexes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add Foreign Keys to profiles (Admin's Cluster)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS housing_complex_id bigint REFERENCES public.housing_complexes(id);

-- Add Foreign Keys to verified_residents (User's Cluster)
ALTER TABLE public.verified_residents 
ADD COLUMN IF NOT EXISTS housing_complex_id bigint REFERENCES public.housing_complexes(id);

-- Enable RLS
ALTER TABLE public.housing_complexes ENABLE ROW LEVEL SECURITY;

-- Policies for housing_complexes
CREATE POLICY "Enable read access for authenticated users" ON public.housing_complexes
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for admins" ON public.housing_complexes
FOR INSERT TO authenticated WITH CHECK (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Update policies for verified_residents to allow UPDATE (for Edit feature)
-- Assuming previous policies might have only covered SELECT/INSERT/DELETE or verify generic access.
-- We explicitly add UPDATE policy if not exists or ensure it covers admin.
CREATE POLICY "Enable update for admins" ON public.verified_residents
FOR UPDATE TO authenticated
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Manual Insert Example (as requested)
-- INSERT INTO public.housing_complexes (name) VALUES ('Cluster HALIMUN');
-- UPDATE public.profiles SET housing_complex_id = 1 WHERE role = 'admin';
