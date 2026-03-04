import { supabase } from '../../lib/supabaseConfig';
import { NewsItem } from './types';

export const fetchNewsDetail = async (id: number): Promise<NewsItem> => {
    const { data, error } = await supabase
        .from('news')
        .select(`
            *,
            author:profiles(full_name, avatar_url)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as NewsItem;
};
