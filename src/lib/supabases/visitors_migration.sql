-- Migration Script: Create Visitors Table for Buku Tamu Feature

-- 1. Create enum for Visitor Types
CREATE TYPE visitor_type AS ENUM ('tamu', 'gojek', 'kurir', 'pekerja', 'lainnya');

-- 2. Create enum for Visitor Status
CREATE TYPE visitor_status AS ENUM ('pending', 'active', 'completed', 'rejected');

-- 3. Create Visitors Table
CREATE TABLE public.visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_name TEXT NOT NULL,
    visitor_type visitor_type NOT NULL DEFAULT 'tamu',
    destination_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    purpose TEXT,
    pin_code VARCHAR(6), -- Generated for pre-registered guests
    status visitor_status NOT NULL DEFAULT 'pending',
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id), -- Null if Walk-in (Security created), User ID if pre-registered
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Admins and Security can do everything
CREATE POLICY "Admins and Security can manage all visitors"
ON public.visitors
FOR ALL
USING (
    is_admin() OR is_security()
);

-- Residents can see their own visitors (where destination_user_id matches their profile ID)
CREATE POLICY "Residents can view their own visitors"
ON public.visitors
FOR SELECT
USING (
    destination_user_id = auth.uid() OR created_by = auth.uid()
);

-- Residents can create pre-registered visitors for themselves
CREATE POLICY "Residents can create their own visitors"
ON public.visitors
FOR INSERT
WITH CHECK (
    created_by = auth.uid() AND destination_user_id = auth.uid()
);

-- Residents can update ONLY the status of their pending walk-in visitors (Approve/Reject)
CREATE POLICY "Residents can approve/reject walk-in visitors"
ON public.visitors
FOR UPDATE
USING (
    destination_user_id = auth.uid() AND status = 'pending'
)
WITH CHECK (
    destination_user_id = auth.uid()
);

-- 6. Trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.visitors 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Add comments for PostgREST
COMMENT ON TABLE public.visitors IS 'Table to store visitor logs for Buku Tamu feature';
