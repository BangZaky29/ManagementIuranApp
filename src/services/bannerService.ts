import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';
import { decode } from 'base64-arraybuffer';

export interface Banner {
    id: string;
    housing_complex_id: number;
    title: string;
    description?: string;
    image_url: string;
    target_url: string | null;
    is_active: boolean;
    created_at: string;
}

/**
 * Fetch active banners for the current user's housing complex.
 * Used by Warga and Security.
 */
export const fetchActiveBanners = async (): Promise<Banner[]> => {
    const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Fetch Banners Error:', error);
        return [];
    }
    return data as Banner[];
};

/**
 * Fetch all banners for the current admin's housing complex.
 * Used by Admin.
 */
export const fetchAllBanners = async (): Promise<Banner[]> => {
    const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new AppError(error.message, 'FETCH_BANNERS_FAILED', 'Gagal memuat daftar iklan.');
    }
    return data as Banner[];
};

/**
 * Add a new banner.
 */
export const createBanner = async (
    title: string,
    imageUrl: string,
    targetUrl?: string,
    description?: string
): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppError('Unauthorized', 'AUTH_ERROR');

    // Get admin's housing_complex_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('housing_complex_id')
        .eq('id', user.id)
        .single();

    if (!profile?.housing_complex_id) {
        throw new AppError('Housing complex not found', 'NOT_FOUND');
    }

    const { error } = await supabase
        .from('banners')
        .insert({
            title,
            description,
            image_url: imageUrl,
            target_url: targetUrl || null,
            housing_complex_id: profile.housing_complex_id,
            is_active: true
        });

    if (error) {
        throw new AppError(error.message, 'CREATE_BANNER_FAILED', 'Gagal menambah iklan.');
    }
};

/**
 * Update an existing banner.
 */
export const updateBanner = async (
    id: string,
    title: string,
    imageUrl: string,
    targetUrl?: string,
    description?: string
): Promise<void> => {
    const { error } = await supabase
        .from('banners')
        .update({
            title,
            description,
            image_url: imageUrl,
            target_url: targetUrl || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        throw new AppError(error.message, 'UPDATE_BANNER_FAILED', 'Gagal memperbarui data iklan.');
    }
};

/**
 * Toggle banner active status.
 */
export const toggleBannerStatus = async (id: string, currentStatus: boolean): Promise<void> => {
    const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', id);

    if (error) {
        throw new AppError(error.message, 'UPDATE_BANNER_FAILED', 'Gagal memperbarui status iklan.');
    }
};


/**
 * Upload image to Supabase Storage.
 * Path: banners/{complex_id}/{admin_id}/{filename}
 */
export const uploadBannerImage = async (
    uri: string,
    base64: string,
    filename: string
): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppError('Unauthorized', 'AUTH_ERROR');

    // Get admin's housing_complex_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('housing_complex_id')
        .eq('id', user.id)
        .single();

    if (!profile?.housing_complex_id) {
        throw new AppError('Housing complex not found', 'NOT_FOUND');
    }

    const folderPath = `banners/${profile.housing_complex_id}/${user.id}`;
    const filePath = `${folderPath}/${Date.now()}_${filename}`;

    const { error: uploadError } = await supabase.storage
        .from('wargaPintar')
        .upload(filePath, decode(base64), {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (uploadError) {
        throw new AppError(uploadError.message, 'UPLOAD_FAILED', 'Gagal mengunggah gambar ke server.');
    }

    // Get public URL
    const { data } = supabase.storage
        .from('wargaPintar')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

/**
 * Delete a banner and its image from storage.
 */
export const deleteBanner = async (id: string, imageUrl?: string): Promise<void> => {
    // 1. Delete record from database
    const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

    if (error) {
        throw new AppError(error.message, 'DELETE_BANNER_FAILED', 'Gagal menghapus data iklan.');
    }

    // 2. Try to delete from storage if it's a Supabase URL
    if (imageUrl && imageUrl.includes('wargaPintar')) {
        try {
            const pathParts = imageUrl.split('wargaPintar/')[1];
            if (pathParts) {
                const filePath = pathParts.split('?')[0]; // Remove potential query params
                await supabase.storage.from('wargaPintar').remove([filePath]);
            }
        } catch (storageErr) {
            console.warn('Failed to delete image from storage:', storageErr);
        }
    }
};
