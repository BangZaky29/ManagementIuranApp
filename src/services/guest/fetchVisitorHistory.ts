import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { Visitor } from './types';

export const fetchVisitorHistory = async (limit = 50): Promise<Visitor[]> => {
    try {
        const { data, error } = await supabase
            .from('visitors')
            .select(`
                *,
                profiles:destination_user_id (
                    full_name,
                    housing_complex_id,
                    rt_rw,
                    housing_complexes (
                        name
                    )
                )
            `)
            .in('status', ['completed', 'rejected'])
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new AppError(error.message, 'FETCH_VISITORS_ERROR');
        return data as Visitor[];
    } catch (error) {
        throw error instanceof AppError ? error : new AppError('Failed to fetch visitor history', 'UNKNOWN');
    }
};
