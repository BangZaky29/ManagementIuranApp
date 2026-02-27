import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';

export interface AdminFee {
    id: number;
    name: string;
    amount: number;
    due_date_day: number;
    is_active: boolean;
    housing_complex_id: number;
    active_from: string | null;
    active_to: string | null;
    created_at: string;
}

export interface CreateFeeData {
    name: string;
    amount: number;
    due_date_day: number;
    housing_complex_id: number;
    active_from?: string | null;
    active_to?: string | null;
}

/**
 * Fetch all fees for admin's housing complex.
 * RLS ensures admin only sees fees from their complex.
 */
export const fetchAdminFees = async (): Promise<AdminFee[]> => {
    const { data, error } = await supabase
        .from('fees')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 'FETCH_FEES', 'Gagal memuat data iuran.');
    return (data || []) as AdminFee[];
};

/**
 * Create a new fee (admin only).
 */
export const createFee = async (feeData: CreateFeeData): Promise<AdminFee> => {
    const { data, error } = await supabase
        .from('fees')
        .insert({
            name: feeData.name,
            amount: feeData.amount,
            due_date_day: feeData.due_date_day,
            housing_complex_id: feeData.housing_complex_id,
            active_from: feeData.active_from || null,
            active_to: feeData.active_to || null,
            is_active: true,
        })
        .select()
        .single();

    if (error) throw new AppError(error.message, 'CREATE_FEE', 'Gagal menambah iuran baru.');
    return data as AdminFee;
};

/**
 * Update an existing fee (admin only).
 */
export const updateFee = async (
    id: number,
    updates: Partial<Pick<AdminFee, 'name' | 'amount' | 'due_date_day' | 'is_active' | 'active_from' | 'active_to'>>
): Promise<AdminFee> => {
    const { data, error } = await supabase
        .from('fees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new AppError(error.message, 'UPDATE_FEE', 'Gagal mengupdate iuran.');
    return data as AdminFee;
};

/**
 * Delete a fee (admin only).
 */
export const deleteFee = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('fees')
        .delete()
        .eq('id', id);

    if (error) throw new AppError(error.message, 'DELETE_FEE', 'Gagal menghapus iuran.');
};

/**
 * Toggle active status of a fee.
 */
export const toggleFeeActive = async (id: number, isActive: boolean): Promise<void> => {
    const { error } = await supabase
        .from('fees')
        .update({ is_active: !isActive })
        .eq('id', id);

    if (error) throw new AppError(error.message, 'TOGGLE_FEE', 'Gagal mengubah status iuran.');
};

// ============ ANALYTICS ============

export interface FeePaymentStat {
    fee: AdminFee;
    totalWarga: number;
    paidCount: number;
    pendingCount: number;
    unpaidCount: number;
    collectedAmount: number;
    expectedAmount: number;
    collectionRate: number; // 0-100
}

export interface PayerInfo {
    userId: string;
    fullName: string;
    address: string | null;
    avatarUrl: string | null;
    status: 'paid' | 'pending' | 'unpaid' | 'rejected';
    amount: number;
    paidAt: string | null;
    paymentMethod: string | null;
}

export interface MonthlyRevenue {
    totalExpected: number;
    totalCollected: number;
    totalPending: number;
    totalWarga: number;
    paidWargaCount: number;
    collectionRate: number;
}

/**
 * Fetch payment stats per fee for a given month period.
 */
export const fetchFeePaymentStats = async (period: string): Promise<FeePaymentStat[]> => {
    // Get active fees
    const fees = await fetchAdminFees();
    const activeFees = fees.filter(f => f.is_active);

    if (activeFees.length === 0) return [];

    // Get total warga count in this complex (RLS handles filtering)
    const { count: wargaCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'warga');

    const totalWarga = wargaCount || 0;

    // Get all payments for this period
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

/**
 * Fetch individual payers for a specific fee + period with optional status filter.
 */
export const fetchFeePayerList = async (
    feeId: number,
    period: string,
    statusFilter: 'all' | 'paid' | 'pending' | 'unpaid'
): Promise<PayerInfo[]> => {
    // Get all warga in this complex
    const { data: wargaList } = await supabase
        .from('profiles')
        .select('id, full_name, address, avatar_url')
        .eq('role', 'warga')
        .order('full_name');

    if (!wargaList || wargaList.length === 0) return [];

    // Get payments for this fee + period
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

/**
 * Monthly revenue summary across all active fees.
 */
export const fetchMonthlyRevenueSummary = async (period: string): Promise<MonthlyRevenue> => {
    const fees = await fetchAdminFees();
    const activeFees = fees.filter(f => f.is_active);

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
