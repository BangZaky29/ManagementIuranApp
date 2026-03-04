import { useTheme } from '../../../contexts/ThemeContext';
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StatusBar, StyleSheet, ActivityIndicator, Image, RefreshControl, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../theme/AppTheme';
import { formatDateTimeSafe } from '../../../utils/dateUtils';
import { fetchRecentActivityLogs, ActivityLog } from '../../../services/activityLog';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { useRouter, useFocusEffect } from 'expo-router';

export default function ActivityLogScreen() {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
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

    const getIconConfig = (actionType: string) => {
        switch (actionType) {
            case 'payment':
                return { name: 'wallet', color: colors.success, bg: colors.successBg };
            case 'report':
                return { name: 'chatbubble-ellipses', color: colors.info, bg: colors.infoBg };
            case 'panic':
                return { name: 'alert-circle', color: colors.danger, bg: colors.dangerBg };
            case 'visitor':
                return { name: 'id-card', color: colors.warning, bg: colors.warningBg };
            default:
                return { name: 'ellipse', color: colors.textSecondary, bg: colors.surfaceSubtle };
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return { bg: colors.status.admin.bg, text: colors.status.admin.text };
            case 'security':
                return { bg: colors.status.security.bg, text: colors.status.security.text };
            default:
                return { bg: colors.status.warga.bg, text: colors.status.warga.text };
        }
    };

    const renderItem = ({ item }: { item: ActivityLog }) => {
        const icon = getIconConfig(item.action_type);

        return (
            <View style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
                    <Ionicons name={icon.name as any} size={22} color={icon.color} />
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
                                <Ionicons name="person-circle-outline" size={14} color={colors.textSecondary} />
                            )}
                            <Text style={styles.userName}>{item.profiles.full_name}</Text>

                            {/* Role Badge */}
                            {item.profiles.role && (() => {
                                const badge = getRoleBadge(item.profiles.role);
                                return (
                                    <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                                        <Text style={[styles.roleBadgeText, { color: badge.text }]}>
                                            {item.profiles.role.toUpperCase()}
                                        </Text>
                                    </View>
                                );
                            })()}
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
                    <ActivityIndicator size="small" color={colors.primary} />
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
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle={colors.statusBar} />
            <CustomHeader title="Riwayat Aktivitas" showBack={true} />

            <View style={styles.filterBar}>
                <View style={styles.filterChipActive}>
                    <Ionicons name="time-outline" size={16} color={colors.textWhite} />
                    <Text style={styles.filterChipTextActive}>Terbaru</Text>
                </View>
                <Text style={styles.totalLabel}>
                    Total: {activities.length} Aktivitas
                </Text>
            </View>

            <FlatList
                data={activities}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListFooterComponent={FooterComponent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color={colors.border} />
                        <Text style={styles.emptyText}>Belum ada riwayat aktivitas.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 40 },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        flexDirection: 'row',
        gap: 12,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
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
    cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, flex: 1 },
    timeText: { fontSize: 11, color: colors.textSecondary },
    descriptionText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    userName: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
    avatarMini: { width: 14, height: 14, borderRadius: 7, marginRight: 2 },
    roleBadge: {
        marginLeft: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    roleBadgeText: { fontSize: 9, fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: colors.textSecondary, fontWeight: '500' },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterChipActive: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    filterChipTextActive: {
        color: colors.textWhite,
        fontSize: 11,
        fontWeight: '700',
    },
    totalLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginLeft: 8,
    },
    loadMoreButton: {
        backgroundColor: colors.primarySubtle,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    loadMoreText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    footerText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: 12,
        paddingVertical: 20,
    },
});
