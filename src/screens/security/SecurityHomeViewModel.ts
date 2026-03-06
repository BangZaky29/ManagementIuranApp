import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Linking, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPanicLogs, resolvePanicLog, countActivePanics, PanicLog } from '../../services/panic';
import { countActiveVisitors, countPendingVisitors } from '../../services/guest';
import { getDashboardStats } from '../../services/admin';
import { fetchRecentActivityLogs, ActivityLog } from '../../services/activityLog';
import { fetchAllReports, Report } from '../../services/laporan';
import { countUnreadMessages } from '../../services/chat/chatService';
import { formatDateSafe } from '../../utils/dateUtils';
import { supabase } from '../../lib/supabaseConfig';

export function useSecurityHomeViewModel() {
    const { signOut, user } = useAuth();
    const router = useRouter();

    // Dashboard stats
    const [stats, setStats] = useState({ warga: 0, wargaActive: 0, wargaInactive: 0, security: 0, activeUsers: 0 });
    const [activePanics, setActivePanics] = useState(0);
    const [activeGuests, setActiveGuests] = useState(0);
    const [recentPanics, setRecentPanics] = useState<PanicLog[]>([]);
    const [recentReports, setRecentReports] = useState<Report[]>([]);
    const [pendingReportsCount, setPendingReportsCount] = useState(0);
    const [processingReportsCount, setProcessingReportsCount] = useState(0);
    const [pendingGuestsCount, setPendingGuestsCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [securityProfile, setSecurityProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[]
    });
    const hideAlert = () => setAlertVisible(false);

    const loadData = useCallback(async () => {
        try {
            const [statsData, panicCount, guestCount, pendingGuestCount, panicLogs, logsData, reportCount, procCount] = await Promise.all([
                getDashboardStats(),
                countActivePanics(),
                countActiveVisitors(),
                countPendingVisitors(),
                fetchPanicLogs(0, 5, false), // Latest 5 active panics
                fetchAllReports(0, 3), // Latest 3 reports
                supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'Menunggu'),
                supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'Diproses')
            ]);
            let profileData = null;
            if (user?.id) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                profileData = data;
            }

            setStats(statsData);
            setActivePanics(panicCount);
            setActiveGuests(guestCount);
            setPendingGuestsCount(pendingGuestCount);
            setRecentPanics(panicLogs);
            setRecentReports(logsData as any);
            setPendingReportsCount(reportCount.count || 0);
            setProcessingReportsCount(procCount.count || 0);
            setSecurityProfile(profileData);

            if (user?.id) {
                const chatCount = await countUnreadMessages(user.id);
                setUnreadChatCount(chatCount);
            }
        } catch (error) {
            console.error('Failed to load security dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadData();
        // Auto-refresh every 15 seconds (Fallback)
        const interval = setInterval(loadData, 15000);

        // 🟢 REALTIME SUBSCRIPTION FOR PANIC LOGS
        const panicSubscription = supabase
            .channel('public:panic_logs')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'panic_logs' },
                (payload) => {
                    console.log('Realtime Panic Alert!', payload);
                    // Refresh data immediately when a new SOS comes in
                    loadData();
                }
            )
            .subscribe((status) => {
                console.log('Supabase Realtime Status (Panic logs):', status);
            });

        // 🟢 REALTIME SUBSCRIPTION FOR CHAT MESSAGES
        const chatSubscription = supabase
            .channel(`public:chat_messages:security_${user?.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages'
                },
                (payload) => {
                    if (user?.id && payload.new && payload.new.sender_id !== user.id) {
                        console.log('Realtime Chat Received (Security)!', payload);
                        setUnreadChatCount((prev) => prev + 1);
                    }
                }
            )
            .subscribe();

        return () => {
            clearInterval(interval);
            supabase.removeChannel(panicSubscription);
            supabase.removeChannel(chatSubscription);
        };
    }, [loadData, user?.id]);


    const handleLogout = async () => {
        await signOut();
        router.replace('/login');
    };

    const navigateToPanicLogs = () => router.push('/security/panic-logs' as any);
    const navigateToGuestBook = () => router.push('/security/guests' as any);
    const navigateToReports = () => router.push('/security/reports' as any);
    const navigateToProfile = () => router.navigate('/security/profile' as any);

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
        return formatDateSafe(d);
    };

    return {
        user, stats, activePanics, activeGuests, pendingGuestsCount, recentPanics, isLoading, securityProfile,
        recentReports, pendingReportsCount, processingReportsCount, unreadChatCount,
        handleLogout, navigateToPanicLogs, navigateToGuestBook, navigateToProfile, navigateToReports,
        openPanicLocation, handleResolvePanic, formatTime,
        alertVisible, alertConfig, hideAlert, refresh: loadData,
    };
}
