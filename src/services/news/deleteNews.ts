import { supabase } from '../../lib/supabaseConfig';

export const deleteNews = async (id: number): Promise<void> => {
    const { data: newsItem, error: fetchError } = await supabase
        .from('news')
        .select('image_url')
        .eq('id', id)
        .single();

    if (fetchError) throw fetchError;

    if (newsItem?.image_url) {
        try {
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

    const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
