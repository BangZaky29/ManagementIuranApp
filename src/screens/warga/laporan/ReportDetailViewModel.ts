import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchReportById, deleteReport, Report } from '../../../services/laporanService';
import { Alert, Image } from 'react-native';
import { Colors } from '../../../constants/Colors';

export const useReportDetailViewModel = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [data, setData] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageAspectRatio, setImageAspectRatio] = useState<number>(4 / 3);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    // Fetch Data
    useEffect(() => {
        loadDetail();
    }, [id]);

    const loadDetail = async () => {
        if (typeof id === 'string') {
            setLoading(true);
            const report = await fetchReportById(id);
            setData(report);
            setLoading(false);
        }
    };

    // Image Aspect Ratio
    useEffect(() => {
        if (data?.image_url) {
            Image.getSize(data.image_url, (width, height) => {
                if (width && height) {
                    setImageAspectRatio(width / height);
                }
            }, (error) => {
                console.warn("Failed to get image size", error);
            });
        }
    }, [data?.image_url]);

    // Actions
    const handleOpenLocation = () => {
        if (data?.location) {
            import('react-native').then(({ Linking }) => {
                Linking.openURL(data.location!).catch(err => {
                    Alert.alert('Gagal Membuka Peta', 'Tidak dapat membuka aplikasi peta.');
                });
            });
        }
    };

    const handleEdit = () => {
        if (!data) return;
        // Navigate to Create Screen but with ID (Edit Mode)
        router.push({
            pathname: '/laporan/create',
            params: { id: data.id }
        });
    };

    const handleDelete = () => {
        setAlertConfig({
            title: 'Hapus Laporan?',
            message: 'Apakah anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'warning',
            buttons: [
                {
                    text: 'Batal',
                    style: 'cancel',
                    onPress: hideAlert
                },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        hideAlert();
                        await confirmDelete();
                    }
                }
            ]
        });
        setAlertVisible(true);
    };

    const confirmDelete = async () => {
        if (!data) return;
        setLoading(true);
        try {
            await deleteReport(data.id);

            // Navigate back safely
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(tabs)/laporan');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            setLoading(false);
            setTimeout(() => {
                setAlertConfig({
                    title: 'Gagal Menghapus',
                    message: error.message || 'Terjadi kesalahan saat menghapus laporan.',
                    type: 'error',
                    buttons: [{ text: 'OK', onPress: hideAlert }]
                });
                setAlertVisible(true);
            }, 500);
        }
    };

    // Helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Selesai': return Colors.success;
            case 'Diproses': return Colors.warning;
            case 'Ditolak': return Colors.danger;
            default: return Colors.textSecondary;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'Selesai': return '#E8F5E9';
            case 'Diproses': return '#FFF3E0';
            case 'Ditolak': return '#FFEBEE';
            default: return '#F5F5F5';
        }
    };

    return {
        data,
        loading,
        imageAspectRatio,
        alertVisible,
        alertConfig,
        hideAlert,
        handleOpenLocation,
        handleDelete,
        handleEdit,
        getStatusColor,
        getStatusBg,
        refresh: loadDetail // Expose refresh function to reload if needed
    };
};
