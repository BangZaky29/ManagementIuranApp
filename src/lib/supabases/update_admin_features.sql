-- Make address column nullable in verified_residents table
-- This allows admins to create users without knowing their full address initially
ALTER TABLE public.verified_residents ALTER COLUMN address DROP NOT NULL;
