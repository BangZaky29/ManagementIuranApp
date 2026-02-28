import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';
import * as Location from 'expo-location';

// ─── Types ─────────────────────────────────────────
export interface PanicLog {
    id: string;
    user_id: string;
    location: string | null;
    resolved_at: string | null;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string | null;
        housing_complex_id: number | null;
        rt_rw: string | null;
    } | null;
}

// ─── Location Helper ───────────────────────────────
/**
 * Attempts to get the device's current GPS location.
 * Returns a Google Maps link string, or fallback text if permission denied.
 */
export const getDeviceLocation = async (): Promise<string> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return 'Izin lokasi ditolak';
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;
        // Return as Google Maps link for easy viewing
        return `https://maps.google.com/?q=${latitude},${longitude}`;
    } catch (error) {
        console.warn('Failed to get location:', error);
        return 'Gagal mendapatkan lokasi';
    }
};

// ─── Trigger Panic ─────────────────────────────────
export const triggerPanicButton = async (location?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new AppError(
            'User not authenticated for panic trigger',
            'AUTH_REQUIRED',
            'Anda harus login untuk menggunakan tombol darurat.'
        );
    }

    // Get real GPS location if not provided
    const finalLocation = location || await getDeviceLocation();

    const { error } = await supabase
        .from('panic_logs')
        .insert({
            user_id: user.id,
            location: finalLocation,
        });

    if (error) {
        throw new AppError(
            error.message,
            'PANIC_FAILED',
            'Gagal mengirim sinyal darurat. Silakan coba lagi.'
        );
    }
};

// ─── Fetch Panic Logs (Admin/Security) ─────────────
export const fetchPanicLogs = async (
    page = 0,
    limit = 20,
    showResolved = false
): Promise<PanicLog[]> => {
    const from = page * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('panic_logs')
        .select(`
            *,
            profiles:user_id (
                full_name,
                avatar_url,
                housing_complex_id,
                rt_rw
            )
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (!showResolved) {
        query = query.is('resolved_at', null);
    }

    const { data, error } = await query;

    if (error) throw new AppError(error.message, 'FETCH_PANIC', 'Gagal memuat log darurat.');
    return (data || []) as PanicLog[];
};

// ─── Resolve Panic Log ─────────────────────────────
export const resolvePanicLog = async (logId: string): Promise<void> => {
    const { error } = await supabase
        .from('panic_logs')
        .update({ resolved_at: new Date().toISOString() })
        .eq('id', logId);

    if (error) throw new AppError(error.message, 'RESOLVE_PANIC', 'Gagal menandai log sebagai selesai.');
};

// ─── Count Active Panics ───────────────────────────
export const countActivePanics = async (): Promise<number> => {
    const { count, error } = await supabase
        .from('panic_logs')
        .select('*', { count: 'exact', head: true })
        .is('resolved_at', null);

    if (error) return 0;
    return count || 0;
};
