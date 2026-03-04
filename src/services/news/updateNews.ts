import { supabase } from '../../lib/supabaseConfig';
import { NewsItem } from './types';

export const updateNews = async (id: number, updates: Partial<NewsItem>): Promise<NewsItem> => {
    const { data, error } = await supabase
        .from('news')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as NewsItem;
};
