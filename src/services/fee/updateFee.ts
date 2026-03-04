import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { AdminFee } from './types';

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
