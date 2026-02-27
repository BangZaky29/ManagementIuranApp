import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPanicLogs, resolvePanicLog, countActivePanics, PanicLog } from '../../services/panicService';
import { countActiveVisitors } from '../../services/guestService';
import { countPendingPayments } from '../../services/paymentConfirmationService';
import { getDashboardStats } from '../../services/adminService';
import { fetchRecentActivityLogs, ActivityLog } from '../../services/activityLogService';
import { supabase } from '../../lib/supabaseConfig';

export function useAdminHomeViewModel() {
    const { signOut, user } = useAuth();
    const router = useRouter();

    // Dashboard stats
    const [stats, setStats] = useState({ warga: 0, security: 0, activeUsers: 0 });
    const [activePanics, setActivePanics] = useState(0);
    const [activeGuests, setActiveGuests] = useState(0);
    const [recentPanics, setRecentPanics] = useState<PanicLog[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [pendingPayments, setPendingPayments] = useState(0);
    const [pendingReports, setPendingReports] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[]
    });
    const hideAlert = () => setAlertVisible(false);

    const loadData = useCallback(async () => {
        try {
            // Count pending reports inline (or can be moved to a service)
            const fetchPendingReports = async () => {
                const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'menunggu');
                return count || 0;
            };

            const [statsData, panicCount, guestCount, panicLogs, paymentCount, reportCount, logsData] = await Promise.all([
                getDashboardStats(),
                countActivePanics(),
                countActiveVisitors(),
                fetchPanicLogs(0, 5, false), // Latest 5 active panics
                countPendingPayments(),
                fetchPendingReports(),
                fetchRecentActivityLogs(10),
            ]);

            setStats(statsData);
            setActivePanics(panicCount);
            setActiveGuests(guestCount);
            setRecentPanics(panicLogs);
            setPendingPayments(paymentCount);
            setPendingReports(reportCount);
            setActivityLogs(logsData);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
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

    const navigateToManageResidents = () => router.push('/admin/users');
    const navigateToPanicLogs = () => router.push('/admin/panic-logs' as any);
    const navigateToPaymentMethods = () => router.push('/admin/payment-methods' as any);
    const navigateToPaymentConfirmation = () => router.push('/admin/payment-confirmation' as any);

    const navigateToReports = () => router.push('/admin/reports' as any);

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
        pendingPayments, pendingReports, activityLogs,
        handleLogout, navigateToManageResidents, navigateToPanicLogs,
        navigateToPaymentMethods, navigateToPaymentConfirmation, navigateToReports,
        openPanicLocation, handleResolvePanic, formatTime,
        alertVisible, alertConfig, hideAlert, refresh: loadData,
    };
}
