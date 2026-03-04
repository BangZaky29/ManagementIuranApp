import { supabase } from '../../lib/supabaseConfig';

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
