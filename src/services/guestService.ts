import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';

export type VisitorType = 'tamu' | 'gojek' | 'kurir' | 'pekerja' | 'lainnya';
export type VisitorStatus = 'pending' | 'active' | 'completed' | 'rejected';

export interface Visitor {
    id: string;
    visitor_name: string;
    visitor_type: VisitorType;
    destination_user_id: string; // Warga's UUID
    purpose: string | null;
    pin_code: string | null;
    status: VisitorStatus;
    check_in_time: string | null;
    check_out_time: string | null;
    created_by: string | null;
    created_at: string;
    // Joined profile
    profiles?: {
        full_name: string;
        housing_complex_id: number | null;
        rt_rw: string | null;
        housing_complexes?: {
            name: string;
        } | null;
    } | null;
}

export const fetchActiveVisitors = async (): Promise<Visitor[]> => {
    try {
        const { data, error } = await supabase
            .from('visitors')
            .select(`
                *,
                profiles:destination_user_id (
                    full_name,
                    housing_complex_id,
                    rt_rw,
                    housing_complexes (
                        name
                    )
                )
            `)
            .eq('status', 'active')
            .order('check_in_time', { ascending: false });

        if (error) throw new AppError(error.message, 'FETCH_VISITORS_ERROR');
        return data as Visitor[];
    } catch (error) {
        throw error instanceof AppError ? error : new AppError('Failed to fetch visitors', 'UNKNOWN');
    }
};

export const fetchVisitorHistory = async (limit = 50): Promise<Visitor[]> => {
    try {
        const { data, error } = await supabase
            .from('visitors')
            .select(`
                *,
                profiles:destination_user_id (
                    full_name,
                    housing_complex_id,
                    rt_rw,
                    housing_complexes (
                        name
                    )
                )
            `)
            .in('status', ['completed', 'rejected'])
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new AppError(error.message, 'FETCH_VISITORS_ERROR');
        return data as Visitor[];
    } catch (error) {
        throw error instanceof AppError ? error : new AppError('Failed to fetch visitor history', 'UNKNOWN');
    }
};

export const checkInWalkinVisitor = async (
    visitor_name: string,
    visitor_type: VisitorType,
    destination_user_id: string,
    purpose: string
): Promise<Visitor> => {
    try {
        const { data, error } = await supabase
            .from('visitors')
            .insert({
                visitor_name,
                visitor_type,
                destination_user_id,
                purpose,
                status: 'active', // Assuming auto-approve for now (Phase 1)
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

export const countActiveVisitors = async (): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('visitors')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        if (error) throw new AppError(error.message, 'COUNT_ERROR');
        return count || 0;
    } catch (error) {
        return 0; // Don't throw for counts, just return 0 to avoid breaking dashboards
    }
};
