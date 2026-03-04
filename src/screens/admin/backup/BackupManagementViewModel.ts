import { useState, useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
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

type AlertType = 'success' | 'info' | 'warning' | 'error';
interface AlertButton { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive'; }

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

    // Custom alert state (replaces Alert.alert)
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{
        title: string; message: string; type: AlertType; buttons: AlertButton[];
    }>({ title: '', message: '', type: 'info', buttons: [] });

    const hideAlert = () => setAlertVisible(false);
    const showAlert = (title: string, message: string, type: AlertType, buttons?: AlertButton[]) => {
        setAlertConfig({
            title, message, type,
            buttons: buttons ?? [{ text: 'OK', onPress: hideAlert }],
        });
        setAlertVisible(true);
    };

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
    const isGoogleLinked = user?.app_metadata?.providers?.includes('google') ?? false;
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
        } catch {
            showAlert('Error', 'Gagal memuat data iuran', 'error');
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
            .from('backup_logs').select('*')
            .eq('housing_complex_id', complexId)
            .order('created_at', { ascending: false }).limit(10);
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
        if (rows.length === 0) { showAlert('Info', 'Tidak ada data untuk diunduh', 'info'); return; }
        setIsGenerating(true);
        try { await generateIuranPdf(rows, summary, complexName, getFilterLabel()); }
        catch { showAlert('Gagal', 'Gagal membuat laporan PDF', 'error'); }
        finally { setIsGenerating(false); }
    };

    const handleDownloadExcel = async () => {
        if (rows.length === 0) { showAlert('Info', 'Tidak ada data untuk diunduh', 'info'); return; }
        setIsGenerating(true);
        try { await generateIuranExcel(rows, summary, complexName, getFilterLabel()); }
        catch { showAlert('Gagal', 'Gagal membuat laporan Excel', 'error'); }
        finally { setIsGenerating(false); }
    };

    const handleBackupToDrive = async () => {
        if (!googleAccessToken) {
            if (isGoogleLinked) {
                showAlert(
                    'Akses Drive Belum Aktif',
                    'Akun Anda sudah terhubung ke Google, namun token akses belum aktif pada sesi ini. Silakan keluar dan masuk kembali menggunakan tombol "Masuk dengan Google".',
                    'warning',
                    [
                        { text: 'Nanti', style: 'cancel', onPress: hideAlert },
                        { text: 'Keluar Sekarang', style: 'destructive', onPress: () => { hideAlert(); supabase.auth.signOut(); } },
                    ]
                );
            } else {
                showAlert(
                    'Hubungkan Akun Google',
                    'Akun Google belum terhubung. Hubungkan sekarang untuk mengaktifkan backup ke Google Drive?',
                    'warning',
                    [
                        { text: 'Batal', style: 'cancel', onPress: hideAlert },
                        { text: 'Hubungkan Google', onPress: () => { hideAlert(); handleLinkGoogle(); } },
                    ]
                );
            }
            return;
        }
        if (rows.length === 0) { showAlert('Info', 'Tidak ada data untuk di-backup', 'info'); return; }

        setIsBackingUp(true);
        try {
            const result = await backupToGoogleDrive(rows, user!.id, complexId, complexName, googleAccessToken);
            await loadBackupHistory();
            showAlert(
                'Backup Berhasil',
                `${rows.length} data berhasil di-backup ke Google Drive.`,
                'success',
                [
                    { text: 'Nanti', style: 'cancel', onPress: hideAlert },
                    {
                        text: 'Buka Drive',
                        onPress: () => {
                            hideAlert();
                            if (result.driveLink) Linking.openURL(result.driveLink);
                        }
                    },
                ]
            );
        } catch (e: any) {
            showAlert('Backup Gagal', e.message || 'Terjadi kesalahan saat backup', 'error');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleLinkGoogle = async () => {
        setIsLinkingGoogle(true);
        try {
            await linkGoogle();
            showAlert(
                'Google Terhubung',
                'Akun Google berhasil dihubungkan! Sekarang Anda bisa backup data ke Google Drive.',
                'success',
                [{ text: 'OK', onPress: hideAlert }]
            );
        } catch (e: any) {
            const msg: string = e.message || '';
            if (msg.includes('token Drive')) {
                showAlert(
                    'Satu Langkah Lagi',
                    'Akun Google sudah terhubung, tapi token Drive belum tersedia.\n\nKeluar lalu login kembali menggunakan tombol "Masuk dengan Google" agar token Drive aktif.',
                    'warning',
                    [
                        { text: 'Nanti', style: 'cancel', onPress: hideAlert },
                        { text: 'Keluar Sekarang', style: 'destructive', onPress: () => { hideAlert(); supabase.auth.signOut(); } },
                    ]
                );
            } else {
                showAlert('Gagal', `Gagal menghubungkan Google: ${msg}`, 'error');
            }
        } finally {
            setIsLinkingGoogle(false);
        }
    };

    const handleScheduleSelect = (schedule: BackupSchedule) => {
        setSelectedSchedule(schedule);
        setShowSchedulePicker(false);
        showAlert(
            'Jadwal Tersimpan',
            `Backup otomatis diatur: ${BACKUP_SCHEDULE_OPTIONS.find(o => o.key === schedule)?.label}`,
            'success',
            [{ text: 'OK', onPress: hideAlert }]
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
        isGoogleLinked, isDriveConnected, isAutoBackupEnabled, isRestoreEnabled,
        googleEmail: user?.email || null,
        selectedSchedule, showSchedulePicker, setShowSchedulePicker,
        alertVisible, alertConfig, hideAlert, showAlert,
        handleDownloadPdf, handleDownloadExcel,
        handleBackupToDrive, handleLinkGoogle,
        handleScheduleSelect,
        formatPeriodLabel, getFilterLabel, formatDateTime,
        refresh: loadData,
    };
}
