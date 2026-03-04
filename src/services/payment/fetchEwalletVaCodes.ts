import { supabase } from '../../lib/supabaseConfig';
import { EwalletVaCode } from './types';

export const fetchEwalletVaCodes = async (ewalletName: string): Promise<EwalletVaCode[]> => {
    const { data, error } = await supabase
        .from('ewallet_va_codes')
        .select('*')
        .eq('ewallet_name', ewalletName)
        .order('bank_name');

    if (error) {
        console.error('Failed to fetch VA codes:', error);
        return [];
    }
    return data as EwalletVaCode[];
};
