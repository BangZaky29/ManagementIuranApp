import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchNews, NewsItem } from '../../../services/newsService';
import { calculateBillSummary } from '../../../services/iuranService';
import { triggerPanicButton } from '../../../services/panicService';

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
            const news = await fetchNews(false);
            setNewsItems(news);

            // 2. Fetch Bill Summary
            if (user?.id) {
                const bill = await calculateBillSummary(user.id);
                setBillSummary({
                    total: bill.allPaid ? 'Lunas' : `Rp ${bill.totalUnpaid.toLocaleString('id-ID')}`,
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
        { id: 'iuran', title: 'Iuran', icon: 'cash-outline', route: '/(tabs)/iuran', color: '#0D47A1', bgColor: '#E3F2FD' },
        { id: 'laporan', title: 'Laporan', icon: 'document-text-outline', route: '/(tabs)/laporan', color: '#E65100', bgColor: '#FFF3E0' },
        { id: 'tamu', title: 'Buku Tamu', icon: 'id-card-outline', route: '/warga/guests', color: '#00695C', bgColor: '#E0F2F1' },
        { id: 'panic', title: 'Darurat', icon: 'warning', color: '#C62828', bgColor: '#FFEBEE' },
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

    // ─── 3-Click Panic Button Safety ───────────────
    const panicClickCount = useRef(0);
    const panicTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handlePanicButton = () => {
        panicClickCount.current += 1;

        // Reset timeout on each click
        if (panicTimeoutRef.current) {
            clearTimeout(panicTimeoutRef.current);
        }

        if (panicClickCount.current < 3) {
            const remaining = 3 - panicClickCount.current;
            setAlertConfig({
                title: '⚠️ Tombol Darurat',
                message: `Tekan ${remaining} kali lagi dalam 3 detik untuk mengaktifkan sinyal darurat SOS.`,
                type: 'warning',
                buttons: [{ text: 'Mengerti', onPress: hideAlert }]
            });
            setAlertVisible(true);

            // Reset after 3 seconds of inactivity
            panicTimeoutRef.current = setTimeout(() => {
                panicClickCount.current = 0;
            }, 3000);
            return;
        }

        // 3rd click — Send SOS!
        panicClickCount.current = 0;
        if (panicTimeoutRef.current) clearTimeout(panicTimeoutRef.current);

        (async () => {
            try {
                setAlertConfig({
                    title: '📡 Mengirim SOS...',
                    message: 'Mendeteksi lokasi dan mengirim sinyal darurat...',
                    type: 'warning',
                    buttons: []
                });
                setAlertVisible(true);

                await triggerPanicButton();

                setAlertConfig({
                    title: '🚨 SOS Terkirim!',
                    message: 'Sinyal darurat beserta lokasi GPS Anda telah dikirim ke petugas keamanan.',
                    type: 'error',
                    buttons: [{ text: 'OK', style: 'destructive', onPress: hideAlert }]
                });
            } catch (error) {
                setAlertConfig({
                    title: 'Gagal Mengirim SOS',
                    message: 'Terjadi kesalahan saat mengirim sinyal darurat. Coba lagi.',
                    type: 'error',
                    buttons: [{ text: 'Coba Lagi', onPress: hideAlert }]
                });
            }
            setAlertVisible(true);
        })();
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
