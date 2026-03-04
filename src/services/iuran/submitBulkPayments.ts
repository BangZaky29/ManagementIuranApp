import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { BillingPeriod } from './types';

export const submitBulkPayments = async (userId: string, selectedPeriods: BillingPeriod[], totalAmount: number, proofUrl: string, paymentMethod: string) => {
    const inserts = [];
    const updatePromises = [];

    for (const period of selectedPeriods) {
        const unpaidItems = period.items.filter(i => i.status === 'unpaid');
        const rejectedItems = period.items.filter(i => i.status === 'rejected');

        for (const item of unpaidItems) {
            inserts.push({
                user_id: userId,
                fee_id: item.fee.id,
                amount: item.amount,
                period: period.periodDate,
                status: 'pending',
                payment_method: paymentMethod,
                proof_url: proofUrl,
            });
        }

        for (const item of rejectedItems) {
            if (item.rawPaymentId) {
                updatePromises.push(
                    supabase.from('payments').update({
                        status: 'pending',
                        proof_url: proofUrl,
                        payment_method: paymentMethod,
                        updated_at: new Date().toISOString()
                    }).eq('id', item.rawPaymentId).select()
                );
            } else {
                throw new AppError('rawPaymentId missing for ' + item.fee.name, 'MISSING_ID', 'Missing ID');
            }
        }
    }

    if (inserts.length > 0) {
        const { error } = await supabase.from('payments').insert(inserts);
        if (error) {
            throw new AppError(error.message, 'SUBMIT_BULK', 'Gagal memproses tagihan baru.');
        }
    }

    if (updatePromises.length > 0) {
        const results = await Promise.all(updatePromises);
        let updatedCount = 0;
        for (const res of results) {
            if (res.error) {
                throw new AppError(res.error.message, 'SUBMIT_BULK_REJECTED', 'Gagal mengulang tagihan yang ditolak.');
            }
            if (res.data && res.data.length > 0) {
                updatedCount++;
            } else {
                throw new AppError(`DB returned 0 rows updated`, 'SUBMIT_BULK_NO_UPDATE', 'Gagal memproses: baris tidak ditemukan.');
            }
        }
    }
};
