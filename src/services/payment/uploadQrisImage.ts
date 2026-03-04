import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export const uploadQrisImage = async (
    adminId: string,
    imageUri: string,
    fileName: string
): Promise<string> => {
    try {
        const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `qris/${adminId}/${fileName}`;

        const base64 = await readAsStringAsync(imageUri, { encoding: 'base64' });

        const { error } = await supabase.storage
            .from('payment-proofs')
            .upload(filePath, decode(base64), {
                contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
                upsert: true,
            });

        if (error) throw new AppError(error.message, 'UPLOAD_QRIS', 'Gagal mengupload gambar QRIS.');

        const { data: urlData } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        console.error('QRIS upload error:', error);
        throw new AppError(error.message || 'Unknown error', 'UPLOAD_QRIS', 'Gagal mengupload gambar QRIS.');
    }
};
