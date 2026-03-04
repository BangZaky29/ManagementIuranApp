import { supabase } from '../../lib/supabaseConfig';
import { NewsItem } from './types';

export const createNews = async (news: Omit<NewsItem, 'id' | 'created_at' | 'author'>): Promise<NewsItem> => {
    const { data, error } = await supabase
        .from('news')
        .insert([news])
        .select()
        .single();

    if (error) throw error;
    return data as NewsItem;
};
