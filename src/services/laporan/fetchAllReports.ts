import { supabase } from '../../lib/supabaseConfig';
import { Report } from './types';

export const fetchAllReports = async (page = 0, limit = 20, status?: string): Promise<Report[]> => {
    const from = page * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('reports')
        .select(`
            *,
            profiles:profiles!reports_user_id_fkey (full_name, avatar_url, address),
            processed_by:profiles!reports_processed_by_id_fkey (full_name, role),
            completed_by:profiles!reports_completed_by_id_fkey (full_name, role)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (status && status !== 'Semua') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Report[];
};
