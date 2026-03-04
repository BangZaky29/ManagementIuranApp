import { supabase } from '../../lib/supabaseConfig';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export const createReport = async (
    title: string,
    description: string,
    category: string,
    imageUri?: string,
    location?: string
) => {
    let imageUrl = null;

    if (imageUri) {
        const fileName = `${Date.now()}.jpg`;
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
        });

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('wargaPintar')
            .upload(`reports/${fileName}`, decode(base64), {
                contentType: 'image/jpeg',
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('wargaPintar')
            .getPublicUrl(`reports/${fileName}`);

        imageUrl = publicUrl;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('reports')
        .insert({
            user_id: user.id,
            title,
            description,
            category,
            image_url: imageUrl,
            location: location || null,
            status: 'Menunggu'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};
