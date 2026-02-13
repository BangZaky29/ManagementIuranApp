import { supabase } from '../lib/supabaseConfig';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export interface Report {
    id: string;
    title: string;
    description: string;
    category: 'Fasilitas' | 'Kebersihan' | 'Keamanan' | 'Lainnya';
    status: 'Menunggu' | 'Diproses' | 'Selesai' | 'Ditolak';
    image_url: string | null;
    location: string | null;
    created_at: string;
}

export const fetchMyReports = async (): Promise<Report[]> => {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Report[];
};

export const createReport = async (
    title: string,
    description: string,
    category: string,
    imageUri?: string
) => {
    let imageUrl = null;

    if (imageUri) {
        // 1. Upload Image
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

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('wargaPintar')
            .getPublicUrl(`reports/${fileName}`);

        imageUrl = publicUrl;
    }

    // 3. Insert Report
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
            status: 'Menunggu' // Default
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};
