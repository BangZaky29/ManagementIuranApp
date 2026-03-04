import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { PaymentMethod } from './types';

export const fetchAdminPaymentMethods = async (): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 'FETCH_ADMIN_METHODS', 'Gagal memuat metode pembayaran.');
    return (data || []) as PaymentMethod[];
};
