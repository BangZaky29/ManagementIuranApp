import { supabase } from '../../lib/supabaseConfig';
import { AppNotification } from './types';

export const fetchMyNotifications = async (limitCount: number = 10): Promise<AppNotification[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limitCount);

    if (error) throw error;
    return data as AppNotification[];
};
