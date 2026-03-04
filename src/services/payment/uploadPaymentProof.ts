import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export const uploadPaymentProof = async (
    userId: string,
    paymentId: string,
    imageUri: string
): Promise<string> => {
    try {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const filePath = `${userId}/${paymentId}.jpg`;
        const { error } = await supabase.storage
            .from('payment-proofs')
            .upload(filePath, decode(base64), {
                upsert: true,
                contentType: 'image/jpeg'
            });

        if (error) throw new AppError(error.message, 'UPLOAD_PROOF', 'Gagal mengupload bukti pembayaran.');

        const { data: urlData } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        console.error('Payment proof upload error:', error);
        throw new AppError(error.message || 'Unknown error', 'UPLOAD_PROOF', 'Gagal mengupload bukti pembayaran.');
    }
};
