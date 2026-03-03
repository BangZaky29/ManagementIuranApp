import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { soundSettingsService, UserSoundSettings } from '../../services/notificationSettingsService';
import * as Notifications from 'expo-notifications';
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
        { label: 'Standard Alert', value: 'notification_alert.wav' },
        { label: 'Vibrate Only', value: 'vibrate.wav' },
        { label: 'Default System', value: 'default' }
    ];

    const availableAlertSounds = [
        { label: 'Alarm Effect', value: 'alarm-sound-effect.wav' },
        { label: 'Red Siren SOS', value: 'red-siren-alert.wav' },
        { label: 'Default System', value: 'default' }
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
    }, [user, sound]);

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
                vibration_enabled: true
            });
        }
        setIsLoading(false);
    };

    const updateSound = async (type: 'notif' | 'alert', soundFile: string) => {
        if (!user || !settings) return;

        setIsSaving(true);
        const newSettings = type === 'notif'
            ? { ...settings, notif_sound: soundFile }
            : { ...settings, alert_sound: soundFile };

        const result = await soundSettingsService.updateSettings(user.id, {
            [type === 'notif' ? 'notif_sound' : 'alert_sound']: soundFile
        });

        if (result.success) {
            setSettings(newSettings);
            // After updating, we should ideally trigger a re-registration of channels
            // This will happen on next app start or we can expose a refresh method in usePushNotifications
        }
        setIsSaving(false);
    };

    const toggleVibration = async () => {
        if (!user || !settings) return;
        setIsSaving(true);
        const newValue = !settings.vibration_enabled;
        const result = await soundSettingsService.updateSettings(user.id, {
            vibration_enabled: newValue
        });
        if (result.success) {
            setSettings({ ...settings, vibration_enabled: newValue });
        }
        setIsSaving(false);
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
        playSound,
        playingValue,
        isAdminOrSecurity: profile?.role === 'admin' || profile?.role === 'security'
    };
};
