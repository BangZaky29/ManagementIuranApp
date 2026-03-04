import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StatusBar, StyleSheet, ActivityIndicator, Image, Linking, Platform, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../theme/AppTheme';
import { Colors } from '../../../constants/Colors';
import { formatDateTimeSafe } from '../../../utils/dateUtils';
import { fetchPanicLogs, PanicLog, resolvePanicLog } from '../../../services/panic';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { useTheme, useSecurityTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { PanicLogCard } from '../../../components/panic/PanicLogCard';

export default function PanicLogScreen() {
    const { colors: globalColors } = useTheme();
    const { colors: securityColors } = useSecurityTheme();
    const { profile } = useAuth();

    // Choose theme based on role
    const colors = profile?.role === 'security' ? securityColors : globalColors;

    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const [logs, setLogs] = useState<PanicLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showResolved, setShowResolved] = useState(false);

    // Pagination state
    const [visibleCount, setVisibleCount] = useState(5);

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[]
    });
    const hideAlert = () => setAlertVisible(false);

    const loadLogs = useCallback(async () => {
        try {
            // Fetch more to support pagination locally without frequent DB hits
            const data = await fetchPanicLogs(0, 100, showResolved);
            setLogs(data);
        } catch (error) {
            console.error('Failed to load panic logs:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [showResolved]);

    useEffect(() => {
        loadLogs();
        const interval = setInterval(loadLogs, 10000);
        return () => clearInterval(interval);
    }, [loadLogs]);

    const onRefresh = () => {
        setRefreshing(true);
        setVisibleCount(5); // Reset pagination on refresh
        loadLogs();
    };

    const handleSeeMore = () => {
        setVisibleCount(prev => prev + 5);
    };

    const handleSeeLess = () => {
        setVisibleCount(5);
    };

    const handleResolve = (log: PanicLog) => {
        setAlertConfig({
            title: 'Tandai Selesai?',
            message: `Apakah situasi darurat dari ${log.profiles?.full_name || 'Warga'} sudah ditangani?`,
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Selesai', style: 'destructive', onPress: async () => {
                        hideAlert();
                        try {
                            await resolvePanicLog(log.id);
                            loadLogs();
                        } catch (error) {
                            setAlertConfig({
                                title: 'Gagal', message: 'Gagal menandai sebagai selesai.',
                                type: 'error', buttons: [{ text: 'OK', onPress: hideAlert }]
                            });
                            setAlertVisible(true);
                        }
                    }
                }
            ]
        });
        setAlertVisible(true);
    };

    const renderItem = ({ item }: { item: PanicLog }) => {
        return (
            <PanicLogCard
                log={item}
                onResolve={handleResolve}
                showResolveButton={!item.resolved_at}
            />
        );
    };

    const renderFooter = () => {
        if (logs.length <= 5) return null;

        const hasMore = visibleCount < logs.length;

        return (
            <View style={styles.footerContainer}>
                {hasMore ? (
                    <TouchableOpacity
                        style={styles.seeMoreButton}
                        onPress={handleSeeMore}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.seeMoreText}>Lihat lebih banyak ({logs.length - visibleCount} lagi)</Text>
                        <Ionicons name="chevron-down" size={18} color={colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.seeLessButton}
                        onPress={handleSeeLess}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.seeLessText}>Lihat lebih sedikit</Text>
                        <Ionicons name="chevron-up" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.status.ditolak.text} />
                </View>
            </SafeAreaView>
        );
    }

    const displayedLogs = logs.slice(0, visibleCount);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.statusBar} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>🚨 Log Darurat</Text>
                    <View style={styles.headerSubtitleRow}>
                        <View style={[styles.indicator, { backgroundColor: showResolved ? colors.status.selesai.text : colors.status.ditolak.text }]} />
                        <Text style={styles.headerSubtitle}>
                            {logs.length} Sinyal {showResolved ? 'Selesai' : 'Aktif'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: showResolved ? colors.status.selesai.bg : colors.status.ditolak.bg }]}
                    onPress={() => {
                        setShowResolved(!showResolved);
                        setVisibleCount(5); // Reset count when filter changes
                    }}
                >
                    <Ionicons
                        name={showResolved ? "checkmark-circle" : "alert-circle"}
                        size={16}
                        color={showResolved ? colors.status.selesai.text : colors.status.ditolak.text}
                        style={{ marginRight: 6 }}
                    />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: showResolved ? colors.status.selesai.text : colors.status.ditolak.text }}>
                        {showResolved ? 'Riwayat' : 'Aktif'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={displayedLogs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.status.ditolak.text]} />}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconCircle, { backgroundColor: colors.status.selesai.bg }]}>
                            <Ionicons name="shield-checkmark" size={64} color={colors.status.selesai.text} />
                        </View>
                        <Text style={styles.emptyTitle}>
                            {showResolved ? 'Belum Ada Riwayat' : 'Lingkungan Aman'}
                        </Text>
                        <Text style={styles.emptyDesc}>
                            {showResolved
                                ? 'Data darurat yang telah diselesaikan akan muncul di sini.'
                                : 'Tidak ada sinyal darurat aktif saat ini. Tetap waspada!'}
                        </Text>
                        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                            <Text style={styles.refreshButtonText}>Refresh Data</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <CustomAlertModal
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
            />
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingTop: Platform.OS === 'android' ? 48 : 20,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    headerSubtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    headerSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    footerContainer: {
        marginTop: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    seeMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primary,
        gap: 8,
        elevation: 2,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    seeMoreText: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    seeLessButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    seeLessText: {
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.status.selesai.bg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    emptyDesc: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    refreshButton: {
        marginTop: 32,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    refreshButtonText: {
        color: colors.textSecondary,
        fontWeight: '700',
        fontSize: 14,
    },
});
