import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import {
    AppNotification,
    fetchMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../../../services/notification';
import { Alert } from 'react-native';

export type NotificationFilter = 'Semua' | 'Hari Ini' | 'Belum Dibaca';

export const useNotificationViewModel = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Pagination & Filter State
    const [limit, setLimit] = useState(10);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [activeFilter, setActiveFilter] = useState<NotificationFilter>('Semua');

    const loadNotifications = async (currentLimit: number = limit, isInitial: boolean = false) => {
        if (isInitial) setIsLoading(true);
        else setIsLoadingMore(true);

        try {
            // Fetch (limit + 1) to determine if there is an extra page
            const fetchLimit = currentLimit + 1;
            const data = await fetchMyNotifications(fetchLimit);

            if (data.length > currentLimit) {
                setHasMoreData(true);
                setNotifications(data.slice(0, currentLimit));
            } else {
                setHasMoreData(false);
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            Alert.alert('Error', 'Gagal memuat notifikasi');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNotifications(limit, true);
        }, [])
    );

    const handleLoadMore = () => {
        if (hasMoreData && !isLoadingMore) {
            const newLimit = limit + 10;
            setLimit(newLimit);
            loadNotifications(newLimit, false);
        }
    };

    const handleShowLess = () => {
        setLimit(10);
        loadNotifications(10, true);
    };

    const handleRefresh = () => {
        setLimit(10);
        loadNotifications(10, true);
    };

    const filteredNotifications = useMemo(() => {
        let filtered = [...notifications];
        const today = new Date();

        switch (activeFilter) {
            case 'Hari Ini':
                filtered = filtered.filter(n => {
                    const date = new Date(n.created_at);
                    return date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear();
                });
                break;
            case 'Belum Dibaca':
                filtered = filtered.filter(n => !n.is_read);
                break;
            default:
                break;
        }
        return filtered;
    }, [notifications, activeFilter]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all read', error);
        }
    };

    const handleNotificationPress = (notification: AppNotification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }

        // Handle routing based on notification data payload
        // Example: router.push('/laporan/[id]') based on notification.data.url
    };

    return {
        notifications: filteredNotifications,
        isLoading,
        isLoadingMore,
        hasMoreData,
        limit,
        activeFilter,
        setActiveFilter,
        refresh: handleRefresh,
        handleLoadMore,
        handleShowLess,
        handleNotificationPress,
        handleMarkAllAsRead
    };
};
