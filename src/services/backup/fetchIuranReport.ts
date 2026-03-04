import { supabase } from '../../lib/supabaseConfig';
import { IuranReportRow, IuranSummary, BackupFilter } from './types';

/**
 * Fetch all iuran/payment data for the admin's housing complex.
 * Returns structured rows ready for PDF/Excel generation.
 */
export const fetchIuranReport = async (
    complexId: number,
    filter?: BackupFilter
): Promise<{ rows: IuranReportRow[]; summary: IuranSummary }> => {
    let query = supabase
        .from('payments')
        .select(`
            id,
            amount,
            period,
            status,
            payment_method,
            paid_at,
            admin_notes,
            created_at,
            profiles!payments_user_id_fkey (
                full_name,
                nik,
                address,
                rt_rw
            ),
            fees (
                name
            ),
            confirmed_by_profile:profiles!payments_confirmed_by_fkey (
                full_name
            )
        `)
        .order('period', { ascending: false });

    // Filter by housing complex via profiles
    // RLS already handles this, but explicit is safer

    if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
    }

    if (filter?.period) {
        // period is a date column, filter by month: YYYY-MM-01
        const startDate = `${filter.period}-01`;
        const [y, m] = filter.period.split('-').map(Number);
        const endDate = new Date(y, m, 0).toISOString().split('T')[0]; // last day of month
        query = query.gte('period', startDate).lte('period', endDate);
    }

    if (filter?.feeId) {
        query = query.eq('fee_id', filter.feeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows: IuranReportRow[] = (data || []).map((item: any, index: number) => ({
        no: index + 1,
        nama_warga: item.profiles?.full_name || '-',
        nik: item.profiles?.nik || null,
        alamat: item.profiles?.address || null,
        rt_rw: item.profiles?.rt_rw || null,
        nama_iuran: item.fees?.name || '-',
        jumlah: item.amount,
        periode: formatPeriod(item.period),
        status: translateStatus(item.status),
        metode_bayar: item.payment_method || null,
        tanggal_bayar: item.paid_at ? new Date(item.paid_at).toLocaleDateString('id-ID') : null,
        dikonfirmasi_oleh: item.confirmed_by_profile?.full_name || null,
        catatan_admin: item.admin_notes || null,
    }));

    const summary: IuranSummary = {
        totalTransaksi: rows.length,
        totalNominal: rows.reduce((sum, r) => sum + r.jumlah, 0),
        lunas: (data || []).filter((d: any) => d.status === 'paid').length,
        pending: (data || []).filter((d: any) => d.status === 'pending').length,
        ditolak: (data || []).filter((d: any) => d.status === 'rejected').length,
        overdue: (data || []).filter((d: any) => d.status === 'overdue').length,
    };

    return { rows, summary };
};

const formatPeriod = (period: string): string => {
    const d = new Date(period);
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

const translateStatus = (status: string): string => {
    const map: Record<string, string> = {
        paid: 'Lunas',
        pending: 'Menunggu',
        rejected: 'Ditolak',
        overdue: 'Terlambat',
    };
    return map[status] || status;
};
