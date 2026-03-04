import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { PendingPaymentItem } from './types';

export const fetchPaymentsByStatus = async (
    status: 'pending' | 'paid' | 'rejected' | 'all'
): Promise<PendingPaymentItem[]> => {
    let query = supabase
        .from('payments')
        .select(`
            *,
            profiles:user_id (full_name, address, avatar_url, wa_phone),
            fees:fee_id (name)
        `)
        .order('created_at', { ascending: false });

    if (status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw new AppError(error.message, 'FETCH_PAYMENTS', 'Gagal memuat data pembayaran.');
    return (data || []) as PendingPaymentItem[];
};
