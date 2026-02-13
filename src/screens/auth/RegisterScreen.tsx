import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { CustomAlertModal } from '../../components/CustomAlertModal';
import { Colors } from '../../constants/Colors';
import { useRegisterViewModel } from './RegisterViewModel';
import { styles } from './RegisterStyles';

export default function RegisterScreen() {
    const router = useRouter();
    const vm = useRegisterViewModel();

    // Render Steps
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
                            <Text style={styles.welcomeText}>
                                {vm.step === 1 ? 'Verifikasi Data' : 'Lengkapi Akun'}
                            </Text>
                            <Text style={styles.subtitleText}>
                                {vm.step === 1 ? 'Masukkan NIK dan Kode Akses Anda' : 'Buat kredensial login Anda'}
                            </Text>
                        </View>
                    </View>

                    {/* Step Indicators */}
                    <View style={styles.stepContainer}>
                        <View style={[styles.stepDot, vm.step >= 1 && styles.stepDotActive]} />
                        <View style={[styles.stepLine, vm.step >= 2 && styles.stepLineActive]} />
                        <View style={[styles.stepDot, vm.step >= 2 && styles.stepDotActive]} />
                    </View>

                    <View style={styles.formContainer}>
                        {vm.step === 1 ? (
                            // STEP 1: VERIFICATION
                            <>
                                <View style={styles.infoBox}>
                                    <Ionicons name="information-circle" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
                                    <Text style={styles.infoText}>
                                        Silakan masukkan NIK dan Kode Akses yang telah diberikan oleh Admin/Pengurus RT.
                                    </Text>
                                </View>

                                <CustomInput
                                    label="NIK"
                                    placeholder="Nomor Induk Kependudukan"
                                    value={vm.nik}
                                    onChangeText={vm.setNik}
                                    keyboardType="numeric"
                                    iconName="card-outline"
                                />

                                <CustomInput
                                    label="Kode Akses (Token)"
                                    placeholder="Contoh: A1B2C3"
                                    value={vm.token}
                                    onChangeText={(text) => vm.setToken(text.toUpperCase())}
                                    autoCapitalize="characters"
                                    iconName="key-outline"
                                />

                                <CustomButton
                                    title="Verifikasi"
                                    onPress={vm.handleVerify}
                                    loading={vm.isLoading}
                                    style={styles.actionButton}
                                />
                            </>
                        ) : (
                            // STEP 2: REGISTRATION
                            <>
                                {vm.verifiedData && (
                                    <View style={styles.verifiedCard}>
                                        <Text style={styles.verifiedTitle}>Data Terverifikasi:</Text>
                                        <View style={styles.verifiedRow}>
                                            <Text style={styles.verifiedLabel}>Nama:</Text>
                                            <Text style={styles.verifiedValue}>{vm.verifiedData.name}</Text>
                                        </View>
                                        <View style={styles.verifiedRow}>
                                            <Text style={styles.verifiedLabel}>Alamat:</Text>
                                            <Text style={styles.verifiedValue}>{vm.verifiedData.address}</Text>
                                        </View>
                                        <View style={styles.verifiedRow}>
                                            <Text style={styles.verifiedLabel}>Role:</Text>
                                            <View style={styles.roleBadge}>
                                                <Text style={styles.roleBadgeText}>
                                                    {vm.verifiedData.role === 'security' ? 'Security' : 'Warga'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                <CustomInput
                                    label="Username"
                                    placeholder="Buat username unik"
                                    value={vm.username}
                                    onChangeText={vm.setUsername}
                                    iconName="person-outline"
                                    error={vm.errors.username}
                                />

                                <CustomInput
                                    label="Email"
                                    placeholder="email@anda.com"
                                    value={vm.email}
                                    onChangeText={vm.setEmail}
                                    keyboardType="email-address"
                                    iconName="mail-outline"
                                    error={vm.errors.email}
                                />

                                <CustomInput
                                    label="Nomor WhatsApp"
                                    placeholder="08123456789"
                                    value={vm.phone}
                                    onChangeText={vm.setPhone}
                                    keyboardType="phone-pad"
                                    iconName="logo-whatsapp"
                                    error={vm.errors.phone}
                                />

                                <CustomInput
                                    label="Kata Sandi"
                                    placeholder="Minimal 6 karakter"
                                    value={vm.password}
                                    onChangeText={vm.setPassword}
                                    secureTextEntry
                                    iconName="lock-closed-outline"
                                    error={vm.errors.password}
                                />

                                <CustomInput
                                    label="Konfirmasi Kata Sandi"
                                    placeholder="Ulangi kata sandi"
                                    value={vm.confirmPassword}
                                    onChangeText={vm.setConfirmPassword}
                                    secureTextEntry
                                    iconName="lock-closed-outline"
                                    error={vm.errors.confirmPassword}
                                />

                                <CustomButton
                                    title="Daftar Sekarang"
                                    onPress={vm.handleRegister}
                                    loading={vm.isLoading}
                                    style={styles.actionButton}
                                />

                                <TouchableOpacity
                                    style={styles.backStepButton}
                                    onPress={() => vm.setStep(1)}
                                >
                                    <Text style={styles.backStepText}>Kembali ke Verifikasi</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Sudah punya akun? </Text>
                            <TouchableOpacity onPress={() => router.push('/login')}>
                                <Text style={styles.loginLink}>Masuk</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <CustomAlertModal
                visible={vm.alertVisible}
                title={vm.alertConfig.title}
                message={vm.alertConfig.message}
                type={vm.alertConfig.type}
                buttons={vm.alertConfig.buttons}
                onClose={vm.hideAlert}
            />
        </View>
    );
}
