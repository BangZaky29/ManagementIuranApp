import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { soundSettingsService, UserSoundSettings } from '../../services/notification';
import * as Notifications from 'expo-notifications';
import { refreshNotificationChannels } from '../../hooks/usePushNotifications';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export const useSoundSettingsViewModel = () => {
    const { user, profile } = useAuth();
    const [settings, setSettings] = useState<UserSoundSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [playingValue, setPlayingValue] = useState<string | null>(null);

    const availableNotifSounds = [
        { label: 'Notification Alert', value: 'notification_alert.wav' },
        { label: 'Vibrate', value: 'vibrate.wav' },
    ];

    const availableAlertSounds = [
        { label: 'Alarm Sound Effect', value: 'alarm-sound-effect.wav' },
        { label: 'Red Siren Alert', value: 'red-siren-alert.wav' },
    ];

    useEffect(() => {
        if (user) {
            loadSettings();
        }

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [user?.id]); // Only re-load if user changes, not when sound plays

    const loadSettings = async () => {
        if (!user) return;
        setIsLoading(true);
        const data = await soundSettingsService.getSettings(user.id);
        if (data) {
            setSettings(data);
        } else {
            // Default initial values
            setSettings({
                user_id: user.id,
                notif_sound: 'notification_alert.wav',
                alert_sound: 'alarm-sound-effect.wav',
                vibration_enabled: true,
                alert_duration: 30
            });
        }
        setIsLoading(false);
    };

    const updateSound = async (type: 'notif' | 'alert', soundFile: string) => {
        if (!user || !settings) return;

        // Visual feedback locally first
        const newSettings = type === 'notif'
            ? { ...settings, notif_sound: soundFile }
            : { ...settings, alert_sound: soundFile };

        setSettings(newSettings);

        // Auto-play preview
        playSound(soundFile, type);

        // Save in background without blocking UI
        await soundSettingsService.updateSettings(user.id, {
            [type === 'notif' ? 'notif_sound' : 'alert_sound']: soundFile
        });

        // Optimasi: Refresh Android channels sehingga efeknya langsung terasa di push notif ke depannya
        await refreshNotificationChannels(user);
    };

    const toggleVibration = async () => {
        if (!user || !settings) return;
        const newValue = !settings.vibration_enabled;
        setSettings({ ...settings, vibration_enabled: newValue });

        // Save in background
        await soundSettingsService.updateSettings(user.id, {
            vibration_enabled: newValue
        });

        // Optimasi: Refresh Android channels
        await refreshNotificationChannels(user);
    };

    const updateAlertDuration = async (duration: number) => {
        if (!user || !settings) return;

        // Ensure duration is between 5 and 60 seconds
        const validatedDuration = Math.min(Math.max(5, duration), 60);

        setSettings({ ...settings, alert_duration: validatedDuration });

        // Save in background
        await soundSettingsService.updateSettings(user.id, {
            alert_duration: validatedDuration
        });
    };

    const playSound = async (soundFile: string, type: 'notif' | 'alert') => {
        if (soundFile === 'default') return;

        try {
            // Set audio mode for playback
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            // Stop and unload existing sound
            if (sound) {
                await sound.unloadAsync();
            }

            console.log(`Menyiapkan pemutaran: ${soundFile} (${type})`);
            setPlayingValue(soundFile);

            // Mapping assets
            let soundAsset;
            if (type === 'notif') {
                if (soundFile === 'notification_alert.wav') soundAsset = require('../../../assets/sounds/notif-sound/notification_alert.wav');
                else if (soundFile === 'vibrate.wav') soundAsset = require('../../../assets/sounds/notif-sound/vibrate.wav');
            } else {
                if (soundFile === 'alarm-sound-effect.wav') soundAsset = require('../../../assets/sounds/alert-sound/alarm-sound-effect.wav');
                else if (soundFile === 'red-siren-alert.wav') soundAsset = require('../../../assets/sounds/alert-sound/red-siren-alert.wav');
            }

            if (!soundAsset) {
                setPlayingValue(null);
                return;
            }

            const { sound: newSound } = await Audio.Sound.createAsync(soundAsset);
            setSound(newSound);
            await newSound.playAsync();

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingValue(null);
                }
            });

        } catch (error) {
            console.error('Error playing sound:', error);
            setPlayingValue(null);
        }
    };

    return {
        settings,
        isLoading,
        isSaving,
        availableNotifSounds,
        availableAlertSounds,
        updateSound,
        toggleVibration,
        updateAlertDuration,
        playSound,
        playingValue,
        isAdminOrSecurity: profile?.role === 'admin' || profile?.role === 'security'
    };
};
