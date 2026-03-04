import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const toggleBannerStatus = async (id: string, currentStatus: boolean): Promise<void> => {
    const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', id);

    if (error) {
        throw new AppError(error.message, 'UPDATE_BANNER_FAILED', 'Gagal memperbarui status iklan.');
    }
};
