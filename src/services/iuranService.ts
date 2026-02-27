import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';

export interface Fee {
    id: number;
    name: string;
    amount: number;
    due_date_day: number;
    is_active: boolean;
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
    amount: number;
}

export interface BillSummary {
    items: BillItem[];
    total: number;
    totalPaid: number;
    totalUnpaid: number;
    dueDate: string;
    allPaid: boolean;
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
 * Calculate bill summary aggregating ALL active fees for the current month.
 * Returns per-fee breakdown + totals.
 */
export const calculateBillSummary = async (userId: string): Promise<BillSummary> => {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;

    // Fetch all active fees
    const fees = await fetchActiveFees();
    if (fees.length === 0) {
        return {
            items: [],
            total: 0,
            totalPaid: 0,
            totalUnpaid: 0,
            dueDate: '-',
            allPaid: true,
        };
    }

    // Fetch all payments for this user in the current month
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .eq('period', currentMonth);

    const paidFeeIds = new Set(
        (payments || [])
            .filter(p => p.status === 'paid')
            .map(p => p.fee_id)
    );

    // Build per-fee breakdown
    const items: BillItem[] = fees.map(fee => ({
        fee,
        isPaid: paidFeeIds.has(fee.id),
        amount: fee.amount,
    }));

    const totalPaid = items.filter(i => i.isPaid).reduce((sum, i) => sum + i.amount, 0);
    const totalUnpaid = items.filter(i => !i.isPaid).reduce((sum, i) => sum + i.amount, 0);
    const allPaid = items.every(i => i.isPaid);

    // Use the earliest due date among unpaid fees
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthName = months[currentDate.getMonth()];

    const earliestDueDay = allPaid
        ? null
        : Math.min(...items.filter(i => !i.isPaid).map(i => i.fee.due_date_day));

    const dueDate = allPaid
        ? 'Lunas'
        : `${earliestDueDay} ${monthName} ${currentDate.getFullYear()}`;

    return {
        items,
        total: items.reduce((sum, i) => sum + i.amount, 0),
        totalPaid,
        totalUnpaid,
        dueDate,
        allPaid,
    };
};
