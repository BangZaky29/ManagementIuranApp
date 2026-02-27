import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';

export interface PendingPaymentItem {
    id: string;
    user_id: string;
    fee_id: number;
    amount: number;
    period: string;
    status: string;
    payment_method: string | null;
    proof_url: string | null;
    created_at: string;
    updated_at: string;
    confirmed_by: string | null;
    confirmed_at: string | null;
    admin_notes: string | null;
    rejection_reason: string | null;
    // Joined data
    profiles?: {
        full_name: string;
        address: string | null;
        avatar_url: string | null;
        wa_phone: string | null;
    };
    fees?: {
        name: string;
    };
}

export interface PaymentConfirmationLog {
    id: number;
    payment_id: string;
    admin_id: string;
    action: 'approved' | 'rejected';
    notes: string | null;
    created_at: string;
}

/**
 * Fetch all payments for admin's complex (filtered by status).
 * RLS ensures admin only sees payments from their own complex.
 */
export const fetchPaymentsByStatus = async (
    status: 'pending' | 'paid' | 'rejected' | 'all'
): Promise<PendingPaymentItem[]> => {
    let query = supabase
        .from('payments')
        .select(`
            *,
            profiles:user_id (full_name, address, avatar_url, wa_phone),
            fees:fee_id (name)
        `)
        .order('created_at', { ascending: false });

    if (status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw new AppError(error.message, 'FETCH_PAYMENTS', 'Gagal memuat data pembayaran.');
    return (data || []) as PendingPaymentItem[];
};

/**
 * Fetch single payment detail for admin review.
 */
export const fetchPaymentDetail = async (paymentId: string): Promise<PendingPaymentItem | null> => {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            profiles:user_id (full_name, address, avatar_url, wa_phone),
            fees:fee_id (name)
        `)
        .eq('id', paymentId)
        .single();

    if (error) throw new AppError(error.message, 'FETCH_PAYMENT_DETAIL', 'Gagal memuat detail pembayaran.');
    return data as PendingPaymentItem;
};

/**
 * Admin confirms (approves) a payment.
 * Updates payment status to 'paid' and logs the confirmation.
 */
export const confirmPayment = async (
    paymentId: string,
    adminId: string,
    notes?: string
): Promise<void> => {
    const now = new Date().toISOString();

    // Update payment status
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

    // Log confirmation
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

/**
 * Admin rejects a payment.
 * Updates payment status to 'rejected' and logs rejection.
 */
export const rejectPayment = async (
    paymentId: string,
    adminId: string,
    reason: string
): Promise<void> => {
    const now = new Date().toISOString();

    // Update payment status
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

    // Log rejection
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

/**
 * Count pending payments for admin's complex.
 */
export const countPendingPayments = async (): Promise<number> => {
    const { count, error } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    if (error) return 0;
    return count || 0;
};

/**
 * Upload payment proof image to Supabase storage.
 * Path: payment-proofs/{userId}/{paymentId}.jpg
 */
export const uploadPaymentProof = async (
    userId: string,
    paymentId: string,
    imageUri: string
): Promise<string> => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const filePath = `${userId}/${paymentId}.jpg`;
    const { error } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, blob, { upsert: true, contentType: 'image/jpeg' });

    if (error) throw new AppError(error.message, 'UPLOAD_PROOF', 'Gagal mengupload bukti pembayaran.');

    const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

    return urlData.publicUrl;
};

/**
 * Warga creates a payment record with proof.
 */
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

/**
 * Warga submits payment for multiple fees at once.
 */
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
