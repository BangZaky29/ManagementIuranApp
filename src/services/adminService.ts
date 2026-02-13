import { supabase } from '../lib/supabaseConfig';

export interface VerifiedResident {
    id: string;
    nik: string;
    full_name: string;
    address: string | null;
    rt_rw: string;
    role: 'warga' | 'security';
    description?: string;
    access_token: string;
    is_claimed: boolean;
    claimed_at?: string;
    created_at: string;
    housing_complex_id?: number | null;
    housing_complexes?: {
        name: string;
    } | null;
}

export const fetchVerifiedResidents = async () => {
    const { data, error } = await supabase
        .from('verified_residents')
        .select(`
            *,
            housing_complexes (
                name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as VerifiedResident[];
};

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

export const deleteVerifiedResident = async (id: string) => {
    const { error } = await supabase
        .from('verified_residents')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const getDashboardStats = async () => {
    const { count: wargaCount, error: wargaError } = await supabase
        .from('verified_residents')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'warga');

    const { count: securityCount, error: securityError } = await supabase
        .from('verified_residents')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'security');

    const { count: claimedCount, error: claimedError } = await supabase
        .from('verified_residents')
        .select('*', { count: 'exact', head: true })
        .eq('is_claimed', true);

    if (wargaError) throw wargaError;
    if (securityError) throw securityError;
    if (claimedError) throw claimedError;

    return {
        warga: wargaCount || 0,
        security: securityCount || 0,
        activeUsers: claimedCount || 0,
    };
};

export const fetchHousingComplexes = async () => {
    const { data, error } = await supabase
        .from('housing_complexes')
        .select('*')
        .order('name');

    if (error) throw error;
    return data;
};
