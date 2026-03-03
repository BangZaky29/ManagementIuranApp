import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { savePushToken, removePushToken } from '../services/notificationService';

// Konfigurasi perilaku notifikasi saat aplikasi di foreground
Notifications.setNotificationHandler({
    handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
        // shouldShowAlert sudah dihapus karena deprecated
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true, // Muncul melayang di atas saat app terbuka
        shouldShowList: true,   // Tersimpan di pusat notifikasi (tray)
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
        // Hanya jalankan registrasi jika user sudah login
        if (!user) return;

        registerForPushNotificationsAsync().then((token) => {
            if (token && !token.startsWith('Error')) {
                setExpoPushToken(token);
                // Simpan token ke database dengan logika UPSERT (dari service)
                savePushToken(user.id, token);
            }
        });

        // Listener: Ketika notifikasi masuk saat aplikasi sedang terbuka
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        // Listener: Ketika user MENGETUK/KLIK notifikasi
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            console.log('User menekan notifikasi dengan data:', data);

            // Navigasi otomatis berdasarkan payload data
            if (data?.url) {
                router.push(data.url as any);
            } else if (data?.route) {
                router.push(data.route as any);
            }
        });

        // Cleanup listener saat komponen di-unmount
        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove(); // Kembali ke cara ini
            }
            if (responseListener.current) {
                responseListener.current.remove(); // Kembali ke cara ini
            }
        };
    }, [user]);

    // Fungsi untuk menghapus token saat logout (opsional tapi disarankan)
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

async function registerForPushNotificationsAsync() {
    let token;

    // 1. Setup Channel khusus Android (Wajib untuk notifikasi muncul)
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Warga Lokal',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#1B5E20',
        });

        await Notifications.setNotificationChannelAsync('sos', {
            name: 'Darurat / SOS',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 200, 500, 200, 500],
            lightColor: '#D32F2F',
        });
    }

    // 2. Cek apakah ini perangkat fisik
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Minta izin jika belum diberikan
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('Izin notifikasi ditolak oleh user.');
            return;
        }

        // 3. Ambil Token dari Expo
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