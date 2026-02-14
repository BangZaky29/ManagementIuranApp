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

export const fetchMyReports = async (page = 0, limit = 20): Promise<Report[]> => {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)
        .limit(limit);

    if (error) throw error;
    return data as Report[];
};

export const fetchReportById = async (id: string): Promise<Report | null> => {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching report:', error);
        return null;
    }
    return data as Report;
};

export const deleteReport = async (reportId: string): Promise<void> => {
    // 1. Get the report to find image_url
    const report = await fetchReportById(reportId);
    if (!report) return;

    const promises = [];

    // 2. Queue image deletion if exists
    if (report.image_url) {
        const fileName = report.image_url.split('/').pop();
        if (fileName) {
            promises.push(
                supabase.storage
                    .from('wargaPintar')
                    .remove([`reports/${fileName}`])
                    .catch(err => console.warn('Failed to delete image:', err))
            );
        }
    }

    // 3. Queue record deletion
    promises.push(
        supabase
            .from('reports')
            .delete()
            .eq('id', reportId)
            .then(({ error }) => { if (error) throw error; })
    );

    // 4. Run in parallel
    await Promise.all(promises);
};

export const createReport = async (
    title: string,
    description: string,
    category: string,
    imageUri?: string,
    location?: string // Google Maps Link or coordinates
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
            location: location || null,
            status: 'Menunggu' // Default
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateReport = async (
    id: string,
    updates: {
        title?: string;
        description?: string;
        category?: string;
        imageUri?: string; // New image URI to upload
        location?: string;
    }
) => {
    let imageUrl = undefined;

    if (updates.imageUri) {
        // 1. Upload New Image
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

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('wargaPintar')
            .getPublicUrl(`reports/${fileName}`);

        imageUrl = publicUrl;
    }

    // 3. Prepare Update Object
    const updateData: any = {
        updated_at: new Date().toISOString()
    };
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.category) updateData.category = updates.category;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (imageUrl) updateData.image_url = imageUrl;

    // 4. Update Report
    const { data, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};
