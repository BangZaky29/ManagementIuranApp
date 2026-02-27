import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';

export interface Fee {
    id: number;
    name: string;
    amount: number;
    due_date_day: number;
    is_active: boolean;
    housing_complex_id: number;
    active_from?: string | null;
    active_to?: string | null;
    created_at: string;
}

export interface PaymentRecord {
    id: string;
    user_id: string;
    fee_id: number;
    amount: number;
    period: string; // YYYY-MM-DD
    status: 'pending' | 'paid' | 'overdue' | 'rejected';
    payment_method: string | null;
    paid_at: string | null;
    proof_url: string | null;
    confirmed_by: string | null;
    confirmed_at: string | null;
    admin_notes: string | null;
    rejection_reason: string | null;
}

export interface BillItem {
    fee: Fee;
    isPaid: boolean;
    status: 'paid' | 'pending' | 'unpaid';
    amount: number;
}

export interface BillingPeriod {
    id: string; // format YYYY-MM
    periodDate: string; // format YYYY-MM-01
    monthName: string; // e.g. "Januari 2026"
    status: 'paid' | 'pending' | 'unpaid' | 'overdue' | 'partial';
    totalAmount: number;
    items: BillItem[];
    isCurrentMonth: boolean;
    isOverdue: boolean;
}

export interface SmartBillSummary {
    periods: BillingPeriod[];
    totalOverdue: number;
    totalCurrent: number;
    totalUnpaid: number;
}

export const fetchActiveFees = async (): Promise<Fee[]> => {
    const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('is_active', true);

    if (error) throw new AppError(error.message, 'FETCH_FEES', 'Gagal memuat data iuran.');
    return data as Fee[];
};

export const fetchMyPayments = async (): Promise<PaymentRecord[]> => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('period', { ascending: false });

    if (error) throw new AppError(error.message, 'FETCH_PAYMENTS', 'Gagal memuat riwayat pembayaran.');
    return data as PaymentRecord[];
};

/**
 * Generate billing periods from user's join date up to next month.
 */
export const fetchBillingPeriods = async (userId: string): Promise<SmartBillSummary> => {
    // 1. Fetch user to get created_at
    const { data: profile } = await supabase.from('profiles').select('created_at').eq('id', userId).single();
    
    // Default to Jan 1st of current year if no valid created_at, or max 12 months ago to prevent massive queries
    let startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11); // max 1 year ago by default
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
    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    
    // Generate all months from startDate to nextMonthDate
    const monthsToCheck: Date[] = [];
    let d = new Date(startDate);
    while (d <= nextMonthDate) {
        monthsToCheck.push(new Date(d));
        d.setMonth(d.getMonth() + 1);
    }

    // 2. Fetch all active fees
    const fees = await fetchActiveFees();
    if (fees.length === 0) {
        return { periods: [], totalOverdue: 0, totalCurrent: 0, totalUnpaid: 0 };
    }
    const totalFeeAmount = fees.reduce((sum, f) => sum + f.amount, 0);

    // 3. Fetch all payments for this user
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId);

    // 4. Build periods
    const periods: BillingPeriod[] = [];
    const localeMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    monthsToCheck.forEach(monthDate => {
        const periodStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-01`;
        const idStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
        const mName = `${localeMonths[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
        
        const isCurrentMonth = monthDate.getTime() === currentMonthDate.getTime();
        const isPastMonth = monthDate.getTime() < currentMonthDate.getTime();

        // Find payments for this exactly period
        const periodPayments = (payments || []).filter(p => p.period === periodStr);
        const paymentMap = new Map<number, typeof periodPayments[0]>();
        periodPayments.forEach(p => paymentMap.set(p.fee_id, p));

        // Build items
        const items: BillItem[] = fees
            .filter(fee => {
                const targetY = monthDate.getFullYear();
                const targetM = monthDate.getMonth();

                // Check active periods
                if (fee.active_from) {
                    const [fy, fm] = fee.active_from.split('-');
                    const fromY = parseInt(fy);
                    const fromM = parseInt(fm) - 1;
                    if (targetY < fromY || (targetY === fromY && targetM < fromM)) return false;
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
                let status: 'paid' | 'pending' | 'unpaid' = 'unpaid';
                if (p?.status === 'paid') status = 'paid';
            else if (p?.status === 'pending') status = 'pending';

            return {
                fee,
                isPaid: status === 'paid',
                status,
                amount: fee.amount,
            };
        });

        // If no fees are applicable for this month, skip creating a period
        if (items.length === 0) return;

        // Determine period status
        const paidCount = items.filter(i => i.status === 'paid').length;
        const pendingCount = items.filter(i => i.status === 'pending').length;
        const unpaidCount = items.filter(i => i.status === 'unpaid').length;

        let periodStatus: BillingPeriod['status'] = 'unpaid';
        if (paidCount === items.length) periodStatus = 'paid';
        else if (pendingCount > 0 && unpaidCount === 0) periodStatus = 'pending';
        else if (paidCount > 0 || pendingCount > 0) periodStatus = 'partial';
        
        if (periodStatus === 'unpaid' || periodStatus === 'partial') {
            if (isPastMonth) periodStatus = 'overdue';
        }

        periods.push({
            id: idStr,
            periodDate: periodStr,
            monthName: mName,
            status: periodStatus,
            totalAmount: items.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0),
            items,
            isCurrentMonth,
            isOverdue: periodStatus === 'overdue'
        });
    });

    // We can filter out NEXT month if the current month is unpaid to keep UI clean, 
    // or we just show it. Let's just return all of them.
    // Ensure chronological order
    periods.sort((a, b) => new Date(a.periodDate).getTime() - new Date(b.periodDate).getTime());

    let totalOverdue = 0;
    let totalCurrent = 0;
    let totalUnpaid = 0;

    periods.forEach(p => {
        if (p.isOverdue) totalOverdue += p.totalAmount;
        if (p.isCurrentMonth && (p.status === 'unpaid' || p.status === 'partial')) totalCurrent += p.totalAmount;
        if (p.status === 'unpaid' || p.status === 'overdue' || p.status === 'partial') totalUnpaid += p.totalAmount;
    });

    return { periods, totalOverdue, totalCurrent, totalUnpaid };
};

/**
 * Submit bulk payments for multiple periods and fees using a single proof.
 */
export const submitBulkPayments = async (userId: string, selectedPeriods: BillingPeriod[], totalAmount: number, proofUrl: string, paymentMethod: string) => {
    const payload = [];
    
    for (const period of selectedPeriods) {
        // Only pay for items that are unpaid
        const unpaidItems = period.items.filter(i => i.status === 'unpaid');
        for (const item of unpaidItems) {
            payload.push({
                user_id: userId,
                fee_id: item.fee.id,
                amount: item.amount,
                period: period.periodDate,
                status: 'pending',
                payment_method: paymentMethod,
                proof_url: proofUrl,
            });
        }
    }

    if (payload.length === 0) return;

    const { error } = await supabase.from('payments').insert(payload);
    if (error) {
        throw new AppError(error.message, 'SUBMIT_BULK', 'Gagal memproses pembayaran batch.');
    }
};
