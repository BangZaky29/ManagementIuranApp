import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomButton } from '../../../components/CustomButton';
import { CustomInput } from '../../../components/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';

export default function RegisterAdminScreen() {
    const router = useRouter();
    const { signUp } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // New Fields
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState(''); // Added
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [rtRw, setRtRw] = useState(''); // Added RT/RW
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

    const validateForm = () => {
        // 1. Username Validation
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!username.trim()) {
            showAlert('Validasi Username', 'Username wajib diisi.', 'warning');
            return false;
        } else if (username.length < 3) {
            showAlert('Validasi Username', 'Username minimal 3 karakter.', 'warning');
            return false;
        } else if (!usernameRegex.test(username)) {
            showAlert('Validasi Username', 'Username hanya boleh huruf, angka, dan underscore (tanpa spasi).', 'warning');
            return false;
        }

        // 2. Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            showAlert('Validasi Email', 'Email wajib diisi.', 'warning');
            return false;
        } else if (!emailRegex.test(email)) {
            showAlert('Validasi Email', 'Format email tidak valid (harus ada @ dan domain).', 'warning');
            return false;
        }

        // 3. Phone Validation (WA)
        const phoneRegex = /^08[0-9]+$/;
        if (!phone.trim()) {
            showAlert('Validasi No. WA', 'Nomor WhatsApp wajib diisi.', 'warning');
            return false;
        } else if (!phoneRegex.test(phone)) {
            showAlert('Validasi No. WA', 'Nomor WA harus berawalan "08" dan berupa angka.', 'warning');
            return false;
        } else if (phone.length < 10) {
            showAlert('Validasi No. WA', 'Nomor WA terlalu pendek (minimal 10 digit).', 'warning');
            return false;
        }

        // 4. Password Validation
        // Regex: Min 8 chars, at least 1 Letter, at least 1 Number. Special chars allowed.
        const passwordStrengthRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!password) {
            showAlert('Validasi Password', 'Kata sandi wajib diisi.', 'warning');
            return false;
        } else if (password.length < 6) {
            showAlert('Validasi Password', 'sandi terlalu lemah kurang dari 6 karakter', 'warning');
            return false;
        } else if (password.length < 8) {
            showAlert('Validasi Password', 'Kata sandi minimal 8 karakter.', 'warning');
            return false;
        } else if (!passwordStrengthRegex.test(password)) {
            showAlert('Validasi Password', 'Kata sandi harus kombinasi huruf dan angka.', 'warning');
            return false;
        }

        if (password !== confirmPassword) {
            showAlert('Validasi Password', 'Kata sandi tidak cocok.', 'warning');
            return false;
        }

        // 5. Other Required Fields
        if (!fullName.trim() || !complexName.trim() || !address.trim() || !rtRw.trim()) {
            showAlert('Perhatian', 'Mohon lengkapi data: Nama, Alamat, Cluster, dan RT/RW.', 'warning');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            const { needsConfirmation } = await signUp({
                email: email.trim(),
                password,
                fullName: fullName,
                phone: phone, // Auth service needs this for standard field
                role: 'admin',
                metadata: {
                    complex_name: complexName,
                    complex_address: complexAddress,
                    username: username,
                    address: address,
                    rt_rw: rtRw,
                    wa_phone: phone,
                    phone: phone
                }
            });

            if (needsConfirmation) {
                setAlertConfig({
                    title: 'Registrasi Berhasil',
                    message: 'Silakan cek email konfirmasi yang telah kami kirim (cek juga folder spam) untuk mengaktifkan akun Anda sebelum login.',
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
                            label="Username"
                            placeholder="Username (untuk login)"
                            value={username}
                            onChangeText={setUsername}
                            iconName="at-outline"
                            autoCapitalize="none"
                        />
                        <CustomInput
                            label="No. WhatsApp"
                            placeholder="08xxxxxxxxxx"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            iconName="logo-whatsapp"
                        />
                        <CustomInput
                            label="Alamat Domisili"
                            placeholder="Alamat tempat tinggal Anda"
                            value={address}
                            onChangeText={setAddress}
                            iconName="home-outline"
                        />

                        <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 16 }} />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.green5, marginBottom: 12 }}>Data Perumahan / Cluster</Text>

                        <CustomInput
                            label="Nama Cluster / Apartemen"
                            placeholder="GREEN VALLEY RESIDENCE"
                            value={complexName}
                            onChangeText={(text) => setComplexName(text.toUpperCase())}
                            iconName="business-outline"
                            autoCapitalize="characters"
                        />
                        <CustomInput
                            label="Alamat Cluster"
                            placeholder="Alamat Lokasi Perumahan"
                            value={complexAddress}
                            onChangeText={setComplexAddress}
                            iconName="location-outline"
                        />
                        <CustomInput
                            label="RT / RW / No. Unit"
                            placeholder="Contoh: RT 005 / RW 010 / Apt Lt.10"
                            value={rtRw}
                            onChangeText={setRtRw}
                            iconName="map-outline"
                        />

                        <View style={{ height: 1, backgroundColor: '#E0E0E0', marginVertical: 16 }} />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.green5, marginBottom: 12 }}>Akun Login</Text>

                        <CustomInput
                            label="Email (Verifikasi Email)"
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
                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 4 }}>
                                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginRight: 8 }}>Kekuatan:</Text>
                                <Text style={{
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    color: password.length < 6 ? Colors.danger : (password.length < 8 ? Colors.warning : Colors.success)
                                }}>
                                    {password.length < 6 ? 'Sangat Lemah (Kurang dari 6 karakter!)' : (password.length < 8 ? 'Sedang (Medium)' : 'Kuat (High)')}
                                </Text>
                            </View>
                        )}

                        <CustomInput
                            label="Konfirmasi Kata Sandi"
                            placeholder="Ulangi kata sandi"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            iconName="lock-closed-outline"
                            autoCapitalize="none"
                        />
                        {/* Password Match Indicator */}
                        {confirmPassword.length > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 4 }}>
                                <Ionicons
                                    name={password === confirmPassword ? "checkmark-circle" : "close-circle"}
                                    size={16}
                                    color={password === confirmPassword ? Colors.success : Colors.danger}
                                />
                                <Text style={{
                                    fontSize: 12,
                                    marginLeft: 6,
                                    color: password === confirmPassword ? Colors.success : Colors.danger
                                }}>
                                    {password === confirmPassword ? 'Password Cocok' : 'Password Belum Cocok'}
                                </Text>
                            </View>
                        )}

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
