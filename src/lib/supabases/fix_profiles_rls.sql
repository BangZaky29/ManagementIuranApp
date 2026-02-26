BEGIN;
DROP POLICY IF EXISTS "View Profiles Safe" ON public.profiles;

CREATE POLICY "View Profiles Safe"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR is_admin() OR is_security());
    
COMMIT;
