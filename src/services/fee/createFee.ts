import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { AdminFee, CreateFeeData } from './types';

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
