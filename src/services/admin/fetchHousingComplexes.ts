import { supabase } from '../../lib/supabaseConfig';

export const fetchHousingComplexes = async () => {
    const { data, error } = await supabase
        .from('housing_complexes')
        .select('*')
        .order('name');

    if (error) throw error;
    return data;
};
