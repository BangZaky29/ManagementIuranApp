import { supabase } from '../../lib/supabaseConfig';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

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
