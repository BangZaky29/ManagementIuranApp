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

export default function PanicLogScreen() {
    const { colors } = useTheme();
    const [logs, setLogs] = useState<PanicLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showResolved, setShowResolved] = useState(false);

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[]
    });
    const hideAlert = () => setAlertVisible(false);

    const loadLogs = useCallback(async () => {
        try {
            const data = await fetchPanicLogs(0, 50, showResolved);
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
        // Auto-refresh every 10 seconds for real-time-ish updates
        const interval = setInterval(loadLogs, 10000);
        return () => clearInterval(interval);
    }, [loadLogs]);

    const onRefresh = () => {
        setRefreshing(true);
        loadLogs();
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

    const openLocation = (location: string | null) => {
        if (!location) return;
        if (location.startsWith('http')) {
            Linking.openURL(location);
        }
    };

    const formatTime = (dateString: string) => {
        const d = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        return formatDateTimeSafe(d);
    };

    const renderItem = ({ item }: { item: PanicLog }) => {
        const isResolved = !!item.resolved_at;
        const hasLocation = item.location && item.location.startsWith('http');

        return (
            <View style={[
                styles.card,
                { backgroundColor: colors.backgroundCard, borderLeftColor: isResolved ? '#4CAF50' : '#F44336' }
            ]}>
                {/* Header: Avatar + Name + Time */}
                <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                        {item.profiles?.avatar_url ? (
                            <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: '#FFCDD2', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="person" size={18} color="#F44336" />
                            </View>
                        )}
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={[styles.userName, { color: colors.textPrimary }]}>
                                {item.profiles?.full_name || 'Warga Tidak Dikenal'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.timeContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: isResolved ? '#E8F5E9' : '#FFEBEE' }]}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: isResolved ? '#4CAF50' : '#F44336' }}>
                                {isResolved ? 'SELESAI' : 'AKTIF'}
                            </Text>
                        </View>
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                            {formatTime(item.created_at)}
                        </Text>
                    </View>
                </View>

                {/* Location */}
                <TouchableOpacity
                    style={[styles.locationRow, { backgroundColor: hasLocation ? '#E3F2FD' : '#F5F5F5' }]}
                    onPress={() => openLocation(item.location)}
                    disabled={!hasLocation}
                >
                    <Ionicons
                        name={hasLocation ? 'location' : 'location-outline'}
                        size={16}
                        color={hasLocation ? '#1976D2' : '#999'}
                    />
                    <Text style={[styles.locationText, { color: hasLocation ? '#1976D2' : '#999' }]} numberOfLines={1}>
                        {hasLocation ? 'Buka di Google Maps' : (item.location || 'Lokasi tidak tersedia')}
                    </Text>
                    {hasLocation && <Ionicons name="open-outline" size={14} color="#1976D2" />}
                </TouchableOpacity>

                {/* Action Button */}
                {!isResolved && (
                    <TouchableOpacity
                        style={styles.resolveButton}
                        onPress={() => handleResolve(item)}
                    >
                        <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                        <Text style={styles.resolveText}>Tandai Selesai</Text>
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.backgroundCard }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>🚨 Log Darurat</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        {logs.length} sinyal {showResolved ? '(semua)' : 'aktif'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: showResolved ? '#E8F5E9' : '#FFEBEE' }]}
                    onPress={() => setShowResolved(!showResolved)}
                >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: showResolved ? '#4CAF50' : '#F44336' }}>
                        {showResolved ? 'Semua' : 'Aktif Saja'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={logs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F44336']} />}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingTop: 60 }}>
                        <Ionicons name="shield-checkmark" size={64} color="#4CAF50" />
                        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: 16 }}>
                            Tidak Ada Darurat Aktif
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                            Lingkungan aman — tarik ke bawah untuk refresh
                        </Text>
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
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16, paddingTop: Platform.OS === 'android' ? 48 : 16,
        borderBottomWidth: 1, borderBottomColor: '#EEE',
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    filterButton: {
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    card: {
        borderRadius: 16, padding: 16, marginBottom: 12,
        borderLeftWidth: 4,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
            android: { elevation: 3 },
        }),
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 42, height: 42, borderRadius: 21 },
    userName: { fontSize: 15, fontWeight: '700' },
    userPhone: { fontSize: 12, marginTop: 2 },
    timeContainer: { alignItems: 'flex-end' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 4 },
    timeText: { fontSize: 11 },
    locationRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        padding: 10, borderRadius: 10, marginTop: 12,
    },
    locationText: { flex: 1, fontSize: 13, fontWeight: '500' },
    resolveButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: '#4CAF50', paddingVertical: 10, borderRadius: 10, marginTop: 12,
    },
    resolveText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
