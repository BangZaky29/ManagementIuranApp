
import { supabase } from '../lib/supabaseConfig';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export interface NewsItem {
    id: number;
    title: string;
    content: string;
    category: string;
    author_id: string | null;
    created_at: string;
    is_published: boolean;
    image_url?: string | null; // Optional: user might want images later, good to have placeholders or structure
    author?: {
        full_name: string;
        avatar_url: string | null;
    } | null;
}

export const fetchNews = async (isAdmin: boolean = false) => {
    let query = supabase
        .from('news')
        .select(`
            *,
            author:profiles(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

    // If not admin, only show published news
    if (!isAdmin) {
        query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as NewsItem[];
};

export const fetchNewsDetail = async (id: number) => {
    const { data, error } = await supabase
        .from('news')
        .select(`
            *,
            author:profiles(full_name, avatar_url)
        `)
        .eq('id', id) // Fix: use id, not newsId (variable name in previous context) - wait, parameter is id. Correct.
        .single();

    if (error) throw error;
    return data as NewsItem;
};

export const createNews = async (news: Omit<NewsItem, 'id' | 'created_at' | 'author'>) => {
    const { data, error } = await supabase
        .from('news')
        .insert([news])
        .select()
        .single();

    if (error) throw error;
    return data as NewsItem;
};

export const updateNews = async (id: number, updates: Partial<NewsItem>) => {
    const { data, error } = await supabase
        .from('news')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as NewsItem;
};

export const deleteNews = async (id: number) => {
    // 1. Get the news to find image_url
    const { data: newsItem, error: fetchError } = await supabase
        .from('news')
        .select('image_url')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    // 2. Delete image if exists
    if (newsItem?.image_url) {
        try {
            // Extract file path from URL
            // URL format: .../storage/v1/object/public/news/17394444.jpg
            const fileUrl = newsItem.image_url;
            const fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

            if (fileName) {
                const { error: storageError } = await supabase.storage
                    .from('news')
                    .remove([fileName]);

                if (storageError) {
                    console.warn('Failed to delete image from storage:', storageError);
                }
            }
        } catch (e) {
            console.warn('Error parsing image url for deletion:', e);
        }
    }

    // 3. Delete record
    const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const uploadNewsImage = async (uri: string): Promise<string | null> => {
    try {
        const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const base64 = await readAsStringAsync(uri, {
            encoding: 'base64',
        });

        const { data, error: uploadError } = await supabase.storage
            .from('news')
            .upload(filePath, decode(base64), {
                contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
            });

        if (uploadError) {
            console.error('Supabase Upload Error:', uploadError);
            throw uploadError;
        }

        const { data: urlData } = supabase.storage.from('news').getPublicUrl(filePath);
        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

