import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { PendingPaymentItem } from './types';

export const fetchPaymentDetail = async (paymentId: string): Promise<PendingPaymentItem | null> => {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            profiles:user_id (full_name, address, avatar_url, wa_phone),
            fees:fee_id (name)
        `)
        .eq('id', paymentId)
        .single();

    if (error) throw new AppError(error.message, 'FETCH_PAYMENT_DETAIL', 'Gagal memuat detail pembayaran.');
    return data as PendingPaymentItem;
};
