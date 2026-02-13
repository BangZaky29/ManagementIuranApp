import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPublishedNews, NewsItem } from '../../services/newsService';
import { calculateBillSummary } from '../../services/iuranService';
import { triggerPanicButton } from '../../services/panicService';

export interface QuickAction {
    id: string;
    title: string;
    icon: string;
    route?: string;
    color: string;
    bgColor: string;
}

export const useHomeViewModel = () => {
    const router = useRouter();
    const { user, profile } = useAuth();

    // State
    const [userName, setUserName] = useState(profile?.full_name || 'Warga');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
    const [weather] = useState({ temp: '28°C', condition: 'Cerah', location: 'Jakarta Selatan' });
    const [billSummary, setBillSummary] = useState({ total: 'Rp 0', label: 'Iuran Keamanan & Sampah', dueDate: '-' });
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        if (profile?.full_name) {
            setUserName(profile.full_name);
            setAvatarUrl(profile.avatar_url);
        }
        loadData();
    }, [profile]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch News
            const news = await fetchPublishedNews();
            setNewsItems(news);

            // 2. Fetch Bill Summary
            if (user?.id) {
                const bill = await calculateBillSummary(user.id);
                setBillSummary({
                    total: bill.isPaid ? 'Lunas' : `Rp ${bill.total.toLocaleString('id-ID')}`,
                    label: 'Iuran Bulanan',
                    dueDate: bill.dueDate
                });
            }
        } catch (error) {
            console.error('Failed to load home data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions: QuickAction[] = [
        { id: 'pay', title: 'Bayar Iuran', icon: 'card-outline', route: '/(tabs)/iuran', color: '#1B5E20', bgColor: '#C8E6C9' },
        { id: 'report', title: 'Lapor', icon: 'chatbox-ellipses-outline', route: '/(tabs)/laporan', color: '#E65100', bgColor: '#FFE0B2' },
        { id: 'panic', title: 'Darurat', icon: 'warning-outline', color: '#B71C1C', bgColor: '#FFCDD2' },
        { id: 'shop', title: 'UMKM', icon: 'storefront-outline', color: '#0D47A1', bgColor: '#BBDEFB' },
        { id: 'voting', title: 'Voting', icon: 'stats-chart-outline', color: '#4A148C', bgColor: '#E1BEE7' },
        { id: 'more', title: 'Lainnya', icon: 'grid-outline', color: '#333333', bgColor: '#F5F5F5' },
    ];

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    const handleNavigation = (route?: string) => {
        if (route) {
            router.push(route as any);
        } else {
            setAlertConfig({
                title: 'Segera Hadir',
                message: 'Fitur ini dalam tahap pengembangan.',
                type: 'info',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        }
    };

    const handleNewsClick = (id: number) => {
        router.push(`/news/${id}` as any);
    };

    const handlePanicButton = async () => {
        try {
            await triggerPanicButton();
            setAlertConfig({
                title: 'SOS Terkirim!',
                message: 'Sinyal darurat telah dikirim ke petugas keamanan dan warga sekitar.',
                type: 'error', // Red for emergency
                buttons: [{ text: 'OK', style: 'destructive', onPress: hideAlert }]
            });
        } catch (error) {
            setAlertConfig({
                title: 'Gagal Mengirim SOS',
                message: 'Terjadi kesalahan saat mengirim sinyal darurat.',
                type: 'error',
                buttons: [{ text: 'Coba Lagi', onPress: hideAlert }]
            });
        }
        setAlertVisible(true);
    };

    return {
        userName,
        avatarUrl,
        weather,
        billSummary,
        newsItems,
        quickActions,
        handleNavigation,
        handleNewsClick,
        handlePanicButton,
        alertVisible,
        alertConfig,
        hideAlert,
        isLoading,
        refresh: loadData
    };
};
