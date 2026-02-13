import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { CustomButton } from '../../components/CustomButton';
import { CustomInput } from '../../components/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CustomAlertModal } from '../../components/CustomAlertModal';
import { useAuth } from '../../contexts/AuthContext';

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
        } catch (error: any) {
            let message = 'Terjadi kesalahan. Silakan coba lagi.';
            if (error?.message?.includes('Invalid login credentials')) {
                message = 'Email atau kata sandi salah.';
            } else if (error?.message?.includes('Email not confirmed')) {
                message = 'Email belum dikonfirmasi. Silakan cek inbox Anda.';
            }
            showAlert('Login Gagal', message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="people" size={40} color={Colors.primary} />
                        </View>
                        <Text style={styles.welcomeText}>Warga / Security</Text>
                        <Text style={styles.subtitleText}>Masuk ke akun warga Anda</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <CustomInput
                            label="Email"
                            placeholder="email@anda.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            iconName="mail-outline"
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
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 24,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 60,
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
});
