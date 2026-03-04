import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { PaymentRecord } from './types';

export const fetchMyPayments = async (): Promise<PaymentRecord[]> => {
    const { data, error } = await supabase
        .from('payments')
        .select('*, fees(name)')
        .order('period', { ascending: false });

    if (error) throw new AppError(error.message, 'FETCH_PAYMENTS', 'Gagal memuat riwayat pembayaran.');
    return data as PaymentRecord[];
};
