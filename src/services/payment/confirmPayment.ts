import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const confirmPayment = async (
    paymentId: string,
    adminId: string,
    notes?: string
): Promise<void> => {
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
        .from('payments')
        .update({
            status: 'paid',
            confirmed_by: adminId,
            confirmed_at: now,
            admin_notes: notes || null,
            paid_at: now,
            updated_at: now,
        })
        .eq('id', paymentId);

    if (updateError) throw new AppError(updateError.message, 'CONFIRM_PAYMENT', 'Gagal mengkonfirmasi pembayaran.');

    const { error: logError } = await supabase
        .from('payment_confirmations')
        .insert({
            payment_id: paymentId,
            admin_id: adminId,
            action: 'approved',
            notes: notes || null,
        });

    if (logError) console.error('Failed to log confirmation:', logError);
};
