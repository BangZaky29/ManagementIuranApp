import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../../lib/supabaseConfig';
import { decode } from 'base64-arraybuffer';

export const useAdminProfileViewModel = () => {
    const router = useRouter();
    const { profile, signOut, updateUserProfile, refreshProfile } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    React.useEffect(() => {
        refreshProfile();
    }, []);

    const user = {
        name: profile?.full_name || 'Administrator',
        email: profile?.email || '-',
        phone: profile?.phone || '-',
        wa_phone: profile?.wa_phone || '-',
        role: profile?.role || 'admin',
        rt_rw: profile?.rt_rw || '-',
        address: profile?.address || '-',
        username: profile?.username || '-',
        nik: profile?.nik || '-',
        avatarUrl: profile?.avatar_url || null,
        isActive: profile?.is_active || false,
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

    // Edit Modal State (Legacy - kept for inline modal if needed, but we used separate screen mostly)
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initializer for Edit Screen (if using shared logic, but EditScreen has its own state)
    // We update this just in case AdminProfileScreen uses the modal.
    const handleEditProfile = () => {
        setEditName(profile?.full_name || '');
        setEditPhone(profile?.phone || '');
        // For full edit, we usually navigate to EditScreen
        router.push('/admin/profile/edit');
    };

    const handleSaveProfile = async () => {
        // ... (Legacy modal logic, main logic is in EditScreen)
        // Leaving this as-is for now, focusing on data mapping.
    };

    // We can also export a specialized hook for the Edit Screen if we want to share logic, 
    // but EditScreen handles its own state. 
    // The critical part here was the `user` object mapping for the View.

    const handleAvatarUpdate = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (result.canceled || !result.assets[0].uri) return;

            setIsUploading(true);
            const imageUri = result.assets[0].uri;

            const fileName = `avatars/admin_${profile?.id}_${Date.now()}.jpg`;
            const base64 = await FileSystem.readAsStringAsync(imageUri, {
                encoding: 'base64',
            });

            const { error: uploadError } = await supabase.storage
                .from('wargaPintar')
                .upload(fileName, decode(base64), {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('wargaPintar')
                .getPublicUrl(fileName);

            await updateUserProfile({ avatar_url: publicUrl });

            setAlertConfig({
                title: 'Sukses',
                message: 'Foto profil admin berhasil diperbarui',
                type: 'success',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);

        } catch (error: any) {
            console.error('Avatar update error:', error);
            setAlertConfig({
                title: 'Gagal',
                message: error.message || 'Gagal update foto',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = () => {
        setAlertConfig({
            title: 'Konfirmasi Keluar',
            message: 'Admin yakin ingin keluar?',
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Keluar',
                    style: 'destructive',
                    onPress: async () => {
                        hideAlert();
                        await signOut();
                    }
                }
            ]
        });
        setAlertVisible(true);
    };

    return {
        user,
        handleEditProfile,
        handleLogout,
        handleAvatarUpdate,
        isUploading,
        alertVisible,
        alertConfig,
        hideAlert,
        editModalVisible,
        setEditModalVisible,
        editName,
        setEditName,
        editPhone,
        setEditPhone,
        handleSaveProfile,
        isSubmitting
    };
};
