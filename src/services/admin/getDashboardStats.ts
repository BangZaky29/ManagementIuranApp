import { supabase } from '../../lib/supabaseConfig';
import { AppError } from '../../utils/AppError';

export const getDashboardStats = async () => {
    const [wargaTotalResult, wargaActiveResult, wargaInactiveResult, securityResult, claimedResult] = await Promise.all([
        supabase
            .from('verified_residents')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'warga'),
        supabase
            .from('verified_residents')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'warga')
            .eq('is_claimed', true),
        supabase
            .from('verified_residents')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'warga')
            .eq('is_claimed', false),
        supabase
            .from('verified_residents')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'security'),
        supabase
            .from('verified_residents')
            .select('*', { count: 'exact', head: true })
            .eq('is_claimed', true),
    ]);

    if (wargaTotalResult.error) throw new AppError(wargaTotalResult.error.message, 'DASHBOARD_STATS', 'Gagal memuat statistik warga.');
    if (securityResult.error) throw new AppError(securityResult.error.message, 'DASHBOARD_STATS', 'Gagal memuat statistik keamanan.');
    if (claimedResult.error) throw new AppError(claimedResult.error.message, 'DASHBOARD_STATS', 'Gagal memuat statistik pengguna aktif.');

    return {
        warga: wargaTotalResult.count || 0,
        wargaActive: wargaActiveResult.count || 0,
        wargaInactive: wargaInactiveResult.count || 0,
        security: securityResult.count || 0,
        activeUsers: claimedResult.count || 0,
    };
};
