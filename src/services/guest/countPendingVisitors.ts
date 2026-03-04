import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const countPendingVisitors = async (): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('visitors')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        if (error) throw new AppError(error.message, 'COUNT_ERROR');
        return count || 0;
    } catch (error) {
        return 0;
    }
};
