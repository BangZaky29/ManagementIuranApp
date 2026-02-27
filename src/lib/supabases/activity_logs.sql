-- ==============================================================================
-- Table: activity_logs
-- Deskripsi: Menyimpan ringkasan aktivitas warga (pembayaran, laporan, darurat, dll)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    housing_complex_id bigint NOT NULL,
    user_id uuid NOT NULL,
    action_type text NOT NULL, -- e.g., 'payment', 'report', 'panic', 'visitor'
    action_title text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
    CONSTRAINT activity_logs_complex_fkey FOREIGN KEY (housing_complex_id) REFERENCES public.housing_complexes(id) ON DELETE CASCADE,
    CONSTRAINT activity_logs_user_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- RLS (Row Level Security)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity logs of their complex"
ON public.activity_logs FOR SELECT
USING (
    is_admin() AND (housing_complex_id = (SELECT housing_complex_id FROM profiles WHERE id = auth.uid()))
);

CREATE POLICY "Security can view activity logs of their complex"
ON public.activity_logs FOR SELECT
USING (
    is_security() AND (housing_complex_id = (SELECT housing_complex_id FROM profiles WHERE id = auth.uid()))
);

-- ==============================================================================
-- Triggers for automatic logging
-- ==============================================================================

-- 1. TRIGGER: Payments
CREATE OR REPLACE FUNCTION log_payment_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_complex_id bigint;
BEGIN
    SELECT housing_complex_id INTO v_complex_id FROM profiles WHERE id = NEW.user_id;
    
    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
        INSERT INTO activity_logs (housing_complex_id, user_id, action_type, action_title, description)
        VALUES (v_complex_id, NEW.user_id, 'payment', 'Upload Bukti Iuran', 'Mengirim pembayaran sebesar Rp ' || NEW.amount);
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'paid' AND OLD.status != 'paid' THEN
        INSERT INTO activity_logs (housing_complex_id, user_id, action_type, action_title, description)
        VALUES (v_complex_id, NEW.user_id, 'payment', 'Iuran Dikonfirmasi', 'Pembayaran sebesar Rp ' || NEW.amount || ' disetujui');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_payment_change ON payments;
CREATE TRIGGER on_payment_change
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION log_payment_activity();

-- 2. TRIGGER: Reports (Laporan)
CREATE OR REPLACE FUNCTION log_report_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_complex_id bigint;
BEGIN
    SELECT housing_complex_id INTO v_complex_id FROM profiles WHERE id = NEW.user_id;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (housing_complex_id, user_id, action_type, action_title, description)
        VALUES (v_complex_id, NEW.user_id, 'report', 'Membuat Laporan Baru', NEW.title);
    ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
        INSERT INTO activity_logs (housing_complex_id, user_id, action_type, action_title, description)
        VALUES (v_complex_id, NEW.user_id, 'report', 'Status Laporan Berubah', 'Status laporan "' || NEW.title || '" menjadi ' || NEW.status);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_report_change ON reports;
CREATE TRIGGER on_report_change
AFTER INSERT OR UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION log_report_activity();

-- 3. TRIGGER: Panic Logs (Darurat)
CREATE OR REPLACE FUNCTION log_panic_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_complex_id bigint;
BEGIN
    SELECT housing_complex_id INTO v_complex_id FROM profiles WHERE id = NEW.user_id;
    INSERT INTO activity_logs (housing_complex_id, user_id, action_type, action_title, description)
    VALUES (v_complex_id, NEW.user_id, 'panic', '🚨 Tombol Darurat Ditekan', 'Warga membutuhkan bantuan segera!');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_panic_insert ON panic_logs;
CREATE TRIGGER on_panic_insert
AFTER INSERT ON panic_logs
FOR EACH ROW EXECUTE FUNCTION log_panic_activity();

-- 4. TRIGGER: Visitors (Tamu)
CREATE OR REPLACE FUNCTION log_visitor_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_complex_id bigint;
BEGIN
    v_complex_id := NEW.housing_complex_id;
    INSERT INTO activity_logs (housing_complex_id, user_id, action_type, action_title, description)
    VALUES (v_complex_id, NEW.created_by, 'visitor', 'Mendaftarkan Tamu', 'Tamu bernama: ' || NEW.visitor_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_visitor_insert ON visitors;
CREATE TRIGGER on_visitor_insert
AFTER INSERT ON visitors
FOR EACH ROW EXECUTE FUNCTION log_visitor_activity();
