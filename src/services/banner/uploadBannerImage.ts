import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { decode } from 'base64-arraybuffer';

export const uploadBannerImage = async (
    uri: string,
    base64: string,
    filename: string
): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new AppError('Unauthorized', 'AUTH_ERROR');

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

    const { data } = supabase.storage
        .from('wargaPintar')
        .getPublicUrl(filePath);

    return data.publicUrl;
};
