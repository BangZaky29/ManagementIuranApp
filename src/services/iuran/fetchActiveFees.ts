import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { Fee } from './types';

export const fetchActiveFees = async (complexId?: number): Promise<Fee[]> => {
    let query = supabase
        .from('fees')
        .select('*')
        .eq('is_active', true);

    if (complexId) {
        query = query.eq('housing_complex_id', complexId);
    }

    const { data, error } = await query;

    if (error) throw new AppError(error.message, 'FETCH_FEES', 'Gagal memuat data iuran.');
    return data as Fee[];
};
