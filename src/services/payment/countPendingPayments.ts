import { supabase } from '../../lib/supabaseConfig';

export const countPendingPayments = async (): Promise<number> => {
    const { count, error } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    if (error) return 0;
    return count || 0;
};
