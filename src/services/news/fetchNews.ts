import { supabase } from '../../lib/supabaseConfig';
import { NewsItem } from './types';

export const fetchNews = async (isAdmin: boolean = false): Promise<NewsItem[]> => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return [];

    const { data: profile } = await supabase
        .from('profiles')
        .select('housing_complex_id')
        .eq('id', authData.user.id)
        .single();

    const complexId = profile?.housing_complex_id;

    let query = supabase
        .from('news')
        .select(`
            *,
            author:profiles(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

    if (complexId) {
        query = query.eq('housing_complex_id', complexId);
    }

    if (!isAdmin) {
        query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as NewsItem[];
};
