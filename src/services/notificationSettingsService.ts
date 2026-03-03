import { supabase } from '../lib/supabaseConfig';

export interface UserSoundSettings {
    user_id: string;
    notif_sound: string;
    alert_sound: string;
    vibration_enabled: boolean;
    alert_duration: number;
}

export const soundSettingsService = {
    async getSettings(userId: string): Promise<UserSoundSettings | null> {
        try {
            const { data, error } = await supabase
                .from('user_notification_settings')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error fetching sound settings:', error);
            return null;
        }
    },

    async updateSettings(userId: string, settings: Partial<Omit<UserSoundSettings, 'user_id'>>) {
        try {
            const { error } = await supabase
                .from('user_notification_settings')
                .upsert({
                    user_id: userId,
                    ...settings,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error updating sound settings:', error);
            return { success: false, error };
        }
    }
};
