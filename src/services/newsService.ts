import { supabase } from '../lib/supabaseConfig';

export interface NewsItem {
    id: number;
    title: string;
    content: string;
    category: string;
    created_at: string;
    date: string; // Formatted date for UI
    author_id?: string;
    is_published: boolean;
    image?: string | null;
}

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

export const fetchPublishedNews = async (): Promise<NewsItem[]> => {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
        ...item,
        date: formatDate(item.created_at),
        image: item.image_url || null // Assuming potentially adding image_url later, or just null for now
    })) as NewsItem[];
};

export const fetchNewsDetail = async (id: number): Promise<NewsItem | null> => {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;

    return {
        ...data,
        date: formatDate(data.created_at),
        image: data.image_url || null
    } as NewsItem;
};
