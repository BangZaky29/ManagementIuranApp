import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { ComplexInfo } from './types';

export const fetchComplexInfo = async (complexId: number): Promise<ComplexInfo | null> => {
    const { data, error } = await supabase
        .from('complex_info')
        .select('*')
        .eq('housing_complex_id', complexId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Fetch Complex Info Error:', error);
        throw new AppError(error.message, 'FETCH_COMPLEX_INFO_FAILED', 'Gagal memuat informasi komplek.');
    }

    return data as ComplexInfo | null;
};
