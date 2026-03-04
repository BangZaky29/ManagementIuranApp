import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { CreatePaymentMethodData, PaymentMethod } from './types';

export const createPaymentMethod = async (
    data: CreatePaymentMethodData,
    adminId: string
): Promise<PaymentMethod> => {
    const { data: result, error } = await supabase
        .from('payment_methods')
        .insert({
            ...data,
            created_by: adminId,
        })
        .select()
        .single();

    if (error) throw new AppError(error.message, 'CREATE_METHOD', 'Gagal menambah metode pembayaran.');
    return result as PaymentMethod;
};
