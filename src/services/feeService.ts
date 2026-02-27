import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';

export interface AdminFee {
    id: number;
    name: string;
    amount: number;
    due_date_day: number;
    is_active: boolean;
    housing_complex_id: number;
    created_at: string;
}

export interface CreateFeeData {
    name: string;
    amount: number;
    due_date_day: number;
    housing_complex_id: number;
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
    updates: Partial<Pick<AdminFee, 'name' | 'amount' | 'due_date_day' | 'is_active'>>
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
