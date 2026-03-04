import { supabase } from '../../lib/supabaseConfig';

export const countActivePanics = async (): Promise<number> => {
    const { count, error } = await supabase
        .from('panic_logs')
        .select('*', { count: 'exact', head: true })
        .is('resolved_at', null);

    if (error) return 0;
    return count || 0;
};
