import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomHeader } from '../../../components/CustomHeader';
import { useNotificationViewModel } from './NotificationViewModel';
import { styles } from './NotificationStyles';
import { Colors } from '../../../constants/Colors';

export default function NotificationScreen() {
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
                return { name: 'receipt-outline', bgColor: '#E8F5E9', color: Colors.success };
            case 'report':
                return { name: 'alert-circle-outline', bgColor: '#FFF3E0', color: Colors.warning };
            case 'sos':
                return { name: 'warning-outline', bgColor: '#FFEBEE', color: Colors.danger };
            default:
                return { name: 'notifications-outline', bgColor: '#E3F2FD', color: Colors.primary };
        }
    };

    const HeaderRight = () => (
        <TouchableOpacity style={styles.headerRight} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Baca Semua</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <CustomHeader
                title="Notifikasi"
                showBack={true}
            />
            {/* Implement your own HeaderRight if CustomHeader supports it, otherwise place below header */}

            {isLoading && limit === 10 ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
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
                                <Ionicons name="notifications-off-outline" size={60} color={Colors.textSecondary} />
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
                                        { borderLeftColor: item.is_read ? 'transparent' : Colors.primary }
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
                                                !item.is_read && { color: Colors.textPrimary }
                                            ]} numberOfLines={1}>
                                                {item.title}
                                            </Text>
                                            <Text style={styles.dateText}>
                                                {new Date(item.created_at).toLocaleDateString()}
                                                {/* Prefer formatTimeAgo like "2 jam lalu" */}
                                            </Text>
                                        </View>
                                        <Text style={[styles.bodyText, !item.is_read && { fontWeight: '500', color: '#444' }]} numberOfLines={2}>
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
                                                <ActivityIndicator size="small" color={Colors.primary} />
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
