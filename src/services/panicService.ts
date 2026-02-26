import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';

export const triggerPanicButton = async (location?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new AppError(
            'User not authenticated for panic trigger',
            'AUTH_REQUIRED',
            'Anda harus login untuk menggunakan tombol darurat.'
        );
    }

    const { error } = await supabase
        .from('panic_logs')
        .insert({
            user_id: user.id,
            location: location || 'Lokasi tidak diketahui'
        });

    if (error) {
        throw new AppError(
            error.message,
            'PANIC_FAILED',
            'Gagal mengirim sinyal darurat. Silakan coba lagi.'
        );
    }
};
