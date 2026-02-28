import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { savePushToken, removePushToken } from '../services/notificationService';

// How notifications behave when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
        shouldShowAlert: true,
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

        registerForPushNotificationsAsync().then((token) => {
            if (token) {
                setExpoPushToken(token);
                // Save token to DB for this user
                savePushToken(user.id, token);
            }
        });

        // Listener for foreground notifications
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        // Listener when user taps on the notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('User tapped notification:', response.notification.request.content);
            const data = response.notification.request.content.data;

            // Navigate based on specific payload structures
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

    // Optional: Clean up token on logout
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

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Warga Lokal',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#1B5E20',
        });

        // Optional: Panic/SOS Channel
        await Notifications.setNotificationChannelAsync('sos', {
            name: 'Darurat / SOS',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 200, 500, 200, 500],
            lightColor: '#D32F2F',
            // sound: 'sirine_sos.wav' // if you put this in app.json and build it
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync({
                ios: {
                    allowAlert: true,
                    allowBadge: true,
                    allowSound: true,
                },
            });
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Gagal mendapatkan izin untuk push notification!');
            return;
        }

        // Get token
        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                throw new Error('Project ID is missing. Verify app.json config.');
            }
            token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log('Expo Push Token:', token);
        } catch (e) {
            token = `${e}`;
            console.error('Error getting push token', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
