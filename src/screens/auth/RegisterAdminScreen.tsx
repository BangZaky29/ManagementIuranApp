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

export default function RegisterAdminScreen() {
    const router = useRouter();
    const { signUp } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // New Fields
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [complexName, setComplexName] = useState('');
    const [complexAddress, setComplexAddress] = useState('');

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

    const handleRegister = async () => {
        if (!email.trim() || !password || !confirmPassword || !fullName || !complexName) {
            showAlert('Perhatian', 'Mohon lengkapi semua data wajib (Nama, Cluster, Email, Password)', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Perhatian', 'Kata sandi tidak cocok', 'warning');
            return;
        }

        if (password.length < 6) {
            showAlert('Perhatian', 'Kata sandi minimal 6 karakter', 'warning');
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            const { needsConfirmation } = await signUp({
                email: email.trim(),
                password,
                fullName: fullName,
                phone: phone,
                role: 'admin',
                metadata: {
                    complex_name: complexName,
                    complex_address: complexAddress
                }
            });

            if (needsConfirmation) {
                setAlertConfig({
                    title: 'Registrasi Berhasil',
                    message: 'Silakan cek email Anda untuk konfirmasi akun sebelum login.',
                    type: 'success',
                    buttons: [{
                        text: 'Ke Halaman Login',
                        onPress: () => {
                            hideAlert();
                            router.replace('/login');
                        }
                    }]
                });
                setAlertVisible(true);
            } else {
                router.replace('/(tabs)');
            }

        } catch (error: any) {
            showAlert('Registrasi Gagal', error.message || 'Terjadi kesalahan saat mendaftar.', 'error');
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
                        <Text style={styles.welcomeText}>Daftar Admin</Text>
                        <Text style={styles.subtitleText}>Buat akun Administrator baru</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <CustomInput
                            label="Nama Lengkap"
                            placeholder="Nama Anda"
                            value={fullName}
                            onChangeText={setFullName}
                            iconName="person-outline"
                        />
                        <CustomInput
                            label="No. WhatsApp"
                            placeholder="08xxxxxxxxxx"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            iconName="call-outline"
                        />

                        <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 16 }} />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.green5, marginBottom: 12 }}>Data Perumahan / Cluster</Text>

                        <CustomInput
                            label="Nama Cluster / Apartemen"
                            placeholder="Contoh: Green Valley Residence"
                            value={complexName}
                            onChangeText={setComplexName}
                            iconName="business-outline"
                        />
                        <CustomInput
                            label="Alamat Lengkap"
                            placeholder="Alamat Cluster"
                            value={complexAddress}
                            onChangeText={setComplexAddress}
                            iconName="location-outline"
                        />

                        <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 16 }} />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.green5, marginBottom: 12 }}>Akun Login</Text>

                        <CustomInput
                            label="Email"
                            placeholder="contoh@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            iconName="mail-outline"
                            autoCapitalize="none"
                        />
                        <CustomInput
                            label="Kata Sandi"
                            placeholder="Minimal 6 karakter"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            iconName="lock-closed-outline"
                            autoCapitalize="none"
                        />
                        <CustomInput
                            label="Konfirmasi Kata Sandi"
                            placeholder="Ulangi kata sandi"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            iconName="lock-closed-outline"
                            autoCapitalize="none"
                        />

                        <CustomButton
                            title="Daftar & Buat Cluster"
                            onPress={handleRegister}
                            loading={isLoading}
                            style={styles.loginButton}
                        />
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
    loginButton: {
        marginTop: 20,
    },
});
