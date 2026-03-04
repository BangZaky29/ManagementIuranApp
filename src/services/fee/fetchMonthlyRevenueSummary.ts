import { supabase } from '../../lib/supabaseConfig';
import { MonthlyRevenue } from './types';
import { fetchAdminFees } from './fetchAdminFees';

export const fetchMonthlyRevenueSummary = async (period: string): Promise<MonthlyRevenue> => {
    const fees = await fetchAdminFees();
    const [py, pm] = period.split('-');
    const targetY = parseInt(py);
    const targetM = parseInt(pm) - 1;

    const activeFees = fees.filter(f => {
        if (!f.is_active) return false;

        if (f.active_from) {
            const [fy, fm] = f.active_from.split('-');
            const fromY = parseInt(fy);
            const fromM = parseInt(fm) - 1;
            if (targetY < fromY || (targetY === fromY && targetM < fromM)) return false;
        }
        if (f.active_to) {
            const [ty, tm] = f.active_to.split('-');
            const toY = parseInt(ty);
            const toM = parseInt(tm) - 1;
            if (targetY > toY || (targetY === toY && targetM > toM)) return false;
        }
        return true;
    });

    const { count: wargaCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'warga');

    const totalWarga = wargaCount || 0;
    const totalExpected = activeFees.reduce((sum, f) => sum + f.amount, 0) * totalWarga;

    const { data: payments } = await supabase
        .from('payments')
        .select('user_id, status, amount')
        .eq('period', period);

    const paymentList = payments || [];
    const totalCollected = paymentList
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPending = paymentList
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const paidUserIds = new Set(paymentList.filter(p => p.status === 'paid').map(p => p.user_id));

    return {
        totalExpected,
        totalCollected,
        totalPending,
        totalWarga,
        paidWargaCount: paidUserIds.size,
        collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0,
    };
};
