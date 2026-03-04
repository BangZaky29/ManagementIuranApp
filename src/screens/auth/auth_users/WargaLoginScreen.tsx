import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Keyboard, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomButton } from '../../../components/CustomButton';
import { CustomInput } from '../../../components/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseConfig';
import { getProfile } from '../../../services/auth';

export default function WargaLoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();

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
            const loginIdentifier = email.trim();

            // 1. PRE-CHECK ROLE (PREVENT WRONG DOOR ACCESS)
            const { data: roleData, error: roleError } = await supabase
                .rpc('get_user_role_by_identifier', { identifier: loginIdentifier });

            if (roleData === 'admin') {
                setIsLoading(false);
                setAlertConfig({
                    title: 'Akses Terbatas: Khusus Warga',
                    message: 'Maaf Pak/Bu Admin, halaman ini dikhususkan untuk Warga dan Sekuriti. Untuk mengelola data perumahan, silakan masuk melalui **Portal Admin** ya.',
                    type: 'warning',
                    buttons: [
                        { text: 'Tutup', onPress: hideAlert, style: 'cancel' },
                        {
                            text: 'Ke Portal Admin',
                            onPress: () => {
                                hideAlert();
                                router.replace('/login');
                            }
                        }
                    ]
                });
                setAlertVisible(true);
                return;
            }

            const { session } = await signIn({ email: loginIdentifier, password });

            // STRICT CHECK: Ensure Email is Verified
            if (session?.user && !session.user.confirmed_at && !session.user.email_confirmed_at) {
                await supabase.auth.signOut();
                throw new Error('Email not confirmed');
            }

            // CRITICAL CHECK: Ensure Profile Exists in Public Table
            const profile = await getProfile(session.user.id);
            if (!profile) {
                await supabase.auth.signOut();
                throw new Error('Data Profil tidak ditemukan. Akun Anda mungkin belum tersinkronisasi. Hubungi Admin.');
            }

            // Login successful & Confirmed & Profile Exists -> AuthContext handles state
        } catch (error: any) {
            let message = 'Terjadi kesalahan. Silakan coba lagi.';
            if (error?.message?.includes('Invalid login credentials')) {
                message = 'Email/Username atau kata sandi salah.';
            } else if (error?.message?.includes('Email not confirmed')) {
                message = 'Maaf, email Anda belum terverifikasi. Silakan cek email verifikasi yang telah kami kirim (cek juga folder spam) atau hubungi admin jika ada kendala.';
            } else if (error?.message?.includes('Username tidak ditemukan')) {
                message = 'Username tidak terdaftar. Silakan gunakan email atau periksa kembali username Anda.';
            } else {
                // DEBUG: Show actual error message for other cases
                message = error.message || message;
            }
            showAlert('Login Gagal', message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={Platform.OS === 'ios' ? 20 : 40}
                keyboardShouldPersistTaps="handled"
            >



                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="people" size={40} color={Colors.primary} />
                    </View>
                    <Text style={styles.welcomeText}>Warga / Security</Text>
                    <Text style={styles.subtitleText}>Masuk ke akun warga Anda</Text>
                </View>

                <View style={styles.formContainer}>
                    <CustomInput
                        label="Email / Username"
                        placeholder="Email atau Username"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="default"
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
                        autoCapitalize="none"
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

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Belum punya akun? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')}>
                            <Text style={styles.registerLink}>Verifikasi Data & Daftar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>atau</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <CustomButton
                        title="Masuk sebagai Admin"
                        onPress={() => router.push('/login')}
                        variant="outline"
                        style={{ borderColor: Colors.primary }}
                        textStyle={{ color: Colors.primary }}
                    />
                </View>
            </KeyboardAwareScrollView>

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
        paddingBottom: 80, // Added bottom padding to "push" content slightly up
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20, // Reduced from 60
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: Colors.green3,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        elevation: 4,
    },
    welcomeText: {
        fontSize: 24,
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
        marginBottom: 20,
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
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
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
});
