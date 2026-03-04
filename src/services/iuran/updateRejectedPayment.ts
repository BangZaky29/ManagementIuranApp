import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const updateRejectedPayment = async (paymentId: string, proofUrl: string, paymentMethod: string) => {
    const { error } = await supabase
        .from('payments')
        .update({
            status: 'pending',
            proof_url: proofUrl,
            payment_method: paymentMethod,
            updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

    if (error) {
        throw new AppError(error.message, 'UPDATE_REJECTED', 'Gagal mengunggah ulang bukti pembayaran.');
    }
};
