import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';
import { Visitor, VisitorType } from './types';

export const checkInWalkinVisitor = async (
    visitor_name: string,
    visitor_type: VisitorType,
    destination_user_id: string,
    purpose: string,
    housing_complex_id: number | null
): Promise<Visitor> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new AppError('User not authenticated');

        const { data, error } = await supabase
            .from('visitors')
            .insert({
                visitor_name,
                visitor_type,
                destination_user_id,
                purpose,
                housing_complex_id,
                created_by: user.id,
                status: 'active',
                check_in_time: new Date().toISOString()
            })
            .select('*')
            .single();

        if (error) throw new AppError(error.message, 'CHECKIN_ERROR');
        return data as Visitor;
    } catch (error) {
        throw error instanceof AppError ? error : new AppError('Failed to check in visitor', 'UNKNOWN');
    }
};
