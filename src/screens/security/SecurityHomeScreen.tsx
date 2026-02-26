import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, SafeAreaView,
    StatusBar, StyleSheet, ActivityIndicator, Image, Linking, Platform, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { fetchPanicLogs, resolvePanicLog, PanicLog } from '../../services/panicService';
import { CustomAlertModal } from '../../components/CustomAlertModal';

export default function SecurityHomeScreen() {
    const { signOut, user } = useAuth();
    const router = useRouter();
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
        const interval = setInterval(loadLogs, 10000);
        return () => clearInterval(interval);
    }, [loadLogs]);

    const onRefresh = () => { setRefreshing(true); loadLogs(); };

    const handleLogout = async () => {
        await signOut();
        router.replace('/login');
    };

    const handleResolve = (log: PanicLog) => {
        setAlertConfig({
            title: 'Tandai Selesai?',
            message: `Situasi darurat dari ${log.profiles?.full_name || 'Warga'} sudah ditangani?`,
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Selesai', style: 'destructive', onPress: async () => {
                        hideAlert();
                        try {
                            await resolvePanicLog(log.id);
                            loadLogs();
                        } catch {
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
        if (location && location.startsWith('http')) Linking.openURL(location);
    };

    const formatTime = (dateString: string) => {
        const d = new Date(dateString);
        const diff = Date.now() - d.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderItem = ({ item }: { item: PanicLog }) => {
        const isResolved = !!item.resolved_at;
        const hasLocation = item.location?.startsWith('http');

        return (
            <View style={[styles.card, { borderLeftColor: isResolved ? '#4CAF50' : '#F44336' }]}>
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
                            <Text style={styles.userName}>{item.profiles?.full_name || 'Warga'}</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <View style={[styles.statusBadge, { backgroundColor: isResolved ? '#E8F5E9' : '#FFEBEE' }]}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: isResolved ? '#4CAF50' : '#F44336' }}>
                                {isResolved ? 'SELESAI' : 'AKTIF'}
                            </Text>
                        </View>
                        <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.locationRow, { backgroundColor: hasLocation ? '#E3F2FD' : '#F5F5F5' }]}
                    onPress={() => openLocation(item.location)}
                    disabled={!hasLocation}
                >
                    <Ionicons name={hasLocation ? 'location' : 'location-outline'} size={16} color={hasLocation ? '#1976D2' : '#999'} />
                    <Text style={[styles.locationText, { color: hasLocation ? '#1976D2' : '#999' }]} numberOfLines={1}>
                        {hasLocation ? 'Buka di Google Maps' : (item.location || 'Lokasi tidak tersedia')}
                    </Text>
                    {hasLocation && <Ionicons name="open-outline" size={14} color="#1976D2" />}
                </TouchableOpacity>

                {!isResolved && (
                    <TouchableOpacity style={styles.resolveButton} onPress={() => handleResolve(item)}>
                        <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                        <Text style={styles.resolveText}>Tandai Selesai</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0D47A1" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>🛡️ Security Dashboard</Text>
                    <Text style={styles.headerSubtitle}>
                        {user?.user_metadata?.full_name || 'Petugas'} • {logs.filter(l => !l.resolved_at).length} darurat aktif
                    </Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#C62828" />
                </TouchableOpacity>
            </View>

            {/* Filter */}
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterButton, !showResolved && styles.filterActive]}
                    onPress={() => setShowResolved(false)}
                >
                    <Ionicons name="alert-circle" size={14} color={!showResolved ? '#FFF' : '#F44336'} />
                    <Text style={[styles.filterText, !showResolved && { color: '#FFF' }]}>Aktif</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, showResolved && styles.filterActiveGreen]}
                    onPress={() => setShowResolved(true)}
                >
                    <Ionicons name="list" size={14} color={showResolved ? '#FFF' : '#666'} />
                    <Text style={[styles.filterText, showResolved && { color: '#FFF' }]}>Semua</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={logs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0D47A1']} />}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingTop: 60 }}>
                        <Ionicons name="shield-checkmark" size={64} color="#4CAF50" />
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginTop: 16 }}>Aman — Tidak Ada Darurat</Text>
                        <Text style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Tarik ke bawah untuk refresh</Text>
                    </View>
                }
            />

            <CustomAlertModal visible={alertVisible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} buttons={alertConfig.buttons} onClose={hideAlert} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E3F2FD' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16,
        paddingTop: Platform.OS === 'android' ? 48 : 16,
        backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#0D47A1' },
    headerSubtitle: { fontSize: 12, color: '#1565C0', marginTop: 2 },
    logoutBtn: { padding: 8, backgroundColor: '#FFEBEE', borderRadius: 10 },
    filterRow: {
        flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#FFF',
    },
    filterButton: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    filterActive: { backgroundColor: '#F44336' },
    filterActiveGreen: { backgroundColor: '#4CAF50' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
    card: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
        borderLeftWidth: 4,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
            android: { elevation: 3 },
        }),
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 42, height: 42, borderRadius: 21 },
    userName: { fontSize: 15, fontWeight: '700', color: '#333' },
    userPhone: { fontSize: 12, marginTop: 2, color: '#666' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 4 },
    timeText: { fontSize: 11, color: '#999' },
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
