import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';

export interface ActivityLog {
    id: string;
    housing_complex_id: number;
    user_id: string;
    action_type: 'payment' | 'report' | 'panic' | 'visitor';
    action_title: string;
    description: string;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string | null;
        wa_phone: string | null;
    };
}

/**
 * Fetch recent activity logs for the admin's housing complex.
 * RLS ensures they only see logs from their own complex.
 */
export const fetchRecentActivityLogs = async (limit: number = 20): Promise<ActivityLog[]> => {
    const { data, error } = await supabase
        .from('activity_logs')
        .select(`
            *,
            profiles:user_id (full_name, avatar_url, wa_phone)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching activity logs:', error);
        throw new AppError(error.message, 'FETCH_ACTIVITY_LOGS', 'Gagal memuat ringkasan aktivitas.');
    }

    return (data || []) as ActivityLog[];
};
