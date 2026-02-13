import { supabase } from '../lib/supabaseConfig';

export interface VerifiedResident {
    id: string;
    nik: string;
    full_name: string;
    address: string;
    rt_rw: string;
    role: 'warga' | 'security';
    description?: string;
    access_token: string;
    is_claimed: boolean;
    claimed_at?: string;
    created_at: string;
}

export const fetchVerifiedResidents = async () => {
    const { data, error } = await supabase
        .from('verified_residents')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as VerifiedResident[];
};

export const createVerifiedResident = async (
    data: Omit<VerifiedResident, 'id' | 'access_token' | 'is_claimed' | 'created_at'>
) => {
    const { data: newResident, error } = await supabase
        .from('verified_residents')
        .insert([data])
        .select()
        .single();

    if (error) throw error;
    return newResident as VerifiedResident;
};

export const deleteVerifiedResident = async (id: string) => {
    const { error } = await supabase
        .from('verified_residents')
        .delete()
        .eq('id', id);

    if (error) throw error;
};
