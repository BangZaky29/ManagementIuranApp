import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
    AppNotification,
    fetchMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../../../services/notificationService';
import { Alert } from 'react-native';

export const useNotificationViewModel = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await fetchMyNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            Alert.alert('Error', 'Gagal memuat notifikasi');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

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
        notifications,
        isLoading,
        refresh: loadNotifications,
        handleNotificationPress,
        handleMarkAllAsRead
    };
};
