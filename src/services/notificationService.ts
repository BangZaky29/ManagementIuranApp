import { supabase } from '../lib/supabaseConfig';

export interface AppNotification {
    id: string;
    title: string;
    body: string;
    data: any;
    is_read: boolean;
    created_at: string;
}

export const savePushToken = async (userId: string, token: string) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.warn('Cannot save push token: No active session');
            return;
        }

        const { error } = await supabase
            .from('user_tokens')
            .upsert(
                { user_id: userId, expo_push_token: token, updated_at: new Date().toISOString() },
                { onConflict: 'expo_push_token' }
            );

        if (error) throw error;
        console.log('Push token saved successfully for user:', userId);
    } catch (error: any) {
        console.error('Error saving push token:', error.message || error);
    }
};

export const removePushToken = async (userId: string, token: string) => {
    try {
        const { error } = await supabase
            .from('user_tokens')
            .delete()
            .match({ user_id: userId, expo_push_token: token });

        if (error) throw error;
    } catch (error) {
        console.error('Error removing push token:', error);
    }
};

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

export const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) throw error;
};

export const markAllNotificationsAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) throw error;
};

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
