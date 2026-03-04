import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const deleteFee = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('fees')
        .delete()
        .eq('id', id);

    if (error) throw new AppError(error.message, 'DELETE_FEE', 'Gagal menghapus iuran.');
};
