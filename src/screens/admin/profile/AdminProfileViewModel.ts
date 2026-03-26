import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../lib/supabaseConfig';
import { FeatureFlags } from '../../../constants/FeatureFlags';

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
        wa_phone: profile?.wa_phone || '-',
        role: profile?.role || 'admin',
        rt_rw: profile?.rt_rw || '-',
        address: profile?.address || '-',
        username: profile?.username || '-',
        nik: profile?.nik || '-',
        avatarUrl: profile?.avatar_url || null,
        isActive: profile?.is_active || false,
        housingComplexName: profile?.housing_complexes?.name || null,
        activePlanName: profile?.housing_complexes?.active_plan_name || 'Gratis',
        maxWarga: profile?.housing_complexes?.max_warga || 30,
        hasLaporan: profile?.housing_complexes?.has_laporan || false,
        hasChat: profile?.housing_complexes?.has_chat || false,
        hasPanicButton: profile?.housing_complexes?.has_panic_button || false,
        subscriptionCode: profile?.housing_complexes?.subscription_code || null,
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initializer for Edit Screen (if using shared logic, but EditScreen has its own state)
    // We update this just in case AdminProfileScreen uses the modal.
    const handleEditProfile = () => {
        setEditName(profile?.full_name || '');
        // For full edit, we usually navigate to EditScreen
        router.push('/admin/profile/edit');
    };

    const handleSaveProfile = async () => {
        // ... (Legacy modal logic, main logic is in EditScreen)
        // Leaving this as-is for now, focusing on data mapping.
    };

    // --- Redeem Code Logic ---
    const [redeemModalVisible, setRedeemModalVisible] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);

    // Auto-formatting logic for referral code (WLK-PRO-XXXXXX or WLK-FREE-XXXXXX)
    const handleRedeemCodeChange = (text: string) => {
        // 1. Clean from all non-alphanumeric and uppercase it
        let cleaned = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        
        // 2. Format Logic: WLK-
        if (cleaned.length <= 3) {
            setRedeemCode(cleaned);
            return;
        }
        
        // Always starts with WLK-
        let formatted = cleaned.slice(0, 3) + '-';
        let remaining = cleaned.slice(3);
        
        // Detection of PRO (3 chars) vs FREE (4 chars)
        if (remaining.startsWith('PRO')) {
            formatted += 'PRO-';
            remaining = remaining.slice(3);
        } else if (remaining.startsWith('FREE')) {
            formatted += 'FREE-';
            remaining = remaining.slice(4);
        } else if (remaining.length > 3) {
            // If it doesn't match PRO/FREE exactly, fallback to "every 3-4 chars" generic handling
            // for the middle part before the final 6 chars
            formatted += remaining.slice(0, 3) + '-';
            remaining = remaining.slice(3);
        } else {
            setRedeemCode(formatted + remaining);
            return;
        }
        
        // Final part is up to 6 characters
        formatted += remaining.slice(0, 6);
        setRedeemCode(formatted);
    };

    const handleOpenRedeemModal = () => {
        setRedeemCode('');
        setRedeemModalVisible(true);
    };

    const submitRedeemCode = async () => {
        if (!redeemCode.trim()) {
            setAlertConfig({
                title: 'Error',
                message: 'Kode berlangganan tidak boleh kosong.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }

        try {
            setIsRedeeming(true);
            const { error } = await supabase.rpc('redeem_subscription_code', {
                p_code: redeemCode.trim(),
                p_complex_id: profile?.housing_complex_id
            });

            if (error) {
                throw error;
            }

            // Success
            setRedeemModalVisible(false);
            setAlertConfig({
                title: 'Berhasil',
                message: 'Kode langganan berhasil diaktifkan. Fitur baru sudah terbuka!',
                type: 'success',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            
            // Refresh profile to fetch new complex limits
            await refreshProfile();
        } catch (err: any) {
            console.error('Redeem Code Error:', err);
            setAlertConfig({
                title: 'Gagal',
                message: err.message || 'Gagal mengaktifkan kode langganan.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsRedeeming(false);
        }
    };

    // We can also export a specialized hook for the Edit Screen if we want to share logic, 
    // but EditScreen handles its own state. 
    // The critical part here was the `user` object mapping for the View.

    const handleAvatarUpdate = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (result.canceled || !result.assets[0].uri) return;

            setIsUploading(true);
            const imageUri = result.assets[0].uri;

            const fileName = `avatars/admin_${profile?.id}_${Date.now()}.jpg`;
            // Optimization: Use fetch to get blob/arrayBuffer directly (No deprecated FileSystem)
            const response = await fetch(imageUri);
            const arrayBuffer = await response.arrayBuffer();

            const { error: uploadError } = await supabase.storage
                .from('wargaPintar')
                .upload(fileName, arrayBuffer, {
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

    const handleEditComplexInfo = () => {
        router.push('/admin/profile/edit-complex');
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

    return {
        user,
        handleEditProfile,
        handleEditComplexInfo,
        handleSoundSettings,
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
        handleSaveProfile,
        isSubmitting,
        redeemModalVisible,
        setRedeemModalVisible,
        redeemCode,
        setRedeemCode: handleRedeemCodeChange, // Use custom handler for auto-formatting
        isRedeeming,
        handleOpenRedeemModal,
        submitRedeemCode
    };
};
