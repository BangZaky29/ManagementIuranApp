import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const deleteBanner = async (id: string, imageUrl?: string): Promise<void> => {
    const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

    if (error) {
        throw new AppError(error.message, 'DELETE_BANNER_FAILED', 'Gagal menghapus data iklan.');
    }

    if (imageUrl && imageUrl.includes('wargaPintar')) {
        try {
            const pathParts = imageUrl.split('wargaPintar/')[1];
            if (pathParts) {
                const filePath = pathParts.split('?')[0];
                await supabase.storage.from('wargaPintar').remove([filePath]);
            }
        } catch (storageErr) {
            console.warn('Failed to delete image from storage:', storageErr);
        }
    }
};
