import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const deletePaymentMethod = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

    if (error) throw new AppError(error.message, 'DELETE_METHOD', 'Gagal menghapus metode pembayaran.');
};
