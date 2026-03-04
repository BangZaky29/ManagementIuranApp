import { supabase } from '../../lib/supabaseConfig';
import { Banner } from './types';

export const fetchActiveBanners = async (): Promise<Banner[]> => {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Fetch Banners Error:', error);
        return [];
    }
    return data as Banner[];
};
