import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { PaymentMethod } from './types';

export const fetchPaymentMethodsForUser = async (): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('method_type', { ascending: true });

    if (error) throw new AppError(error.message, 'FETCH_PAYMENT_METHODS', 'Gagal memuat metode pembayaran.');
    return (data || []) as PaymentMethod[];
};
