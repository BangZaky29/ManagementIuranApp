import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { ComplexInfo } from './types';

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
