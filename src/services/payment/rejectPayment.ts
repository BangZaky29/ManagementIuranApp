import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const rejectPayment = async (
    paymentId: string,
    adminId: string,
    reason: string
): Promise<void> => {
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
        .from('payments')
        .update({
            status: 'rejected',
            confirmed_by: adminId,
            confirmed_at: now,
            rejection_reason: reason,
            updated_at: now,
        })
        .eq('id', paymentId);

    if (updateError) throw new AppError(updateError.message, 'REJECT_PAYMENT', 'Gagal menolak pembayaran.');

    const { error: logError } = await supabase
        .from('payment_confirmations')
        .insert({
            payment_id: paymentId,
            admin_id: adminId,
            action: 'rejected',
            notes: reason,
        });

    if (logError) console.error('Failed to log rejection:', logError);
};
