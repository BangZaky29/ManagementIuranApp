import { useState, useCallback, useEffect } from 'react';
import { fetchAllReports, updateReportStatus, Report } from '../../services/laporanService';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';

export function useSecurityReportsViewModel() {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Semua');

    const loadReports = useCallback(async (isRefresh = false, loadMore = false) => {
        try {
            const limit = 3;
            const currentPage = isRefresh ? 0 : (loadMore ? page + 1 : 0);

            if (isRefresh) setRefreshing(true);
            else if (!loadMore) setIsLoading(true);

            const data = await fetchAllReports(currentPage, limit, filterStatus);

            if (isRefresh || !loadMore) {
                setReports(data);
                setPage(0);
            } else {
                setReports(prev => [...prev, ...data]);
                setPage(currentPage);
            }

            setHasMore(data.length === limit);
        } catch (error) {
            console.error('Failed to load reports for security:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [filterStatus, page]);

    useEffect(() => {
        loadReports(true);
    }, [filterStatus]);

    // Alert State
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'success' | 'info' | 'warning' | 'error';
        buttons: any[];
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        buttons: []
    });

    const showAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info', buttons?: any[]) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            buttons: buttons || [{ text: 'OK', onPress: hideAlert }]
        });
    };

    const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

    const handleUpdateStatus = async (
        reportId: string,
        status: string,
        options?: { reason?: string; completionImageUri?: string }
    ) => {
        try {
            await updateReportStatus(reportId, status, {
                rejectionReason: options?.reason,
                completionImageUri: options?.completionImageUri
            });

            // Refresh local state
            setReports(prev => prev.map(r => r.id === reportId ? {
                ...r,
                status: status as any,
                rejection_reason: options?.reason || r.rejection_reason,
                completion_image_url: options?.completionImageUri ? 'updating...' : r.completion_image_url // Temporary until refresh
            } : r));

            if (!options?.completionImageUri) {
                // Only refresh immediately if no image was uploaded (uploading takes time, better to reload)
                loadReports(true);
            } else {
                await loadReports(true);
            }

            showAlert('Sukses', `Status laporan diubah menjadi ${status}`, 'success');
        } catch (error) {
            console.error('Failed to update report status:', error);
            showAlert('Error', 'Gagal memperbarui status', 'error');
        }
    };

    const pickCompletionImage = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                showAlert('Izin Ditolak', 'Izin kamera diperlukan untuk mengambil foto bukti.', 'warning');
                return null;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0].uri) {
                return result.assets[0].uri;
            }
            return null;
        } catch (error) {
            console.error('Pick completion image error:', error);
            return null;
        }
    };

    return {
        reports,
        isLoading,
        refreshing,
        hasMore,
        filterStatus,
        setFilterStatus,
        loadReports,
        handleUpdateStatus,
        pickCompletionImage,
        alertConfig,
        hideAlert,
    };
}
