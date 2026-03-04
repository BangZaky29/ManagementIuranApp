import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const resolvePanicLog = async (logId: string): Promise<void> => {
    const { error } = await supabase
        .from('panic_logs')
        .update({ resolved_at: new Date().toISOString() })
        .eq('id', logId);

    if (error) throw new AppError(error.message, 'RESOLVE_PANIC', 'Gagal menandai log sebagai selesai.');
};
