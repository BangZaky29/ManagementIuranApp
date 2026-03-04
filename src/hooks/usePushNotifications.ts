import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { savePushToken, removePushToken } from '../services/notification';
import { soundSettingsService } from '../services/notification';

// Konfigurasi perilaku notifikasi saat aplikasi di foreground
Notifications.setNotificationHandler({
    handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const usePushNotifications = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);

    useEffect(() => {
        if (!user) return;

        registerForPushNotificationsAsync(user).then((token) => {
            if (token && !token.startsWith('Error')) {
                setExpoPushToken(token);
                savePushToken(user.id, token);
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            console.log('User menekan notifikasi dengan data:', data);

            if (data?.url) {
                router.push(data.url as any);
            } else if (data?.route) {
                router.push(data.route as any);
            }
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [user]);

    const unregisterToken = async () => {
        if (user && expoPushToken) {
            await removePushToken(user.id, expoPushToken);
            setExpoPushToken('');
        }
    };

    return {
        expoPushToken,
        notification,
        unregisterToken
    };
};

async function registerForPushNotificationsAsync(user: any) {
    let token;

    if (Platform.OS === 'android') {
        const soundSettings = await soundSettingsService.getSettings(user?.id || '');

        const notifSound = soundSettings?.notif_sound || 'notification_alert.wav';
        const alertSound = soundSettings?.alert_sound || 'alarm-sound-effect.wav';
        const vibrationEnabled = soundSettings?.vibration_enabled ?? true;

        const notifChannelId = `default_${notifSound.split('.')[0]}`;
        const sosChannelId = `sos_${alertSound.split('.')[0]}`;

        await Notifications.setNotificationChannelAsync(notifChannelId, {
            name: 'Warga Lokal (Pesan)',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: vibrationEnabled ? [0, 250, 250, 250] : undefined,
            lightColor: '#1B5E20',
            sound: notifSound === 'default' ? undefined : notifSound,
        });

        await Notifications.setNotificationChannelAsync(sosChannelId, {
            name: 'Warga Lokal (Darurat)',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: vibrationEnabled ? [0, 500, 200, 500, 200, 500] : undefined,
            lightColor: '#D32F2F',
            sound: alertSound === 'default' ? undefined : alertSound,
        });

        await Notifications.setNotificationChannelAsync('default', {
            name: 'Warga Lokal',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Izin notifikasi ditolak oleh user.');
            return;
        }

        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;

            if (!projectId) {
                throw new Error('Project ID tidak ditemukan di app.json');
            }

            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            console.log('Generated Token:', token);
        } catch (e) {
            token = `Error: ${e}`;
            console.error('Gagal mengambil push token:', e);
        }
    } else {
        console.log('Push Notif hanya bisa dijalankan di perangkat fisik.');
    }

    return token;
}