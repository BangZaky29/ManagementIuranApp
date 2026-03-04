import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { CreatePaymentMethodData, PaymentMethod } from './types';

export const updatePaymentMethod = async (
    id: number,
    updates: Partial<CreatePaymentMethodData> & { is_active?: boolean }
): Promise<PaymentMethod> => {
    const { data, error } = await supabase
        .from('payment_methods')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new AppError(error.message, 'UPDATE_METHOD', 'Gagal mengupdate metode pembayaran.');
    return data as PaymentMethod;
};
