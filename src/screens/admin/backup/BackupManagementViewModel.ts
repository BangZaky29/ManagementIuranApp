import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchIuranReport, generateIuranPdf, generateIuranExcel, IuranReportRow, IuranSummary, BackupFilter } from '../../../services/backup';
import { supabase } from '../../../lib/supabaseConfig';

export function useBackupManagementViewModel() {
    const { profile } = useAuth();

    const [rows, setRows] = useState<IuranReportRow[]>([]);
    const [summary, setSummary] = useState<IuranSummary>({
        totalTransaksi: 0, totalNominal: 0, lunas: 0, pending: 0, ditolak: 0, overdue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Filters
    const [selectedPeriod, setSelectedPeriod] = useState<string>(''); // '' = semua
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'paid' | 'pending' | 'rejected' | 'overdue'>('all');
    const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);

    // Fees for filter
    const [fees, setFees] = useState<{ id: number; name: string }[]>([]);

    const complexName = profile?.housing_complexes?.name || 'Kompleks';
    const complexId = profile?.housing_complex_id || 0;

    const loadData = useCallback(async () => {
        if (!complexId) return;
        setIsLoading(true);
        try {
            const filter: BackupFilter = {};
            if (selectedPeriod) filter.period = selectedPeriod;
            if (selectedStatus !== 'all') filter.status = selectedStatus;

            const result = await fetchIuranReport(complexId, filter);
            setRows(result.rows);
            setSummary(result.summary);
        } catch (error: any) {
            console.error('Failed to load iuran data:', error);
            Alert.alert('Error', 'Gagal memuat data iuran');
        } finally {
            setIsLoading(false);
        }
    }, [complexId, selectedPeriod, selectedStatus]);

    const loadPeriods = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('payments')
                .select('period')
                .order('period', { ascending: false });

            if (data) {
                const uniquePeriods = [...new Set(data.map((d: any) => {
                    const date = new Date(d.period);
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                }))];
                setAvailablePeriods(uniquePeriods);
            }
        } catch (err) {
            console.error('Failed to load periods:', err);
        }
    }, []);

    const loadFees = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('fees')
                .select('id, name')
                .eq('is_active', true)
                .order('name');
            if (data) setFees(data);
        } catch (err) {
            console.error('Failed to load fees:', err);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        loadPeriods();
        loadFees();
    }, [loadPeriods, loadFees]);

    const getFilterLabel = (): string => {
        const parts: string[] = [];
        if (selectedPeriod) {
            const [y, m] = selectedPeriod.split('-');
            const d = new Date(parseInt(y), parseInt(m) - 1);
            parts.push(d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }));
        } else {
            parts.push('Semua Periode');
        }
        if (selectedStatus !== 'all') {
            const statusMap: Record<string, string> = { paid: 'Lunas', pending: 'Menunggu', rejected: 'Ditolak', overdue: 'Terlambat' };
            parts.push(statusMap[selectedStatus] || selectedStatus);
        }
        return parts.join(' • ');
    };

    const handleDownloadPdf = async () => {
        if (rows.length === 0) {
            Alert.alert('Info', 'Tidak ada data untuk diunduh');
            return;
        }
        setIsGenerating(true);
        try {
            await generateIuranPdf(rows, summary, complexName, getFilterLabel());
        } catch (error: any) {
            console.error('PDF generation error:', error);
            Alert.alert('Gagal', 'Gagal membuat laporan PDF');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadExcel = async () => {
        if (rows.length === 0) {
            Alert.alert('Info', 'Tidak ada data untuk diunduh');
            return;
        }
        setIsGenerating(true);
        try {
            await generateIuranExcel(rows, summary, complexName, getFilterLabel());
        } catch (error: any) {
            console.error('Excel generation error:', error);
            Alert.alert('Gagal', 'Gagal membuat laporan Excel');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatPeriodLabel = (period: string): string => {
        const [y, m] = period.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    };

    return {
        rows, summary, isLoading, isGenerating,
        selectedPeriod, setSelectedPeriod,
        selectedStatus, setSelectedStatus,
        availablePeriods, fees, complexName,
        handleDownloadPdf, handleDownloadExcel,
        formatPeriodLabel, getFilterLabel,
        refresh: loadData,
    };
}
