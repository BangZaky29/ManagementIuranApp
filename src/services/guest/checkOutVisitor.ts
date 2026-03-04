import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const checkOutVisitor = async (visitor_id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('visitors')
            .update({
                status: 'completed',
                check_out_time: new Date().toISOString()
            })
            .eq('id', visitor_id);

        if (error) throw new AppError(error.message, 'CHECKOUT_ERROR');
    } catch (error) {
        throw error instanceof AppError ? error : new AppError('Failed to check out visitor', 'UNKNOWN');
    }
};
