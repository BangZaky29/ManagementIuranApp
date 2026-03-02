import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';

export interface ComplexInfo {
    id: string;
    housing_complex_id: number;
    help_phone?: string;
    help_whatsapp?: string;
    help_note?: string;
    terms_conditions?: string;
    updated_at: string;
}

/**
 * Fetch complex information for a specific housing complex.
 */
export const fetchComplexInfo = async (complexId: number): Promise<ComplexInfo | null> => {
    const { data, error } = await supabase
        .from('complex_info')
        .select('*')
        .eq('housing_complex_id', complexId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Fetch Complex Info Error:', error);
        throw new AppError(error.message, 'FETCH_COMPLEX_INFO_FAILED', 'Gagal memuat informasi komplek.');
    }

    return data as ComplexInfo | null;
};

/**
 * Update or insert complex information.
 */
export const upsertComplexInfo = async (
    complexId: number,
    info: Partial<Omit<ComplexInfo, 'id' | 'housing_complex_id' | 'updated_at'>>
): Promise<void> => {
    const { error } = await supabase
        .from('complex_info')
        .upsert({
            housing_complex_id: complexId,
            ...info,
            updated_at: new Date().toISOString()
        }, { onConflict: 'housing_complex_id' });

    if (error) {
        console.error('Upsert Complex Info Error:', error);
        throw new AppError(error.message, 'UPDATE_COMPLEX_INFO_FAILED', 'Gagal memperbarui informasi komplek.');
    }
};
