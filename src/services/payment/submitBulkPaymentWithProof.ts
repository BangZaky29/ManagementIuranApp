import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const submitBulkPaymentWithProof = async (params: {
    userId: string;
    fees: { feeId: number; amount: number }[];
    period: string;
    paymentMethodName: string;
    proofUrl: string;
}): Promise<void> => {
    const records = params.fees.map(f => ({
        user_id: params.userId,
        fee_id: f.feeId,
        amount: f.amount,
        period: params.period,
        status: 'pending',
        payment_method: params.paymentMethodName,
        proof_url: params.proofUrl,
    }));

    const { error } = await supabase
        .from('payments')
        .insert(records);

    if (error) throw new AppError(error.message, 'SUBMIT_BULK_PAYMENT', 'Gagal mengirim pembayaran.');
};
