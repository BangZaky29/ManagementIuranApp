import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const submitPaymentWithProof = async (params: {
    userId: string;
    feeId: number;
    amount: number;
    period: string;
    paymentMethodName: string;
    proofUrl: string;
}): Promise<string> => {
    const { data, error } = await supabase
        .from('payments')
        .insert({
            user_id: params.userId,
            fee_id: params.feeId,
            amount: params.amount,
            period: params.period,
            status: 'pending',
            payment_method: params.paymentMethodName,
            proof_url: params.proofUrl,
        })
        .select('id')
        .single();

    if (error) throw new AppError(error.message, 'SUBMIT_PAYMENT', 'Gagal mengirim pembayaran.');
    return data.id;
};
