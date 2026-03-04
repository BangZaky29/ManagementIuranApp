import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { PanicLog } from './types';

export const fetchPanicLogs = async (
    page = 0,
    limit = 20,
    showResolved = false
): Promise<PanicLog[]> => {
    const from = page * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('panic_logs')
        .select(`
            *,
            profiles:user_id (
                full_name,
                avatar_url,
                housing_complex_id,
                rt_rw
            )
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (!showResolved) {
        query = query.is('resolved_at', null);
    }

    const { data, error } = await query;

    if (error) throw new AppError(error.message, 'FETCH_PANIC', 'Gagal memuat log darurat.');
    return (data || []) as PanicLog[];
};
