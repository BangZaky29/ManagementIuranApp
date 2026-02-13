import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export const useProfilViewModel = () => {
    const router = useRouter();
    const { profile, signOut } = useAuth();

    // Use real profile data from Supabase, with fallbacks
    const user = {
        name: profile?.full_name || 'Pengguna',
        address: profile?.address || 'Belum diatur',
        rt_rw: profile?.rt_rw || '005/003',
        email: profile?.email || '-',
        phone: profile?.phone || '-',
        role: profile?.role || 'warga',
        avatarUrl: profile?.avatar_url || null,
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
        router.push('/profile/edit');
    };

    const handleChangePassword = () => {
        router.push('/profile/change-password');
    };

    const handleHelp = () => {
        router.push('/profile/help');
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
                            // AuthGate in _layout.tsx will redirect to /login
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
        handleHelp,
        handleLogout,
        alertVisible,
        alertConfig,
        hideAlert
    };
};
