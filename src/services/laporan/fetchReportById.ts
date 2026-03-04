import { supabase } from '../../lib/supabaseConfig';
import { Report } from './types';

export const fetchReportById = async (id: string): Promise<Report | null> => {
    const { data, error } = await supabase
        .from('reports')
        .select(`
            *,
            profiles:profiles!reports_user_id_fkey (full_name, avatar_url, address),
            processed_by:profiles!reports_processed_by_id_fkey (full_name, role),
            completed_by:profiles!reports_completed_by_id_fkey (full_name, role)
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching report:', error);
        return null;
    }
    return data as Report;
};
