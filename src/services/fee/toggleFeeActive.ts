import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const toggleFeeActive = async (id: number, isActive: boolean): Promise<void> => {
    const { error } = await supabase
        .from('fees')
        .update({ is_active: !isActive })
        .eq('id', id);

    if (error) throw new AppError(error.message, 'TOGGLE_FEE', 'Gagal mengubah status iuran.');
};
