import { supabase } from '../../lib/supabaseConfig';
import { VerifiedResident } from './types';

export const fetchVerifiedResidents = async (page = 0, limit = 20) => {
    const from = page * limit;
    const to = from + limit - 1;

    const { data: residentsData, error: residentsError } = await supabase
        .from('verified_residents')
        .select(`
    *,
    housing_complexes(
        name
    )
        `)
        .order('created_at', { ascending: false })
        .range(from, to)
        .limit(limit);

    if (residentsError) throw residentsError;

    if (!residentsData || residentsData.length === 0) {
        return [] as VerifiedResident[];
    }

    const niks = residentsData.map(r => r.nik).filter(n => n !== null);

    let profilesMap: Record<string, string | null> = {};

    if (niks.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('nik, avatar_url')
            .in('nik', niks);

        if (!profilesError && profilesData) {
            profilesData.forEach(p => {
                if (p.nik) {
                    profilesMap[p.nik] = p.avatar_url;
                }
            });
        }
    }

    const mergedData = residentsData.map(resident => ({
        ...resident,
        user: {
            avatar_url: resident.nik ? profilesMap[resident.nik] || null : null
        }
    }));

    return mergedData as VerifiedResident[];
};
