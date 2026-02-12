import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = () => {
        if (!phone) {
            Alert.alert('Error', 'Mohon masukkan nomor WhatsApp anda');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
                'Kode Terkirim',
                `Kode verifikasi telah dikirim ke WhatsApp ${phone}. Silakan cek pesan anda.`,
                [{ text: 'OK', onPress: () => router.back() }] // In real app, navigate to OTP input
            );
        }, 1500);
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
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
                        Jangan khawatir! Masukkan nomor WhatsApp yang terdaftar dan kami akan mengirimkan kode verifikasi.
                    </Text>
                </View>

                {/* Form Section */}
                <View style={styles.formContainer}>
                    <CustomInput
                        label="Nomor WhatsApp"
                        placeholder="Contoh: 08123456789"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        iconName="logo-whatsapp"
                    />

                    <CustomButton
                        title="Kirim Kode Verifikasi"
                        onPress={handleSendCode}
                        loading={isLoading}
                        style={styles.sendButton}
                    />
                </View>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        backgroundColor: Colors.green1,
    },
    container: {
        flex: 1,
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
});
