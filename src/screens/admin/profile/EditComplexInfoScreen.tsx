import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { CustomHeader } from '../../../components/CustomHeader';
import { AdminProfileStyles as styles } from './AdminProfileStyles';
import { Colors } from '../../../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { fetchComplexInfo, upsertComplexInfo } from '../../../services/complexService';

export default function EditComplexInfoScreen() {
    const router = useRouter();
    const { profile } = useAuth();

    const [helpPhone, setHelpPhone] = useState('');
    const [helpWhatsapp, setHelpWhatsapp] = useState('');
    const [helpNote, setHelpNote] = useState('');
    const [termsConditions, setTermsConditions] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadComplexInfo();
    }, []);

    const loadComplexInfo = async () => {
        if (!profile?.housing_complex_id) return;
        try {
            const info = await fetchComplexInfo(profile.housing_complex_id);
            if (info) {
                setHelpPhone(info.help_phone || '');
                setHelpWhatsapp(info.help_whatsapp || '');
                setHelpNote(info.help_note || '');
                setTermsConditions(info.terms_conditions || '');
            }
        } catch (error: any) {
            console.error('Load complex info error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profile?.housing_complex_id) {
            Alert.alert('Error', 'ID Komplek tidak ditemukan');
            return;
        }

        setIsSubmitting(true);
        try {
            await upsertComplexInfo(profile.housing_complex_id, {
                help_phone: helpPhone,
                help_whatsapp: helpWhatsapp,
                help_note: helpNote,
                terms_conditions: termsConditions,
            });
            Alert.alert('Sukses', 'Informasi bantuan komplek berhasil diperbarui', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Gagal', error.message || 'Gagal memperbarui informasi');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: '#F5F7FA' }]}>
            <StatusBar style="dark" />
            <CustomHeader title="Edit Informasi Komplek" showBack={true} />

            <KeyboardAwareScrollView
                contentContainerStyle={styles.formContainer}
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={Platform.OS === 'ios' ? 20 : 40}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 15 }]}>Kontak Bantuan</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nomor Telepon / HP (Pak RT)</Text>
                    <TextInput
                        style={styles.input}
                        value={helpPhone}
                        onChangeText={setHelpPhone}
                        placeholder="Contoh: +62 812 3456 7890"
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nomor WhatsApp</Text>
                    <TextInput
                        style={styles.input}
                        value={helpWhatsapp}
                        onChangeText={setHelpWhatsapp}
                        placeholder="Contoh: +62 812 3456 7890"
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Catatan Bantuan (Opsional)</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        value={helpNote}
                        onChangeText={setHelpNote}
                        placeholder="Misal: Aktif jam 08.00 - 20.00"
                        multiline={true}
                        numberOfLines={3}
                    />
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 15 }]}>Informasi Lainnya</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Syarat & Ketentuan Komplek (Opsional)</Text>
                    <TextInput
                        style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                        value={termsConditions}
                        onChangeText={setTermsConditions}
                        placeholder="Masukkan S&K komplek di sini..."
                        multiline={true}
                        numberOfLines={5}
                    />
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Simpan Informasi</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
