import { supabase } from '../../lib/supabaseConfig';
import { FeePaymentStat } from './types';
import { fetchAdminFees } from './fetchAdminFees';

export const fetchFeePaymentStats = async (period: string): Promise<FeePaymentStat[]> => {
    const fees = await fetchAdminFees();
    const [py, pm] = period.split('-');
    const targetY = parseInt(py);
    const targetM = parseInt(pm) - 1;

    const activeFees = fees.filter(f => {
        const now = new Date();
        const isCurrentOrFuture = targetY > now.getFullYear() || (targetY === now.getFullYear() && targetM >= now.getMonth());
        if (isCurrentOrFuture && !f.is_active) return false;

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

    if (activeFees.length === 0) return [];

    const { count: wargaCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'warga');

    const totalWarga = wargaCount || 0;

    const { data: payments } = await supabase
        .from('payments')
        .select('fee_id, status, amount')
        .eq('period', period);

    const paymentList = payments || [];

    return activeFees.map(fee => {
        const feePayments = paymentList.filter(p => p.fee_id === fee.id);
        const paidCount = feePayments.filter(p => p.status === 'paid').length;
        const pendingCount = feePayments.filter(p => p.status === 'pending').length;
        const unpaidCount = totalWarga - paidCount - pendingCount;
        const collectedAmount = feePayments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const expectedAmount = totalWarga * fee.amount;

        return {
            fee,
            totalWarga,
            paidCount,
            pendingCount,
            unpaidCount: Math.max(0, unpaidCount),
            collectedAmount,
            expectedAmount,
            collectionRate: expectedAmount > 0 ? Math.round((collectedAmount / expectedAmount) * 100) : 0,
        };
    });
};
