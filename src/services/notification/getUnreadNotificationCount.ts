import { supabase } from '../../lib/supabaseConfig';

export const getUnreadNotificationCount = async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) {
        console.error('Error counting unread notifications:', error);
        return 0;
    }

    return count || 0;
};
