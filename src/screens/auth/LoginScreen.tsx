import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { CustomButton } from '../../components/CustomButton';
import { CustomInput } from '../../components/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

import { CustomAlertModal } from '../../components/CustomAlertModal';

export default function LoginScreen() {
    const router = useRouter();
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

    const handleLogin = () => {
        setIsLoading(true);
        // Simulate login delay
        setTimeout(() => {
            Keyboard.dismiss();
            setIsLoading(false);
            router.replace('/(tabs)');
        }, 1500);
    };

    const navigateToRegister = () => {
        router.push('/register');
    };

    const showFeatureUnavailable = (feature: string) => {
        setAlertConfig({
            title: 'Segera Hadir',
            message: `Fitur ${feature} sedang dalam tahap pengembangan.`,
            type: 'info',
            buttons: [{ text: 'OK', onPress: hideAlert }]
        });
        setAlertVisible(true);
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
                        <Text style={styles.welcomeText}>Selamat Datang!</Text>
                        <Text style={styles.subtitleText}>Masuk untuk mengelola iuran warga</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <CustomInput
                            label="Email / Nomor HP"
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

                        {/* Google Login Button */}
                        <TouchableOpacity style={styles.googleButton} onPress={() => showFeatureUnavailable('Login Google')}>
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
        backgroundColor: Colors.green1, // Soft Green Background
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
    // formCard style removed
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
        marginBottom: 20,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.green1,
        borderRadius: 25, // pill shape
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
