import { supabase } from '../lib/supabaseConfig';

export const triggerPanicButton = async (location?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Should handle silently or throw

    const { error } = await supabase
        .from('panic_logs')
        .insert({
            user_id: user.id,
            location: location || 'Lokasi tidak diketahui'
        });

    if (error) {
        console.error('Panic button failed:', error);
        throw error;
    }
};
