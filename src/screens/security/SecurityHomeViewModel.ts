import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPanicLogs, resolvePanicLog, countActivePanics, PanicLog } from '../../services/panicService';
import { countActiveVisitors } from '../../services/guestService';
import { getDashboardStats } from '../../services/adminService';

export function useSecurityHomeViewModel() {
    const { signOut, user } = useAuth();
    const router = useRouter();

    // Dashboard stats
    const [stats, setStats] = useState({ warga: 0, security: 0, activeUsers: 0 });
    const [activePanics, setActivePanics] = useState(0);
    const [activeGuests, setActiveGuests] = useState(0);
    const [recentPanics, setRecentPanics] = useState<PanicLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[]
    });
    const hideAlert = () => setAlertVisible(false);

    const loadData = useCallback(async () => {
        try {
            const [statsData, panicCount, guestCount, panicLogs] = await Promise.all([
                getDashboardStats(),
                countActivePanics(),
                countActiveVisitors(),
                fetchPanicLogs(0, 5, false), // Latest 5 active panics
            ]);
            setStats(statsData);
            setActivePanics(panicCount);
            setActiveGuests(guestCount);
            setRecentPanics(panicLogs);
        } catch (error) {
            console.error('Failed to load security dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        // Auto-refresh every 15 seconds
        const interval = setInterval(loadData, 15000);
        return () => clearInterval(interval);
    }, [loadData]);

    const handleLogout = async () => {
        await signOut();
        router.replace('/login');
    };

    const navigateToPanicLogs = () => router.push('/security/panic-logs' as any);
    const navigateToGuestBook = () => router.push('/security/guests' as any);

    const openPanicLocation = (log: PanicLog) => {
        if (log.location && log.location.startsWith('http')) {
            Linking.openURL(log.location);
        }
    };

    const handleResolvePanic = (log: PanicLog) => {
        setAlertConfig({
            title: 'Tandai Selesai?',
            message: `Situasi darurat dari ${log.profiles?.full_name || 'Warga'} sudah ditangani?`,
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Selesai', style: 'destructive', onPress: async () => {
                        hideAlert();
                        await resolvePanicLog(log.id);
                        loadData();
                    }
                }
            ]
        });
        setAlertVisible(true);
    };

    const formatTime = (dateString: string) => {
        const d = new Date(dateString);
        const diff = Date.now() - d.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes}m lalu`;
        if (hours < 24) return `${hours}j lalu`;
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return {
        user, stats, activePanics, activeGuests, recentPanics, isLoading,
        handleLogout, navigateToPanicLogs, navigateToGuestBook,
        openPanicLocation, handleResolvePanic, formatTime,
        alertVisible, alertConfig, hideAlert, refresh: loadData,
    };
}
