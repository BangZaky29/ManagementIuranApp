-- ============================================================
-- Table: ewallet_va_codes
-- Menyimpan kode VA per bank untuk setiap e-wallet
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ewallet_va_codes (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ewallet_name text NOT NULL,          -- GoPay, OVO, DANA, ShopeePay
    bank_name text NOT NULL,             -- BCA, Mandiri, BNI, BRI, dll
    va_code text NOT NULL,               -- Kode VA / perusahaan
    format_example text NOT NULL,        -- Format input contoh
    created_at timestamptz DEFAULT now()
);

-- Index untuk query cepat per ewallet
CREATE INDEX idx_ewallet_va_codes_ewallet ON public.ewallet_va_codes(ewallet_name);

-- RLS: semua user authenticated bisa baca (data referensi publik)
ALTER TABLE public.ewallet_va_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read VA codes"
ON public.ewallet_va_codes FOR SELECT
TO authenticated
USING (true);

-- ============================================================
-- INSERT: Data kode VA per bank per e-wallet
-- ============================================================

-- GoPay
INSERT INTO public.ewallet_va_codes (ewallet_name, bank_name, va_code, format_example) VALUES
('GoPay', 'BCA',     '70001',  '70001 + No HP'),
('GoPay', 'Mandiri', '60737',  '60737 + No HP'),
('GoPay', 'BNI',     '9003',   '9003 + No HP'),
('GoPay', 'BRI',     '301341', '301341 + No HP'),
('GoPay', 'Permata', '898',    '898 + No HP');

-- OVO
INSERT INTO public.ewallet_va_codes (ewallet_name, bank_name, va_code, format_example) VALUES
('OVO', 'BCA',        '39358', '39358 + No HP'),
('OVO', 'Mandiri',    '60001', '60001 + No HP'),
('OVO', 'BNI',        '8740',  '8740 + No HP'),
('OVO', 'BRI',        '88099', '88099 + No HP'),
('OVO', 'CIMB Niaga', '8059',  '8059 + No HP');

-- DANA
INSERT INTO public.ewallet_va_codes (ewallet_name, bank_name, va_code, format_example) VALUES
('DANA', 'BCA',     '3901',  '3901 + No HP'),
('DANA', 'Mandiri', '89508', '89508 + No HP'),
('DANA', 'BNI',     '8810',  '8810 + No HP'),
('DANA', 'BRI',     '88810', '88810 + No HP'),
('DANA', 'Permata', '8528',  '8528 + No HP');

-- ShopeePay
INSERT INTO public.ewallet_va_codes (ewallet_name, bank_name, va_code, format_example) VALUES
('ShopeePay', 'BCA',     '122', '122 + No HP'),
('ShopeePay', 'Mandiri', '893', '893 + No HP'),
('ShopeePay', 'BNI',     '8807','8807 + No HP'),
('ShopeePay', 'BRI',     '112', '112 + No HP');
