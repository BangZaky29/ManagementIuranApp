import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const updateBanner = async (
    id: string,
    title: string,
    imageUrl: string,
    targetUrl?: string,
    description?: string,
    startDate?: string,
    endDate?: string
): Promise<void> => {
    const { error } = await supabase
        .from('banners')
        .update({
            title,
            description,
            image_url: imageUrl,
            target_url: targetUrl || null,
            start_date: startDate,
            end_date: endDate,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        throw new AppError(error.message, 'UPDATE_BANNER_FAILED', 'Gagal memperbarui data iklan.');
    }
};
