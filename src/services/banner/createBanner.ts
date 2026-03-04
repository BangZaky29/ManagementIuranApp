import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const createBanner = async (
    title: string,
    imageUrl: string,
    targetUrl?: string,
    description?: string,
    startDate?: string,
    endDate?: string
): Promise<void> => {
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

    const { error } = await supabase
        .from('banners')
        .insert({
            title,
            description,
            image_url: imageUrl,
            target_url: targetUrl || null,
            housing_complex_id: profile.housing_complex_id,
            is_active: true,
            start_date: startDate || new Date().toISOString(),
            end_date: endDate || null
        });

    if (error) {
        throw new AppError(error.message, 'CREATE_BANNER_FAILED', 'Gagal menambah iklan.');
    }
};
