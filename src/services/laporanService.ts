import { supabase } from '../lib/supabaseConfig';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export interface Report {
    id: string;
    user_id: string;
    title: string;
    description: string;
    category: 'Fasilitas' | 'Kebersihan' | 'Keamanan' | 'Lainnya';
    status: 'Menunggu' | 'Diproses' | 'Selesai' | 'Ditolak';
    image_url: string | null;
    location: string | null;
    rejection_reason?: string | null;
    completion_image_url?: string | null;
    created_at: string;
    updated_at?: string;
    profiles?: {
        full_name: string;
        avatar_url: string | null;
        address: string | null;
    };
    processed_by?: {
        full_name: string;
        role: string;
    } | null;
    completed_by?: {
        full_name: string;
        role: string;
    } | null;
}

export const fetchMyReports = async (page = 0, limit = 20): Promise<Report[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
        .from('reports')
        .select(`
            *,
            profiles:user_id (full_name, avatar_url, address)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return data as Report[];
};

export const fetchAllReports = async (page = 0, limit = 20, status?: string): Promise<Report[]> => {
    const from = page * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('reports')
        .select(`
            *,
            profiles:profiles!reports_user_id_fkey (full_name, avatar_url, address),
            processed_by:profiles!reports_processed_by_id_fkey (full_name, role),
            completed_by:profiles!reports_completed_by_id_fkey (full_name, role)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (status && status !== 'Semua') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Report[];
};

export const fetchReportById = async (id: string): Promise<Report | null> => {
    const { data, error } = await supabase
        .from('reports')
        .select(`
            *,
            profiles:profiles!reports_user_id_fkey (full_name, avatar_url, address),
            processed_by:profiles!reports_processed_by_id_fkey (full_name, role),
            completed_by:profiles!reports_completed_by_id_fkey (full_name, role)
        `)
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

export const updateReportStatus = async (
    id: string,
    status: string,
    options?: {
        rejectionReason?: string;
        completionImageUri?: string;
        actorId?: string;
    }
): Promise<void> => {
    let completionImageUrl = undefined;

    // Handle completion image upload if provided
    if (options?.completionImageUri) {
        const fileName = `completion_${id}_${Date.now()}.jpg`;
        const base64 = await FileSystem.readAsStringAsync(options.completionImageUri, {
            encoding: 'base64',
        });

        const { error: uploadError } = await supabase.storage
            .from('konfirmasi-laporan') // Use the specific bucket requested
            .upload(fileName, decode(base64), {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (uploadError) {
            console.error('Completion image upload error:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('konfirmasi-laporan')
            .getPublicUrl(fileName);

        completionImageUrl = publicUrl;
    }

    const updateData: any = {
        status,
        updated_at: new Date().toISOString()
    };

    if (options?.rejectionReason !== undefined) {
        updateData.rejection_reason = options.rejectionReason;
    }

    if (completionImageUrl) {
        updateData.completion_image_url = completionImageUrl;
    }

    // Assign actor ID based on status
    if (options?.actorId) {
        if (status === 'Diproses') {
            updateData.processed_by_id = options.actorId;
        } else if (status === 'Selesai') {
            updateData.completed_by_id = options.actorId;
        }
    }

    const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
};
