import { supabase } from '../../lib/supabaseConfig';

export type ThemeMode = 'light' | 'dark' | 'system';

export const themeService = {
    async getUserTheme(userId: string): Promise<ThemeMode | null> {
        try {
            const { data, error } = await supabase
                .from('user_notification_settings')
                .select('theme_mode')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data?.theme_mode as ThemeMode | null;
        } catch (error) {
            console.error('Error fetching user theme:', error);
            return null;
        }
    },

    async updateUserTheme(userId: string, mode: ThemeMode): Promise<boolean> {
        try {
            // Because user_notification_settings acts as a single row config per user, 
            // we use upsert. It requires user_id and we update theme_mode.
            // Other fields will either be kept (if exists) or use default (if new).
            const { error } = await supabase
                .from('user_notification_settings')
                .upsert({
                    user_id: userId,
                    theme_mode: mode,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' }); // Important to use on conflict

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating user theme:', error);
            return false;
        }
    }
};
