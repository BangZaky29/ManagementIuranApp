import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export const useProfilViewModel = () => {
    const router = useRouter();

    // Mock User Data
    const [user] = useState({
        name: 'Budi Santoso',
        address: 'Jl. Merpati No. 12',
        rt_rw: '005/012',
        email: 'budi.santoso@email.com',
        phone: '0812-3456-7890',
        avatarUrl: null // Placeholder for now
    });

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
                    onPress: () => {
                        hideAlert();
                        // Slight delay to allow modal to close smoothly
                        setTimeout(() => {
                            router.replace('/register');
                        }, 300);
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
