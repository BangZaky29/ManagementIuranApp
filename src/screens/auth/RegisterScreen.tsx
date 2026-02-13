import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { CustomButton } from '../../components/CustomButton';
import { CustomInput } from '../../components/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CustomAlertModal } from '../../components/CustomAlertModal';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../lib/authService';

const ROLES: { key: UserRole; label: string; icon: string }[] = [
    { key: 'warga', label: 'Warga', icon: 'people-outline' },
    { key: 'admin', label: 'Admin', icon: 'shield-checkmark-outline' },
    { key: 'security', label: 'Security', icon: 'lock-closed-outline' },
];

export default function RegisterScreen() {
    const router = useRouter();
    const { signUp, signInWithGoogle } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('warga');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    const validate = () => {
        let isValid = true;
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = 'Nama Lengkap wajib diisi';
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = 'Email wajib diisi';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Format email tidak valid';
            isValid = false;
        }

        const phoneRegex = /^[0-9]+$/;
        if (!phone.trim()) {
            newErrors.phone = 'Nomor HP wajib diisi';
            isValid = false;
        } else if (!phoneRegex.test(phone)) {
            newErrors.phone = 'Nomor HP harus berupa angka';
            isValid = false;
        } else if (phone.length < 10) {
            newErrors.phone = 'Nomor HP minimal 10 digit';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Kata sandi wajib diisi';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Kata sandi minimal 6 karakter';
            isValid = false;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Kata sandi tidak cocok';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            const { needsConfirmation } = await signUp({
                email: email.trim(),
                password,
                fullName: name.trim(),
                phone: phone.trim(),
                role: selectedRole,
            });

            if (needsConfirmation) {
                showAlert(
                    'Verifikasi Email',
                    'Akun berhasil dibuat! Silakan cek inbox email Anda untuk konfirmasi sebelum bisa login.',
                    'success',
                    [{
                        text: 'OK',
                        onPress: () => {
                            hideAlert();
                            router.replace('/login');
                        }
                    }]
                );
            } else {
                showAlert(
                    'Registrasi Berhasil',
                    'Akun Anda berhasil dibuat. Anda akan diarahkan ke halaman utama.',
                    'success',
                    [{
                        text: 'OK',
                        onPress: () => {
                            hideAlert();
                            // AuthGate will redirect automatically
                        }
                    }]
                );
            }
        } catch (error: any) {
            let message = 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.';

            if (error?.message?.includes('already registered')) {
                message = 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.';
            } else if (error?.message?.includes('Password should be')) {
                message = 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter.';
            } else if (error?.message) {
                message = error.message;
            }

            showAlert('Registrasi Gagal', message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        try {
            await signInWithGoogle();
        } catch (error: any) {
            showAlert(
                'Segera Hadir',
                'Daftar dengan Google memerlukan konfigurasi tambahan di Supabase Dashboard.',
                'info'
            );
        }
    };

    const navigateToLogin = () => {
        router.push('/login');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Decorative Elements */}
                    <View style={styles.topCircle} />

                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                        </TouchableOpacity>

                        <View style={styles.titleContainer}>
                            <Text style={styles.welcomeText}>Buat Akun</Text>
                            <Text style={styles.subtitleText}>Bergabung dengan Warga Pintar</Text>
                        </View>
                    </View>

                    {/* Role Selector */}
                    <View style={styles.roleContainer}>
                        {ROLES.map((role) => (
                            <TouchableOpacity
                                key={role.key}
                                style={[
                                    styles.roleTab,
                                    selectedRole === role.key && styles.roleTabActive,
                                ]}
                                onPress={() => setSelectedRole(role.key)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={role.icon as any}
                                    size={18}
                                    color={selectedRole === role.key ? '#FFFFFF' : Colors.green4}
                                />
                                <Text style={[
                                    styles.roleTabText,
                                    selectedRole === role.key && styles.roleTabTextActive,
                                ]}>
                                    {role.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.formContainer}>
                        <CustomInput
                            label="Nama Lengkap"
                            placeholder="Nama Lengkap"
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                            iconName="person-outline"
                            error={errors.name}
                        />
                        <CustomInput
                            label="Email"
                            placeholder="contoh@email.com"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                            keyboardType="email-address"
                            iconName="mail-outline"
                            error={errors.email}
                        />
                        <CustomInput
                            label="Nomor HP"
                            placeholder="08123456789"
                            value={phone}
                            onChangeText={(text) => {
                                setPhone(text);
                                if (errors.phone) setErrors({ ...errors, phone: '' });
                            }}
                            keyboardType="phone-pad"
                            iconName="call-outline"
                            error={errors.phone}
                        />
                        <CustomInput
                            label="Kata Sandi"
                            placeholder="Minimal 6 karakter"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: '' });
                            }}
                            secureTextEntry
                            iconName="lock-closed-outline"
                            error={errors.password}
                        />

                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <View style={styles.passwordStrengthContainer}>
                                <Text style={styles.passwordStrengthText}>Kekuatan Password: </Text>
                                <Text style={[
                                    styles.passwordStrengthValue,
                                    { color: password.length < 6 ? Colors.danger : (password.length < 8 ? Colors.warning : Colors.success) }
                                ]}>
                                    {password.length < 6 ? 'Lemah' : (password.length < 8 ? 'Sedang' : 'Kuat')}
                                </Text>
                            </View>
                        )}

                        <CustomInput
                            label="Konfirmasi Kata Sandi"
                            placeholder="Ulangi kata sandi"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                            }}
                            secureTextEntry
                            iconName="lock-closed-outline"
                            error={errors.confirmPassword}
                        />

                        {/* Password Match Indicator */}
                        {confirmPassword.length > 0 && (
                            <Text style={[
                                styles.passwordMatchText,
                                { color: password === confirmPassword ? Colors.success : Colors.danger }
                            ]}>
                                {password === confirmPassword ? 'Password cocok' : 'Password tidak sesuai'}
                            </Text>
                        )}

                        <CustomButton
                            title={`Daftar sebagai ${ROLES.find(r => r.key === selectedRole)?.label}`}
                            onPress={handleRegister}
                            loading={isLoading}
                            style={styles.registerButton}
                        />

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>atau</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Google Register Button */}
                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleRegister}>
                            <Ionicons name="logo-google" size={20} color={Colors.green5} style={{ marginRight: 10 }} />
                            <Text style={styles.googleButtonText}>Daftar dengan Google</Text>
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Sudah punya akun? </Text>
                            <TouchableOpacity onPress={navigateToLogin}>
                                <Text style={styles.loginLink}>Masuk</Text>
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
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 60,
    },
    topCircle: {
        position: 'absolute',
        top: -80,
        left: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: Colors.green2,
        opacity: 0.4,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        elevation: 2,
    },
    titleContainer: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    subtitleText: {
        fontSize: 14,
        color: Colors.green4,
    },

    // Role Selector
    roleContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    roleTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    roleTabActive: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    roleTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.green4,
    },
    roleTabTextActive: {
        color: '#FFFFFF',
    },

    formContainer: {
        width: '100%',
        marginBottom: 20,
    },
    registerButton: {
        marginTop: 10,
        marginBottom: 16,
        width: '100%',
    },

    // Divider
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
    passwordStrengthContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingLeft: 4,
    },
    passwordStrengthText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    passwordStrengthValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    passwordMatchText: {
        fontSize: 12,
        marginTop: -15,
        marginBottom: 15,
        paddingLeft: 4,
        fontWeight: '500',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        color: Colors.textSecondary,
        fontSize: 15,
    },
    loginLink: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
});
