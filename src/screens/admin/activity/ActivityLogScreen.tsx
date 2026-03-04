import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StatusBar, StyleSheet, ActivityIndicator, Image, RefreshControl, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { formatDateTimeSafe } from '../../../utils/dateUtils';
import { fetchRecentActivityLogs, ActivityLog } from '../../../services/activityLog';
import { CustomHeader } from '../../../components/CustomHeader';
import { useRouter, useFocusEffect } from 'expo-router';

export default function ActivityLogScreen() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

    const PAGE_SIZE = 10;

    const loadData = useCallback(async (isRefreshing = false) => {
        try {
            if (isRefreshing) setRefreshing(true);
            else setIsLoading(true);

            const data = await fetchRecentActivityLogs(PAGE_SIZE, 0);

            // If we want oldest first, we could re-sort here or change service
            // But the requirement says "always show latest on top"
            setActivities(data);
            setHasMore(data.length === PAGE_SIZE);
        } catch (error) {
            console.error('Failed to load activity logs:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    const loadMore = async () => {
        if (isLoadingMore || !hasMore) return;

        try {
            setIsLoadingMore(true);
            const nextData = await fetchRecentActivityLogs(PAGE_SIZE, activities.length);

            if (nextData.length === 0) {
                setHasMore(false);
            } else {
                setActivities(prev => [...prev, ...nextData]);
                setHasMore(nextData.length === PAGE_SIZE);
            }
        } catch (error) {
            console.error('Failed to load more logs:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const onRefresh = () => {
        loadData(true);
    };

    const renderItem = ({ item }: { item: ActivityLog }) => {
        let iconName: any = 'ellipse';
        let iconColor = '#999';
        let bgColor = '#F5F5F5';

        if (item.action_type === 'payment') {
            iconName = 'wallet'; iconColor = '#4CAF50'; bgColor = '#E8F5E9';
        } else if (item.action_type === 'report') {
            iconName = 'chatbubble-ellipses'; iconColor = '#2196F3'; bgColor = '#E3F2FD';
        } else if (item.action_type === 'panic') {
            iconName = 'alert-circle'; iconColor = '#F44336'; bgColor = '#FFEBEE';
        } else if (item.action_type === 'visitor') {
            iconName = 'id-card'; iconColor = '#FF9800'; bgColor = '#FFF3E0';
        }

        return (
            <View style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                    <Ionicons name={iconName} size={22} color={iconColor} />
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.action_title}</Text>
                        <Text style={styles.timeText}>{formatDateTimeSafe(item.created_at)}</Text>
                    </View>
                    <Text style={styles.descriptionText}>{item.description}</Text>
                    {item.profiles && (
                        <View style={styles.userRow}>
                            {item.profiles.avatar_url ? (
                                <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatarMini} />
                            ) : (
                                <Ionicons name="person-circle-outline" size={14} color="#666" />
                            )}
                            <Text style={styles.userName}>{item.profiles.full_name}</Text>

                            {/* Role Badge */}
                            {item.profiles.role && (
                                <View style={[
                                    {
                                        marginLeft: 6,
                                        paddingHorizontal: 6,
                                        paddingVertical: 2,
                                        borderRadius: 4,
                                    },
                                    item.profiles.role === 'admin' ? { backgroundColor: '#E3F2FD' } :
                                        item.profiles.role === 'security' ? { backgroundColor: '#FFF3E0' } :
                                            { backgroundColor: '#E8F5E9' } // warga
                                ]}>
                                    <Text style={[
                                        { fontSize: 9, fontWeight: 'bold' },
                                        item.profiles.role === 'admin' ? { color: '#1565C0' } :
                                            item.profiles.role === 'security' ? { color: '#E65100' } :
                                                { color: '#2E7D32' } // warga
                                    ]}>
                                        {item.profiles.role.toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const FooterComponent = () => {
        if (!hasMore) {
            if (activities.length > 0) {
                return <Text style={styles.footerText}>Semua riwayat telah ditampilkan</Text>;
            }
            return null;
        }

        return (
            <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMore}
                disabled={isLoadingMore}
            >
                {isLoadingMore ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                    <Text style={styles.loadMoreText}>Lihat Lebih Banyak</Text>
                )}
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
                <CustomHeader title="Riwayat Aktivitas" showBack={true} />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <CustomHeader title="Riwayat Aktivitas" showBack={true} />

            <View style={styles.filterBar}>
                <View style={styles.filterChipActive}>
                    <Ionicons name="time-outline" size={16} color="#FFF" />
                    <Text style={styles.filterChipTextActive}>Terbaru</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                    Total: {activities.length} Aktivitas
                </Text>
            </View>

            <FlatList
                data={activities}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
                ListFooterComponent={FooterComponent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>Belum ada riwayat aktivitas.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        flexDirection: 'row',
        gap: 12,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
    timeText: { fontSize: 11, color: '#999' },
    descriptionText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    userName: { fontSize: 12, color: '#666', fontWeight: '500' },
    avatarMini: { width: 14, height: 14, borderRadius: 7, marginRight: 2 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#999', fontWeight: '500' },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    filterChipActive: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    filterChipTextActive: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    loadMoreButton: {
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    loadMoreText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '700',
    },
    footerText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        paddingVertical: 20,
    },
});
