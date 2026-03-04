import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { ActivityLog } from './types';

export const fetchRecentActivityLogs = async (limit: number = 20, offset: number = 0): Promise<ActivityLog[]> => {
    const { data, error } = await supabase
        .from('activity_logs')
        .select(`
            *,
            profiles:user_id (full_name, avatar_url, wa_phone, role)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching activity logs:', error);
        throw new AppError(error.message, 'FETCH_ACTIVITY_LOGS', 'Gagal memuat ringkasan aktivitas.');
    }

    return (data || []) as ActivityLog[];
};
