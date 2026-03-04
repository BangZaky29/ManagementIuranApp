import { supabase } from '../../lib/supabaseConfig';
import { OverallRevenue } from './types';
import { fetchAdminFees } from './fetchAdminFees';

export const fetchOverallRevenueSummary = async (): Promise<OverallRevenue> => {
    const fees = await fetchAdminFees();
    if (fees.length === 0) return { totalExpected: 0, totalCollected: 0, totalPending: 0, totalWarga: 0 };

    const { count: wargaCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'warga');
    const totalWarga = wargaCount || 0;

    const { data: allPayments } = await supabase
        .from('payments')
        .select('fee_id, period, status, amount');
    const paymentList = allPayments || [];

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalExpected = 0;
    let totalCollected = 0;
    let totalPending = 0;

    fees.forEach(fee => {
        let start = fee.active_from ? new Date(fee.active_from) : new Date(fee.created_at);
        start = new Date(start.getFullYear(), start.getMonth(), 1);

        let end = fee.active_to ? new Date(fee.active_to) : currentMonth;
        end = new Date(end.getFullYear(), end.getMonth(), 1);

        if (start <= end) {
            let months = 0;
            let temp = new Date(start);
            while (temp <= end) {
                months++;
                temp.setMonth(temp.getMonth() + 1);
            }
            totalExpected += fee.amount * months * totalWarga;
        }

        const feePayments = paymentList.filter(p => {
            if (p.fee_id !== fee.id) return false;

            const pDate = new Date(p.period);
            const pMonth = new Date(pDate.getFullYear(), pDate.getMonth(), 1);

            return pMonth >= start && pMonth <= end;
        });

        totalCollected += feePayments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        totalPending += feePayments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + Number(p.amount), 0);
    });

    return {
        totalExpected,
        totalCollected,
        totalPending,
        totalWarga,
    };
};
