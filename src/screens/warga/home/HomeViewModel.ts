import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchNews, NewsItem } from '../../../services/newsService';
import { fetchBillingPeriods } from '../../../services/iuranService';
import { triggerPanicButton } from '../../../services/panicService';
import { getUnreadNotificationCount } from '../../../services/notificationService';
import { supabase } from '../../../lib/supabaseConfig';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { fetchActiveBanners, Banner } from '../../../services/bannerService';

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
    const [weather, setWeather] = useState({ temp: '...', condition: 'Memuat...', location: 'Mencari lokasi...' });
    const [billSummary, setBillSummary] = useState({ total: 'Rp 0', label: 'Iuran Keamanan & Sampah', dueDate: '-' });
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Fetch & Realtime Subscription
    useEffect(() => {
        if (profile?.full_name) {
            setUserName(profile.full_name);
            setAvatarUrl(profile.avatar_url);
        }
        loadData();
        verifyLocation(); // Auto fetch location on mount

        // 🟢 REALTIME SUBSCRIPTION FOR NOTIFICATIONS
        if (!user?.id) return;

        const notificationSubscription = supabase
            .channel(`public:notifications:user_id=eq.${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Realtime Notification Received!', payload);
                    // Increment count immediately without fetching
                    setUnreadNotifCount((prev) => prev + 1);
                }
            )
            .subscribe((status) => {
                console.log('Supabase Realtime Status (Notifications):', status);
            });

        return () => {
            supabase.removeChannel(notificationSubscription);
        };
    }, [profile, user?.id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch News
            const news = await fetchNews(false);
            setNewsItems(news);

            // 2. Fetch Bill Summary & Notification Counts
            if (user?.id) {
                const bill = await fetchBillingPeriods(user.id);
                setBillSummary({
                    total: bill.totalUnpaid === 0 ? 'Lunas' : `Rp ${bill.totalUnpaid.toLocaleString('id-ID')}`,
                    label: 'Iuran Bulanan',
                    dueDate: '-'
                });

                // 3. Unread Notifications Count
                const count = await getUnreadNotificationCount();
                setUnreadNotifCount(count);

                // 4. Fetch Banners
                const activeBanners = await fetchActiveBanners();
                setBanners(activeBanners);
            }
        } catch (error) {
            console.error('Failed to load home data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyLocation = async () => {
        try {
            setWeather(prev => ({ ...prev, location: 'Mencari...' }));
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setWeather({ temp: '--', condition: 'Akses Ditolak', location: 'Izinkan Lokasi' });
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Optional: Reverse Geocoding
            const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            const city = reverseGeocode[0]?.city || reverseGeocode[0]?.subregion || 'Lokasi Terdeteksi';

            // Fetch Weather from Open-Meteo (No API Key Required)
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const weatherData = await weatherRes.json();

            if (weatherData && weatherData.current_weather) {
                const temp = Math.round(weatherData.current_weather.temperature);
                const code = weatherData.current_weather.weathercode;

                // Map weather code to simple condition
                let condition = 'Cerah';
                if (code >= 1 && code <= 3) condition = 'Berawan';
                if (code >= 51 && code <= 67) condition = 'Gerimis/Hujan';
                if (code >= 71 && code <= 86) condition = 'Salju';
                if (code >= 95) condition = 'Badai';

                setWeather({
                    temp: `${temp}°C`,
                    condition,
                    location: city
                });
            }
        } catch (error) {
            console.error('Location/Weather Error:', error);
            setWeather({ temp: '--', condition: 'Error', location: 'Gagal memuat' });
        }
    };

    const quickActions: QuickAction[] = [
        { id: 'iuran', title: 'Iuran', icon: 'cash-outline', route: '/(tabs)/iuran', color: '#0D47A1', bgColor: '#E3F2FD' },
        { id: 'laporan', title: 'Laporan', icon: 'document-text-outline', route: '/(tabs)/laporan', color: '#E65100', bgColor: '#FFF3E0' },
        { id: 'tamu', title: 'Buku Tamu', icon: 'id-card-outline', route: '/warga/guests', color: '#00695C', bgColor: '#E0F2F1' },
        { id: 'panic', title: 'Darurat', icon: 'warning', color: '#C62828', bgColor: '#FFEBEE' },
        { id: 'message', title: 'Message', icon: 'chatbox-ellipses-outline', color: '#0288D1', bgColor: '#E1F5FE' },
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
                // 🆘 SMS FALLBACK IF INTERNET/API FAILS
                setAlertConfig({
                    title: 'Gagal Mengirim SOS 📶',
                    message: 'Tidak ada koneksi internet. Ingin memanggil satpam lewat SMS Standar (berlaku tarif pulsa)?',
                    type: 'error',
                    buttons: [
                        { text: 'Batal', style: 'cancel', onPress: hideAlert },
                        {
                            text: 'Kirim SMS Darurat',
                            style: 'destructive',
                            onPress: () => {
                                hideAlert();
                                // Example Phone Number (Ganti dengan nomor satpam sesungguhnya yg diset dinamis nantinya)
                                const securityPhone = '081234567890';
                                const smsBody = '🚨 DARURAT (SOS) - Tolong secepatnya datang ke rumah saya!';
                                const separator = Platform.OS === 'ios' ? '&' : '?';
                                const smsUrl = `sms:${securityPhone}${separator}body=${encodeURIComponent(smsBody)}`;

                                Linking.openURL(smsUrl).catch(err => console.error('Error opening SMS app', err));
                            }
                        }
                    ]
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
        unreadNotifCount,
        banners,
        quickActions,
        handleNavigation,
        handleNewsClick,
        handlePanicButton,
        alertVisible,
        alertConfig,
        hideAlert,
        isLoading,
        refresh: loadData,
        verifyLocation
    };
};
