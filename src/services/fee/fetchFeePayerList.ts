import { supabase } from '../../lib/supabaseConfig';
import { PayerInfo } from './types';

export const fetchFeePayerList = async (
    feeId: number,
    period: string,
    statusFilter: 'all' | 'paid' | 'pending' | 'unpaid'
): Promise<PayerInfo[]> => {
    const { data: wargaList } = await supabase
        .from('profiles')
        .select('id, full_name, address, avatar_url')
        .eq('role', 'warga')
        .order('full_name');

    if (!wargaList || wargaList.length === 0) return [];

    const { data: payments } = await supabase
        .from('payments')
        .select('user_id, status, amount, paid_at, payment_method')
        .eq('fee_id', feeId)
        .eq('period', period);

    const paymentMap = new Map<string, any>();
    (payments || []).forEach(p => paymentMap.set(p.user_id, p));

    const result: PayerInfo[] = wargaList.map(w => {
        const payment = paymentMap.get(w.id);
        return {
            userId: w.id,
            fullName: w.full_name || 'Tanpa Nama',
            address: w.address,
            avatarUrl: w.avatar_url,
            status: payment ? payment.status : 'unpaid',
            amount: payment ? Number(payment.amount) : 0,
            paidAt: payment?.paid_at || null,
            paymentMethod: payment?.payment_method || null,
        };
    });

    if (statusFilter === 'all') return result;
    return result.filter(p => p.status === statusFilter);
};
