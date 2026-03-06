import { supabase } from '../../lib/supabaseConfig';

export const triggerEdgePushNotification = async (
    userIds: string[],
    title: string,
    message: string,
    data?: any,
    channelId: string = 'default'
) => {
    try {
        // Asumsi nama edge function yang dideploy adalah 'send-notification'.
        // Silakan diganti jika nama deploy Anda berbeda.
        const { data: responseData, error } = await supabase.functions.invoke('send-notification', {
            body: {
                user_ids: userIds,
                title,
                message,
                data,
                channelId
            }
        });

        if (error) {
            // Log status code and detailed error for debugging
            const status = (error as any).status;
            console.error(`[PushNotif] Edge Function Error (${status}):`, error);

            if (status === 404) {
                console.warn('[PushNotif] Tip: Pastikan Edge Function dideploy dengan nama "send-notification".');
            } else if (status === 500) {
                console.warn('[PushNotif] Tip: Periksa log di Dashboard Supabase. Pastikan SUPABASE_SERVICE_ROLE_KEY sudah terpasang di Secrets.');
            }
            return null;
        }

        return responseData;
    } catch (err) {
        console.error('[PushNotif] Unexpected Error:', err);
        return null;
    }
};
