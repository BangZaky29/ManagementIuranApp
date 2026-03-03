import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../../../lib/supabaseConfig';
import { decode } from 'base64-arraybuffer';
import { FeatureFlags } from '../../../constants/FeatureFlags';

export const useSecurityProfileViewModel = () => {
    const router = useRouter();
    const { profile, signOut, updateUserProfile, refreshProfile } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    // Force refresh profile data when entering this screen
    React.useEffect(() => {
        refreshProfile();
    }, []);

    // Use real profile data from Supabase, with fallbacks
    const user = {
        name: profile?.full_name || 'Petugas Keamanan',
        nik: profile?.nik || '-',
        username: profile?.username || '-',
        address: profile?.address || '-',
        rt_rw: profile?.rt_rw || '-',
        email: profile?.email || '-',
        phone: profile?.wa_phone || '-',
        role: profile?.role || 'security',
        avatarUrl: profile?.avatar_url || null,
        housingComplexName: profile?.housing_complexes?.name || null,
    };

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    const handleEditProfile = () => {
        router.push('/security/edit-profile' as any);
    };

    const handleAvatarUpdate = async () => {
        try {
            // 1. Pick Image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (result.canceled || !result.assets[0].uri) return;

            setIsUploading(true);
            const imageUri = result.assets[0].uri;

            // 2. Upload to Supabase Storage
            const fileName = `avatars/${profile?.id}_${Date.now()}.jpg`;
            const base64 = await FileSystem.readAsStringAsync(imageUri, {
                encoding: 'base64',
            });

            const { error: uploadError } = await supabase.storage
                .from('wargaPintar') // Assuming 'wargaPintar' is the storage bucket being used across the app
                .upload(fileName, decode(base64), {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('wargaPintar')
                .getPublicUrl(fileName);

            // 4. Update Profile
            await updateUserProfile({ avatar_url: publicUrl });

            setAlertConfig({
                title: 'Sukses',
                message: 'Foto profil berhasil diperbarui',
                type: 'success',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);

        } catch (error: any) {
            console.error('Avatar update error:', error);
            setAlertConfig({
                title: 'Gagal',
                message: error.message || 'Gagal mengupload foto',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsUploading(false);
        }
    };

    const handleChangePassword = () => {
        router.push('/security/change-password' as any);
    };

    const handleSoundSettings = () => {
        if (!FeatureFlags.IS_SOUND_SETTINGS_ENABLED) {
            setAlertConfig({
                title: 'Informasi',
                message: 'Fitur masih dalam tahap pengembangan',
                type: 'info',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }
        router.push('/profile/sounds' as any);
    };

    const handleLogout = () => {
        setAlertConfig({
            title: 'Konfirmasi Keluar',
            message: 'Apakah anda yakin ingin keluar dari aplikasi?',
            type: 'warning',
            buttons: [
                {
                    text: 'Batal',
                    style: 'cancel',
                    onPress: hideAlert
                },
                {
                    text: 'Keluar',
                    style: 'destructive',
                    onPress: async () => {
                        hideAlert();
                        try {
                            await signOut();
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    }
                }
            ]
        });
        setAlertVisible(true);
    };

    return {
        user,
        handleEditProfile,
        handleChangePassword,
        handleSoundSettings,
        handleLogout,
        handleAvatarUpdate,
        isUploading,
        alertVisible,
        alertConfig,
        hideAlert
    };
};
