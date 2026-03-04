import { supabase } from '../../lib/supabaseConfig';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export const updateReport = async (
    id: string,
    updates: {
        title?: string;
        description?: string;
        category?: string;
        imageUri?: string;
        location?: string;
    }
) => {
    let imageUrl = undefined;

    if (updates.imageUri) {
        const fileName = `${Date.now()}_edit.jpg`;
        const base64 = await FileSystem.readAsStringAsync(updates.imageUri, {
            encoding: 'base64',
        });

        const { error: uploadError } = await supabase.storage
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

    const updateData: any = {
        updated_at: new Date().toISOString()
    };
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.category) updateData.category = updates.category;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (imageUrl) updateData.image_url = imageUrl;

    const { data, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};
