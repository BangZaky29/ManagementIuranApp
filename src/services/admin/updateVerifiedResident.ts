import { supabase } from '../../lib/supabaseConfig';
import { VerifiedResident } from './types';

export const updateVerifiedResident = async (
    id: string,
    updates: Partial<Omit<VerifiedResident, 'id' | 'created_at' | 'housing_complexes'>>
) => {
    const { data, error } = await supabase
        .from('verified_residents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as VerifiedResident;
};
