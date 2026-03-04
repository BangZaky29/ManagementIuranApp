import { supabase } from '../../lib/supabaseConfig';
import { Report } from './types';

export const fetchMyReports = async (page = 0, limit = 20): Promise<Report[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('reports')
        .select(`
            *,
            profiles:user_id (full_name, avatar_url, address)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return data as Report[];
};
