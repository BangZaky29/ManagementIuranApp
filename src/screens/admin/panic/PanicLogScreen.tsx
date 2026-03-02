import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, SafeAreaView,
    StatusBar, StyleSheet, ActivityIndicator, Image, Linking, Platform, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { formatDateTimeSafe } from '../../../utils/dateUtils';
import { fetchPanicLogs, PanicLog, resolvePanicLog } from '../../../services/panicService';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { PanicLogCard } from '../../../components/PanicLogCard';

export default function PanicLogScreen() {
    const { colors } = useTheme();
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
                        <Ionicons name="chevron-down" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.seeLessButton}
                        onPress={handleSeeLess}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.seeLessText}>Lihat lebih sedikit</Text>
                        <Ionicons name="chevron-up" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#F44336" />
                </View>
            </SafeAreaView>
        );
    }

    const displayedLogs = logs.slice(0, visibleCount);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F8F9FA' }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>🚨 Log Darurat</Text>
                    <View style={styles.headerSubtitleRow}>
                        <View style={[styles.indicator, { backgroundColor: showResolved ? '#4CAF50' : '#F44336' }]} />
                        <Text style={styles.headerSubtitle}>
                            {logs.length} Sinyal {showResolved ? 'Selesai' : 'Aktif'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: showResolved ? '#E8F5E9' : '#FFEBEE' }]}
                    onPress={() => {
                        setShowResolved(!showResolved);
                        setVisibleCount(5); // Reset count when filter changes
                    }}
                >
                    <Ionicons
                        name={showResolved ? "checkmark-circle" : "alert-circle"}
                        size={16}
                        color={showResolved ? '#4CAF50' : '#F44336'}
                        style={{ marginRight: 6 }}
                    />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: showResolved ? '#4CAF50' : '#F44336' }}>
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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F44336']} />}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="shield-checkmark" size={64} color="#4CAF50" />
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

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingTop: Platform.OS === 'android' ? 48 : 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1A1A1A',
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
        color: '#666',
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
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
        gap: 8,
        elevation: 2,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    seeMoreText: {
        color: Colors.primary,
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
        color: Colors.textSecondary,
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
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    emptyDesc: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    refreshButton: {
        marginTop: 32,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    refreshButtonText: {
        color: '#666',
        fontWeight: '700',
        fontSize: 14,
    },
});
