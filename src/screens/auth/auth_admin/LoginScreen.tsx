import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomButton } from '../../../components/CustomButton';
import { CustomInput } from '../../../components/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const { signIn, signInWithGoogle } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
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

    const showAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => {
        setAlertConfig({
            title,
            message,
            type,
            buttons: [{ text: 'OK', onPress: hideAlert }]
        });
        setAlertVisible(true);
    };

    const handleLogin = async () => {
        if (!identifier.trim()) {
            showAlert('Perhatian', 'Email atau Username wajib diisi', 'warning');
            return;
        }
        if (!password) {
            showAlert('Perhatian', 'Kata sandi wajib diisi', 'warning');
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            await signIn({ email: identifier.trim(), password });
        } catch (error: any) {
            // ... error handling
        }

        // RE-WRITING LOGIC TO USE SERVICE + CONTEXT
        try {
            let loginEmail = identifier.trim();

            // Username lookup logic (Client-side helper)
            if (!loginEmail.includes('@')) {
                const { supabase } = require('../../../lib/supabaseConfig');
                const { data, error } = await supabase
                    .rpc('get_email_by_username', { username_input: loginEmail });

                if (error || !data) throw new Error('Username tidak ditemukan');
                loginEmail = data;
            }

            await signIn({ email: loginEmail, password });
            // AuthGate in _layout.tsx will handle redirect to (tabs)
        } catch (error: any) {
            let message = 'Terjadi kesalahan. Silakan coba lagi.';

            if (error?.message?.includes('Invalid login credentials')) {
                message = 'Kombinasi login salah.';
            } else if (error?.message?.includes('Email not confirmed')) {
                message = 'Maaf, email Anda belum terverifikasi. Silakan cek email verifikasi yang telah kami kirim (cek juga folder spam) atau hubungi admin jika ada kendala.';
            } else if (error?.message) {
                message = error.message;
            }

            showAlert('Login Gagal', message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            // AuthGate will handle redirect
        } catch (error: any) {
            const msg = error?.message === 'Login dibatalkan'
                ? 'Login dengan Google dibatalkan.'
                : (error?.message || 'Gagal login dengan Google. Pastikan Google OAuth sudah dikonfigurasi di Supabase.');
            showAlert('Google Login', msg, error?.message === 'Login dibatalkan' ? 'info' : 'error');
        }
    };

    const navigateToRegisterAdmin = () => {
        router.push('/register-admin');
    };

    const navigateToWargaLogin = () => {
        // Redirect to Verification/Register screen as requested
        router.push('/register');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.headerContainer}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="key" size={40} color={Colors.primary} />
                        </View>
                        <Text style={styles.welcomeText}>Masuk sebagai Admin</Text>
                        <Text style={styles.subtitleText}>Kelola perumahan dan warga anda</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <CustomInput
                            label="Email atau Username"
                            placeholder="admin@example.com atau username"
                            value={identifier}
                            onChangeText={setIdentifier}
                            keyboardType="email-address"
                            iconName="person-outline"
                            autoCapitalize="none"
                        />

                        <CustomInput
                            label="Kata Sandi"
                            placeholder="Masukkan kata sandi"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            iconName="lock-closed-outline"
                        />

                        <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => router.push('/forgot-password')}>
                            <Text style={styles.forgotPasswordText}>Lupa Kata Sandi?</Text>
                        </TouchableOpacity>

                        <CustomButton
                            title="Masuk Sebagai Admin"
                            onPress={handleLogin}
                            loading={isLoading}
                            style={styles.loginButton}
                        />

                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>atau</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <CustomButton
                            title="Verifikasi Akun Warga atau Sekuriti Anda"
                            onPress={navigateToWargaLogin}
                            variant="outline"
                            style={{ marginBottom: 16, borderColor: Colors.primary }}
                            textStyle={{ color: Colors.primary }}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
                            <Text style={{ color: Colors.green4 }}>Belum punya akun admin? </Text>
                            <TouchableOpacity onPress={navigateToRegisterAdmin}>
                                <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Daftar Admin</Text>
                            </TouchableOpacity>
                        </View>

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
        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
    },
    topCircle: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: Colors.green2,
        opacity: 0.5,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 25,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    logo: {
        width: 70,
        height: 70,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 16,
        color: Colors.green4,
    },
    formContainer: {
        width: '100%',
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: Colors.primary,
        fontWeight: '600',
    },

    // Auth Buttons Container
    authButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    loginButton: {
        flex: 1,
        marginRight: 8,
    },
    registerButton: {
        flex: 1,
        marginLeft: 8,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    registerButtonText: {
        color: Colors.primary, // Force text color for outlined button if CustomButton doesn't handle it well generally
    },

    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.green2,
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 13,
        color: Colors.textSecondary,
    },

    wargaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.green3,
        borderRadius: 25,
        paddingVertical: 14,
        marginBottom: 16,
        shadowColor: Colors.green3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    wargaButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.green5,
        marginLeft: 8,
    },
});
