import { supabase } from '../lib/supabaseConfig';

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
    status: 'pending' | 'paid' | 'overdue';
    payment_method: string | null;
    paid_at: string | null;
    proof_url: string | null;
}

export const fetchActiveFees = async (): Promise<Fee[]> => {
    const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('is_active', true);

    if (error) throw error;
    return data as Fee[];
};

export const fetchMyPayments = async (): Promise<PaymentRecord[]> => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('period', { ascending: false });

    if (error) throw error;
    return data as PaymentRecord[];
};

// Simplified: Assumes 1 active fee for now
export const calculateBillSummary = async (userId: string) => {
    // Logic: Get active fee, check if payment exists for this month
    const currentDATE = new Date();
    const currentMonth = `${currentDATE.getFullYear()}-${String(currentDATE.getMonth() + 1).padStart(2, '0')}-01`;

    const fees = await fetchActiveFees();
    if (fees.length === 0) return { total: 0, dueDate: '-' };

    const activeFee = fees[0]; // Take first active fee for simplicity

    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .eq('fee_id', activeFee.id)
        .eq('period', currentMonth)
        .single();

    if (payments && payments.status === 'paid') {
        return { total: 0, dueDate: 'Lunas', isPaid: true };
    }

    // Safer Manual Date Formatting
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthName = months[currentDATE.getMonth()];

    return {
        total: activeFee.amount,
        dueDate: `${activeFee.due_date_day} ${monthName} ${currentDATE.getFullYear()}`,
        isPaid: false
    };
};
