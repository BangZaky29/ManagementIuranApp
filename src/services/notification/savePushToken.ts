import { supabase } from '../../lib/supabaseConfig';

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
                { onConflict: 'user_id' }
            );

        if (error) throw error;
        console.log('Push token saved successfully for user:', userId);
    } catch (error: any) {
        console.error('Error saving push token:', error.message || error);
    }
};
