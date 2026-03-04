import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { AdminFee } from './types';

export const fetchAdminFees = async (): Promise<AdminFee[]> => {
    const { data, error } = await supabase
        .from('fees')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 'FETCH_FEES', 'Gagal memuat data iuran.');
    return (data || []) as AdminFee[];
};
