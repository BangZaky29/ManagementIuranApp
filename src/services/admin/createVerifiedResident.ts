import { supabase } from '../../lib/supabaseConfig';
import { VerifiedResident } from './types';

export const createVerifiedResident = async (
    data: Omit<VerifiedResident, 'id' | 'access_token' | 'is_claimed' | 'created_at' | 'housing_complexes'>
) => {
    const { data: newResident, error } = await supabase
        .from('verified_residents')
        .insert([data])
        .select()
        .single();

    if (error) throw error;
    return newResident as VerifiedResident;
};
