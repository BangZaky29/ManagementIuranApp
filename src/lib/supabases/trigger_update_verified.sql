-- Trigger function to update verified_residents when a new user signs up
-- Assumes the user metadata contains 'nik'

CREATE OR REPLACE FUNCTION public.handle_new_user_verification()
RETURNS TRIGGER AS $$
DECLARE
  user_nik TEXT;
BEGIN
  -- Get NIK from user metadata
  user_nik := new.raw_user_meta_data->>'nik';

  -- If NIK exists, update the verified_residents table
  IF user_nik IS NOT NULL THEN
    UPDATE public.verified_residents
    SET 
      is_claimed = true,
      claimed_at = NOW()
    WHERE nik = user_nik;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_verification ON auth.users;
CREATE TRIGGER on_auth_user_created_verification
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_verification();
