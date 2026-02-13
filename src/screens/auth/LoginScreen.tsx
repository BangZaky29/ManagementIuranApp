import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { CustomButton } from '../../components/CustomButton';
import { CustomInput } from '../../components/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CustomAlertModal } from '../../components/CustomAlertModal';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const { signIn, signInWithGoogle } = useAuth();

    const [email, setEmail] = useState('');
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
        if (!email.trim()) {
            showAlert('Perhatian', 'Email wajib diisi', 'warning');
            return;
        }
        if (!password) {
            showAlert('Perhatian', 'Kata sandi wajib diisi', 'warning');
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            await signIn({ email: email.trim(), password });
            // AuthGate in _layout.tsx will handle redirect to (tabs)
        } catch (error: any) {
            let message = 'Terjadi kesalahan. Silakan coba lagi.';

            if (error?.message?.includes('Invalid login credentials')) {
                message = 'Email atau kata sandi salah. Silakan coba lagi.';
            } else if (error?.message?.includes('Email not confirmed')) {
                message = 'Email belum dikonfirmasi. Silakan cek inbox email Anda.';
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

    const navigateToRegister = () => {
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

                    {/* Decorative Top Circle */}
                    <View style={styles.topCircle} />

                    <View style={styles.headerContainer}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../../assets/images/icon.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.welcomeText}>Warga Pintar</Text>
                        <Text style={styles.subtitleText}>Masuk untuk mengelola iuran warga</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <CustomInput
                            label="Email"
                            placeholder="contoh@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            iconName="mail-outline"
                        />
                        <CustomInput
                            label="Kata Sandi"
                            placeholder="Masukkan kata sandi"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            iconName="lock-closed-outline"
                        />

                        <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/forgot-password')}>
                            <Text style={styles.forgotPasswordText}>Lupa Kata Sandi?</Text>
                        </TouchableOpacity>

                        <CustomButton
                            title="Masuk"
                            onPress={handleLogin}
                            loading={isLoading}
                            style={styles.loginButton}
                        />

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>atau</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google Login Button */}
                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                            <Ionicons name="logo-google" size={20} color={Colors.green5} style={{ marginRight: 10 }} />
                            <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
                        </TouchableOpacity>

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Belum punya akun? </Text>
                            <TouchableOpacity onPress={navigateToRegister}>
                                <Text style={styles.registerLink}>Daftar Sekarang</Text>
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
        </View>
    );
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    loginButton: {
        marginTop: 10,
        marginBottom: 16,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
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
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.green1,
        borderRadius: 25,
        paddingVertical: 14,
        marginBottom: 30,
        shadowColor: Colors.green3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    registerText: {
        color: Colors.textSecondary,
        fontSize: 15,
    },
    registerLink: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
});
