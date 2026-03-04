import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchNews, NewsItem } from '../../../services/news';
import { fetchBillingPeriods } from '../../../services/iuran';
import { triggerPanicButton } from '../../../services/panic';
import { getUnreadNotificationCount } from '../../../services/notification';
import { supabase } from '../../../lib/supabaseConfig';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { fetchActiveBanners, Banner } from '../../../services/banner';
import { FeatureFlags } from '../../../constants/FeatureFlags';

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
    const [weather, setWeather] = useState({
        temp: '...',
        condition: 'Memuat...',
        location: 'Mencari lokasi...',
        icon: 'partly-sunny' as any,
        color: '#FFCA28'
    });
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
                setWeather({
                    temp: '--',
                    condition: 'Akses Ditolak',
                    location: 'Izinkan Lokasi',
                    icon: 'location-outline',
                    color: '#90A4AE'
                });
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

                // 🌎 Comprehensive WMO Weather Code Mapping (0-99)
                const getWeatherData = (code: number) => {
                    if (code === 0) return { label: 'Cerah', icon: 'sunny', color: '#FFCA28' };
                    if (code >= 1 && code <= 3) return { label: 'Berawan', icon: 'partly-sunny', color: '#FFCA28' };
                    if (code === 45 || code === 48) return { label: 'Kabut', icon: 'cloud', color: '#90A4AE' };
                    if (code >= 51 && code <= 55) return { label: 'Gerimis', icon: 'rainy', color: '#42A5F5' };
                    if (code >= 56 && code <= 57) return { label: 'Gerimis Beku', icon: 'snow', color: '#E1F5FE' };
                    if (code >= 61 && code <= 65) return { label: 'Hujan', icon: 'rainy', color: '#1E88E5' };
                    if (code >= 66 && code <= 67) return { label: 'Hujan Beku', icon: 'snow', color: '#E1F5FE' };
                    if (code >= 71 && code <= 75) return { label: 'Salju', icon: 'snow', color: '#FFFFFF' };
                    if (code === 77) return { label: 'Butiran Salju', icon: 'snow', color: '#FFFFFF' };
                    if (code >= 80 && code <= 82) return { label: 'Hujan Lebat', icon: 'thunderstorm', color: '#1565C0' };
                    if (code >= 85 && code <= 86) return { label: 'Salju Lebat', icon: 'snow', color: '#FFFFFF' };
                    if (code === 95) return { label: 'Badai Petir', icon: 'thunderstorm', color: '#F4511E' };
                    if (code >= 96 && code <= 99) return { label: 'Badai & Es', icon: 'thunderstorm', color: '#F4511E' };
                    return { label: 'Berawan', icon: 'cloud', color: '#90A4AE' };
                };

                const weatherInfo = getWeatherData(code);

                setWeather({
                    temp: `${temp}°C`,
                    condition: weatherInfo.label,
                    location: city,
                    icon: weatherInfo.icon,
                    color: weatherInfo.color
                });
            }
        } catch (error) {
            console.error('Location/Weather Error:', error);
            setWeather({
                temp: '--',
                condition: 'Error',
                location: 'Gagal memuat',
                icon: 'alert-circle-outline',
                color: '#EF5350'
            });
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

    const showUnderDevelopmentAlert = () => {
        setAlertConfig({
            title: 'Informasi',
            message: 'Fitur masih dalam tahap pengembangan',
            type: 'info',
            buttons: [{ text: 'OK', onPress: hideAlert }]
        });
        setAlertVisible(true);
    };

    const handleNavigation = (route?: string) => {
        if (route) {
            router.push(route as any);
        } else {
            showUnderDevelopmentAlert();
        }
    };

    const handleNewsClick = (id: number) => {
        router.push(`/news/${id}` as any);
    };

    // ─── Refined 3-Click Panic Button Safety ───────────────
    const [isPanicSessionActive, setIsPanicSessionActive] = useState(false);
    const [panicTimeLeft, setPanicTimeLeft] = useState(10);
    const panicClickCount = useRef(0);
    const panicTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startPanicSession = () => {
        setIsPanicSessionActive(true);
        panicClickCount.current = 0;
        setPanicTimeLeft(10);

        // Clear existing timers
        if (panicTimeoutRef.current) clearTimeout(panicTimeoutRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        // Start Countdown Timer
        countdownIntervalRef.current = setInterval(() => {
            setPanicTimeLeft(prev => {
                if (prev <= 1) {
                    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Auto-reset if no activity for 10 seconds
        panicTimeoutRef.current = setTimeout(() => {
            resetPanicSession();
        }, 10000);
    };

    const resetPanicSession = () => {
        setIsPanicSessionActive(false);
        panicClickCount.current = 0;
        setPanicTimeLeft(10);
        if (panicTimeoutRef.current) clearTimeout(panicTimeoutRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };

    const handlePanicButton = () => {
        if (!isPanicSessionActive) {
            // Step 1: Show Instruction Alert
            setAlertConfig({
                title: '⚠️ Panic Button',
                message: 'Tekan sebanyak 3 kali berturut turut untuk aktifkan panic button.',
                type: 'warning',
                buttons: [{
                    text: 'Mengerti',
                    onPress: () => {
                        hideAlert();
                        startPanicSession();
                    }
                }]
            });
            setAlertVisible(true);
            return;
        }

        // Step 2: Session is active, count clicks
        panicClickCount.current += 1;

        // Reset the 10s timer on each click to keep the window open while user is active
        if (panicTimeoutRef.current) clearTimeout(panicTimeoutRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        setPanicTimeLeft(10);
        countdownIntervalRef.current = setInterval(() => {
            setPanicTimeLeft(prev => {
                if (prev <= 1) {
                    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        panicTimeoutRef.current = setTimeout(() => {
            resetPanicSession();
        }, 10000);

        if (panicClickCount.current < 3) {
            return;
        }

        // Step 3: 3rd click — Send SOS!
        resetPanicSession();

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
        verifyLocation,
        // Added for visual feedback
        isPanicSessionActive,
        panicTimeLeft,
        panicClickCount: panicClickCount.current // Pass as value for UI
    };
};
