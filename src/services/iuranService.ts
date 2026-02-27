import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';

export interface Fee {
    id: number;
    name: string;
    amount: number;
    due_date_day: number;
    is_active: boolean;
    housing_complex_id: number;
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

export interface BillSummary {
    items: BillItem[];
    total: number;
    totalPaid: number;
    totalPending: number;
    totalUnpaid: number;
    pendingCount: number;
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
 * Now tracks paid, pending, AND unpaid statuses separately.
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
            totalPending: 0,
            totalUnpaid: 0,
            pendingCount: 0,
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

    const paymentMap = new Map<number, string>();
    (payments || []).forEach(p => paymentMap.set(p.fee_id, p.status));

    // Build per-fee breakdown with proper status
    const items: BillItem[] = fees.map(fee => {
        const paymentStatus = paymentMap.get(fee.id);
        let status: 'paid' | 'pending' | 'unpaid' = 'unpaid';
        if (paymentStatus === 'paid') status = 'paid';
        else if (paymentStatus === 'pending') status = 'pending';

        return {
            fee,
            isPaid: status === 'paid',
            status,
            amount: fee.amount,
        };
    });

    const totalPaid = items.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalPending = items.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
    const totalUnpaid = items.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0);
    const pendingCount = items.filter(i => i.status === 'pending').length;
    const allPaid = items.every(i => i.status === 'paid');

    // Use the earliest due date among unpaid fees
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthName = months[currentDate.getMonth()];

    const unpaidItems = items.filter(i => i.status === 'unpaid');
    const earliestDueDay = unpaidItems.length > 0
        ? Math.min(...unpaidItems.map(i => i.fee.due_date_day))
        : null;

    const dueDate = allPaid
        ? 'Lunas'
        : earliestDueDay
            ? `${earliestDueDay} ${monthName} ${currentDate.getFullYear()}`
            : '-';

    return {
        items,
        total: items.reduce((sum, i) => sum + i.amount, 0),
        totalPaid,
        totalPending,
        totalUnpaid,
        pendingCount,
        dueDate,
        allPaid,
    };
};
