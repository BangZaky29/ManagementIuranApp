import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { useNotificationViewModel } from './NotificationViewModel';
import { createStyles } from './NotificationStyles';
import { useTheme } from '../../../contexts/ThemeContext';

export default function NotificationScreen() {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

    const {
        notifications,
        isLoading,
        isLoadingMore,
        hasMoreData,
        limit,
        activeFilter,
        setActiveFilter,
        refresh,
        handleLoadMore,
        handleShowLess,
        handleNotificationPress,
        handleMarkAllAsRead
    } = useNotificationViewModel();

    const filters: import('./NotificationViewModel').NotificationFilter[] = ['Semua', 'Hari Ini', 'Belum Dibaca'];

    const getIconInfo = (data: any) => {
        // Customize icon based on notification type in payload
        const type = data?.type || 'general';
        switch (type) {
            case 'payment':
                return { name: 'receipt-outline', bgColor: colors.successBg, color: colors.success };
            case 'report':
                return { name: 'alert-circle-outline', bgColor: colors.warningBg, color: colors.warning };
            case 'sos':
                return { name: 'warning-outline', bgColor: colors.dangerBg, color: colors.danger };
            default:
                return { name: 'notifications-outline', bgColor: colors.infoBg, color: colors.primary };
        }
    };

    const HeaderRight = () => (
        <TouchableOpacity style={styles.headerRight} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Baca Semua</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
            <CustomHeader
                title="Notifikasi"
                showBack={true}
            />

            {isLoading && limit === 10 ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {/* Filter Tabs */}
                    <View style={styles.filterContainer}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={filters}
                            keyExtractor={(item) => item}
                            contentContainerStyle={styles.filterContent}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.filterChip,
                                        activeFilter === item && styles.filterChipActive
                                    ]}
                                    onPress={() => setActiveFilter(item)}
                                >
                                    <Text style={[
                                        styles.filterText,
                                        activeFilter === item && styles.filterTextActive
                                    ]}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={refresh} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="notifications-off-outline" size={60} color={colors.textSecondary} />
                                <Text style={styles.emptyTitle}>Belum ada notifikasi</Text>
                                <Text style={styles.emptyDesc}>Pemberitahuan terkait iuran atau laporan akan muncul di sini.</Text>
                            </View>
                        }
                        renderItem={({ item }) => {
                            const iconInfo = getIconInfo(item.data);
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.notificationCard,
                                        { borderLeftColor: item.is_read ? 'transparent' : colors.primary }
                                    ]}
                                    onPress={() => handleNotificationPress(item)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: iconInfo.bgColor }]}>
                                        <Ionicons name={iconInfo.name as any} size={20} color={iconInfo.color} />
                                    </View>

                                    <View style={styles.contentContainer}>
                                        <View style={styles.titleRow}>
                                            <Text style={[
                                                styles.title,
                                                !item.is_read && { color: colors.textPrimary }
                                            ]} numberOfLines={1}>
                                                {item.title}
                                            </Text>
                                            <Text style={styles.dateText}>
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <Text style={[styles.bodyText, !item.is_read && { fontWeight: '500', color: colors.textPrimary }]} numberOfLines={2}>
                                            {item.body}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                        ListFooterComponent={
                            notifications.length > 0 ? (
                                <View style={styles.footerContainer}>
                                    {hasMoreData ? (
                                        <TouchableOpacity
                                            style={styles.loadMoreButton}
                                            onPress={handleLoadMore}
                                            disabled={isLoadingMore}
                                        >
                                            {isLoadingMore ? (
                                                <ActivityIndicator size="small" color={colors.primary} />
                                            ) : (
                                                <Text style={styles.loadMoreText}>Lihat Lebih Banyak</Text>
                                            )}
                                        </TouchableOpacity>
                                    ) : (
                                        notifications.length > 10 ? (
                                            <TouchableOpacity style={styles.showLessButton} onPress={handleShowLess}>
                                                <Text style={styles.showLessText}>Lihat Lebih Sedikit</Text>
                                            </TouchableOpacity>
                                        ) : null
                                    )}
                                </View>
                            ) : null
                        }
                    />
                </View>
            )}
        </SafeAreaView>
    );
}
