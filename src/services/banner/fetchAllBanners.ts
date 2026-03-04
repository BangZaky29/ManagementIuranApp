import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { Banner } from './types';

export const fetchAllBanners = async (): Promise<Banner[]> => {
    const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new AppError(error.message, 'FETCH_BANNERS_FAILED', 'Gagal memuat daftar iklan.');
    }
    return data as Banner[];
};
