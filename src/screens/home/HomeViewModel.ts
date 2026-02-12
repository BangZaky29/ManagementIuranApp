import { useState } from 'react';
import { useRouter } from 'expo-router';
import { NEWS_ITEMS, NewsItem } from '../../data/NewsData';

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
    const [userName] = useState('Budi');
    const [weather] = useState({ temp: '28°C', condition: 'Cerah', location: 'Jakarta Selatan' });
    const [billSummary] = useState({ total: 'Rp 150.000', label: 'Iuran Keamanan & Sampah', dueDate: '15 Feb 2026' });

    const newsItems: NewsItem[] = NEWS_ITEMS;

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

    const handlePanicButton = () => {
        setAlertConfig({
            title: 'SOS Terkirim!',
            message: 'Sinyal darurat telah dikirim ke petugas keamanan dan warga sekitar.',
            type: 'error', // Red for emergency
            buttons: [{ text: 'OK', style: 'destructive', onPress: hideAlert }]
        });
        setAlertVisible(true);
    };

    return {
        userName,
        weather,
        billSummary,
        newsItems,
        quickActions,
        handleNavigation,
        handleNewsClick,
        handlePanicButton,
        alertVisible,
        alertConfig,
        hideAlert
    };
};
