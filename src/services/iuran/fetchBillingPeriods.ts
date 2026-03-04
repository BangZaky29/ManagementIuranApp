import { supabase } from '../../lib/supabaseConfig';
import { SmartBillSummary, BillingPeriod, BillItem } from './types';
import { fetchActiveFees } from './fetchActiveFees';

export const fetchBillingPeriods = async (userId: string): Promise<SmartBillSummary> => {
    const { data: profile } = await supabase.from('profiles').select('created_at, housing_complex_id').eq('id', userId).single();

    let startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);

    if (profile?.created_at) {
        const joinDate = new Date(profile.created_at);
        joinDate.setDate(1);
        if (joinDate > startDate) {
            startDate = joinDate;
        }
    }

    const currentDate = new Date();
    const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const fees = await fetchActiveFees(profile?.housing_complex_id);
    if (fees.length === 0) {
        return { periods: [], totalOverdue: 0, totalCurrent: 0, totalUnpaid: 0 };
    }
    fees.forEach(f => f.amount = Number(f.amount));

    let nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    fees.forEach(fee => {
        if (fee.active_to) {
            const [ty, tm] = fee.active_to.split('-');
            const feeEnd = new Date(parseInt(ty), parseInt(tm) - 1, 1);
            if (feeEnd > nextMonthDate) {
                nextMonthDate = feeEnd;
            }
        }
    });

    const monthsToCheck: Date[] = [];
    let d = new Date(startDate);
    while (d <= nextMonthDate) {
        monthsToCheck.push(new Date(d));
        d.setMonth(d.getMonth() + 1);
    }

    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId);

    const periods: BillingPeriod[] = [];
    const localeMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    monthsToCheck.forEach(monthDate => {
        const periodStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-01`;
        const idStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
        const mName = `${localeMonths[monthDate.getMonth()]} ${monthDate.getFullYear()}`;

        const isCurrentMonth = monthDate.getTime() === currentMonthDate.getTime();
        const isPastMonth = monthDate.getTime() < currentMonthDate.getTime();

        const periodPayments = (payments || []).filter(p => p.period === periodStr);
        const paymentMap = new Map<number, typeof periodPayments[0]>();
        periodPayments.forEach(p => paymentMap.set(p.fee_id, p));

        const items: BillItem[] = fees
            .filter(fee => {
                const targetY = monthDate.getFullYear();
                const targetM = monthDate.getMonth();

                let effectiveFromY = -1;
                let effectiveFromM = -1;

                if (fee.active_from) {
                    const [fy, fm] = fee.active_from.split('-');
                    effectiveFromY = parseInt(fy);
                    effectiveFromM = parseInt(fm) - 1;
                } else if (fee.created_at) {
                    const cDate = new Date(fee.created_at);
                    effectiveFromY = cDate.getFullYear();
                    effectiveFromM = cDate.getMonth();
                }

                if (effectiveFromY !== -1) {
                    if (targetY < effectiveFromY || (targetY === effectiveFromY && targetM < effectiveFromM)) return false;
                }

                if (fee.active_to) {
                    const [ty, tm] = fee.active_to.split('-');
                    const toY = parseInt(ty);
                    const toM = parseInt(tm) - 1;
                    if (targetY > toY || (targetY === toY && targetM > toM)) return false;
                }
                return true;
            })
            .map(fee => {
                const p = paymentMap.get(fee.id);
                let status: 'paid' | 'pending' | 'unpaid' | 'rejected' = 'unpaid';
                let rejectionReason = undefined;
                let rawPaymentId = undefined;

                if (p?.status === 'paid') status = 'paid';
                else if (p?.status === 'pending') status = 'pending';
                else if (p?.status === 'rejected') {
                    status = 'rejected';
                    rejectionReason = p.rejection_reason || 'Ditolak (hubungi admin)';
                }

                if (p?.id) rawPaymentId = p.id;

                return {
                    fee,
                    isPaid: status === 'paid',
                    status,
                    amount: Number(fee.amount),
                    rejectionReason,
                    rawPaymentId
                };
            });

        if (items.length === 0) return;

        const paidCount = items.filter(i => i.status === 'paid').length;
        const pendingCount = items.filter(i => i.status === 'pending').length;
        const rejectedCount = items.filter(i => i.status === 'rejected').length;
        const unpaidCount = items.filter(i => i.status === 'unpaid' || i.status === 'rejected').length;

        let periodStatus: BillingPeriod['status'] = 'unpaid';
        if (paidCount === items.length) periodStatus = 'paid';
        else if (pendingCount > 0 && unpaidCount === 0) periodStatus = 'pending';
        else if (paidCount > 0 || pendingCount > 0 || rejectedCount > 0) periodStatus = 'partial';

        if (periodStatus === 'unpaid' || periodStatus === 'partial') {
            if (isPastMonth) periodStatus = 'overdue';
        }

        periods.push({
            id: idStr,
            periodDate: periodStr,
            monthName: mName,
            status: periodStatus,
            totalAmount: items.reduce((s, i) => s + i.amount, 0),
            unpaidAmount: items.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0),
            items,
            isCurrentMonth,
            isOverdue: periodStatus === 'overdue'
        });
    });

    periods.sort((a, b) => new Date(b.periodDate).getTime() - new Date(a.periodDate).getTime());

    let totalOverdue = 0;
    let totalCurrent = 0;
    let totalUnpaid = 0;

    periods.forEach(p => {
        if (p.isOverdue) totalOverdue += p.unpaidAmount;
        if (p.isCurrentMonth && (p.status === 'unpaid' || p.status === 'partial')) totalCurrent += p.unpaidAmount;
        if (p.status === 'unpaid' || p.status === 'overdue' || p.status === 'partial') totalUnpaid += p.unpaidAmount;
    });

    return { periods, totalOverdue, totalCurrent, totalUnpaid };
};
