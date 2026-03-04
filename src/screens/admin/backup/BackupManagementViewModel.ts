import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import {
    fetchIuranReport, generateIuranPdf, generateIuranExcel,
    backupToGoogleDrive,
    IuranReportRow, IuranSummary, BackupFilter, BackupLog
} from '../../../services/backup';
import { supabase } from '../../../lib/supabaseConfig';
import { FeatureFlags } from '../../../constants/FeatureFlags';

export type BackupSchedule = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const BACKUP_SCHEDULE_OPTIONS: { key: BackupSchedule; label: string; desc: string }[] = [
    { key: 'daily', label: '1 Hari Sekali', desc: 'Backup otomatis setiap hari' },
    { key: 'weekly', label: '1 Minggu Sekali', desc: 'Backup otomatis setiap Senin' },
    { key: 'monthly', label: '1 Bulan Sekali', desc: 'Backup otomatis tiap tanggal 1' },
    { key: 'yearly', label: '1 Tahun Sekali', desc: 'Backup otomatis setiap 1 Januari' },
];

export function useBackupManagementViewModel() {
    const { profile, googleAccessToken, user, linkGoogle } = useAuth();

    const [rows, setRows] = useState<IuranReportRow[]>([]);
    const [summary, setSummary] = useState<IuranSummary>({
        totalTransaksi: 0, totalNominal: 0, lunas: 0, pending: 0, ditolak: 0, overdue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);

    // Auto backup schedule state
    const [selectedSchedule, setSelectedSchedule] = useState<BackupSchedule>('weekly');
    const [showSchedulePicker, setShowSchedulePicker] = useState(false);

    // Filters
    const [selectedPeriod, setSelectedPeriod] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'paid' | 'pending' | 'rejected' | 'overdue'>('all');
    const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
    const [backupHistory, setBackupHistory] = useState<BackupLog[]>([]);

    const complexName = profile?.housing_complexes?.name || 'Kompleks';
    const complexId = profile?.housing_complex_id || 0;
    const isDriveConnected = !!googleAccessToken;
    const isAutoBackupEnabled = FeatureFlags.IS_AUTO_BACKUP_ENABLED;
    const isRestoreEnabled = FeatureFlags.IS_BACKUP_RESTORE_ENABLED;

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
            Alert.alert('Error', 'Gagal memuat data iuran');
        } finally {
            setIsLoading(false);
        }
    }, [complexId, selectedPeriod, selectedStatus]);

    const loadPeriods = useCallback(async () => {
        const { data } = await supabase.from('payments').select('period').order('period', { ascending: false });
        if (data) {
            const unique = [...new Set(data.map((d: any) => {
                const date = new Date(d.period);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }))];
            setAvailablePeriods(unique);
        }
    }, []);

    const loadBackupHistory = useCallback(async () => {
        if (!complexId) return;
        const { data } = await supabase
            .from('backup_logs')
            .select('*')
            .eq('housing_complex_id', complexId)
            .order('created_at', { ascending: false })
            .limit(10);
        if (data) setBackupHistory(data as BackupLog[]);
    }, [complexId]);

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => { loadPeriods(); loadBackupHistory(); }, [loadPeriods, loadBackupHistory]);

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
            const map: Record<string, string> = { paid: 'Lunas', pending: 'Menunggu', rejected: 'Ditolak', overdue: 'Terlambat' };
            parts.push(map[selectedStatus] || selectedStatus);
        }
        return parts.join(' • ');
    };

    const handleDownloadPdf = async () => {
        if (rows.length === 0) { Alert.alert('Info', 'Tidak ada data'); return; }
        setIsGenerating(true);
        try { await generateIuranPdf(rows, summary, complexName, getFilterLabel()); }
        catch (e: any) { Alert.alert('Gagal', 'Gagal membuat laporan PDF'); }
        finally { setIsGenerating(false); }
    };

    const handleDownloadExcel = async () => {
        if (rows.length === 0) { Alert.alert('Info', 'Tidak ada data'); return; }
        setIsGenerating(true);
        try { await generateIuranExcel(rows, summary, complexName, getFilterLabel()); }
        catch (e: any) { Alert.alert('Gagal', 'Gagal membuat laporan Excel'); }
        finally { setIsGenerating(false); }
    };

    const handleBackupToDrive = async () => {
        if (!googleAccessToken) {
            Alert.alert(
                '🔗 Hubungkan Akun Google',
                'Akun Google belum terhubung. Hubungkan sekarang untuk mengaktifkan backup ke Google Drive?',
                [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Hubungkan Google', onPress: handleLinkGoogle },
                ]
            );
            return;
        }
        if (rows.length === 0) { Alert.alert('Info', 'Tidak ada data untuk di-backup'); return; }

        setIsBackingUp(true);
        try {
            const result = await backupToGoogleDrive(
                rows, user!.id, complexId, complexName, googleAccessToken
            );
            await loadBackupHistory();
            Alert.alert(
                '✅ Backup Berhasil',
                `${rows.length} data berhasil di-backup ke Google Drive.\n\nBuka file di Drive?`,
                [
                    { text: 'Nanti', style: 'cancel' },
                    { text: 'Buka Drive', onPress: () => result.driveLink && Linking.openURL(result.driveLink) },
                ]
            );
        } catch (e: any) {
            Alert.alert('Gagal', `Backup gagal: ${e.message}`);
        } finally {
            setIsBackingUp(false);
        }
    };

    /**
     * Link Google account to existing session using linkIdentity.
     * After linking, the session will have provider_token for Drive access.
     */
    const handleLinkGoogle = async () => {
        setIsLinkingGoogle(true);
        try {
            await linkGoogle();
            Alert.alert(
                '✅ Google Terhubung',
                'Akun Google berhasil dihubungkan! Sekarang Anda bisa backup data ke Google Drive.',
                [{ text: 'OK' }]
            );
        } catch (e: any) {
            Alert.alert('Gagal', `Gagal menghubungkan Google: ${e.message}`);
        } finally {
            setIsLinkingGoogle(false);
        }
    };

    const handleScheduleSelect = (schedule: BackupSchedule) => {
        setSelectedSchedule(schedule);
        setShowSchedulePicker(false);
        Alert.alert(
            '✅ Jadwal Tersimpan',
            `Backup otomatis diatur: ${BACKUP_SCHEDULE_OPTIONS.find(o => o.key === schedule)?.label}`,
            [{ text: 'OK' }]
        );
    };

    const formatPeriodLabel = (period: string): string => {
        const [y, m] = period.split('-');
        return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    };

    const formatDateTime = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return {
        rows, summary, isLoading, isGenerating, isBackingUp, isLinkingGoogle,
        selectedPeriod, setSelectedPeriod,
        selectedStatus, setSelectedStatus,
        availablePeriods, backupHistory, complexName,
        isDriveConnected, isAutoBackupEnabled, isRestoreEnabled,
        googleEmail: user?.email || null,
        selectedSchedule, showSchedulePicker,
        setShowSchedulePicker,
        handleDownloadPdf, handleDownloadExcel,
        handleBackupToDrive, handleLinkGoogle,
        handleScheduleSelect,
        formatPeriodLabel, getFilterLabel, formatDateTime,
        refresh: loadData,
    };
}
