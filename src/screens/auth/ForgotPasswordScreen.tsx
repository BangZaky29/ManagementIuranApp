import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CustomAlertModal } from '../../components/CustomAlertModal';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    const showAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error', buttons?: any[]) => {
        setAlertConfig({
            title,
            message,
            type,
            buttons: buttons || [{ text: 'OK', onPress: hideAlert }]
        });
        setAlertVisible(true);
    };

    const handleSendResetLink = async () => {
        if (!email.trim()) {
            showAlert('Perhatian', 'Mohon masukkan email Anda', 'warning');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            showAlert('Perhatian', 'Format email tidak valid', 'warning');
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            await resetPassword(email.trim());

            showAlert(
                'Link Terkirim',
                `Link reset password telah dikirim ke ${email.trim()}. Silakan cek inbox dan folder spam email Anda.`,
                'success',
                [{
                    text: 'Kembali ke Login',
                    onPress: () => {
                        hideAlert();
                        router.replace('/login');
                    }
                }]
            );
        } catch (error: any) {
            let message = 'Terjadi kesalahan. Silakan coba lagi.';

            if (error?.message?.includes('rate limit')) {
                message = 'Terlalu banyak permintaan. Silakan tunggu beberapa menit.';
            } else if (error?.message) {
                message = error.message;
            }

            showAlert('Gagal', message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    {/* Back Button */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                    </TouchableOpacity>

                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="lock-open" size={40} color={Colors.green5} />
                        </View>
                        <Text style={styles.title}>Lupa Kata Sandi?</Text>
                        <Text style={styles.subtitle}>
                            Jangan khawatir! Masukkan email yang terdaftar dan kami akan mengirimkan link untuk reset kata sandi Anda.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        <CustomInput
                            label="Email"
                            placeholder="contoh@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            iconName="mail-outline"
                        />

                        <CustomButton
                            title="Kirim Link Reset"
                            onPress={handleSendResetLink}
                            loading={isLoading}
                            style={styles.sendButton}
                        />

                        <TouchableOpacity
                            style={styles.backToLoginButton}
                            onPress={() => router.replace('/login')}
                        >
                            <Ionicons name="arrow-back" size={16} color={Colors.primary} />
                            <Text style={styles.backToLoginText}>Kembali ke Login</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <CustomAlertModal
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: Colors.green5,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.green2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 4,
        borderColor: Colors.white,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: Colors.green4,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    formContainer: {
        width: '100%',
    },
    sendButton: {
        marginTop: 10,
    },
    backToLoginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        gap: 6,
    },
    backToLoginText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 15,
    },
});
