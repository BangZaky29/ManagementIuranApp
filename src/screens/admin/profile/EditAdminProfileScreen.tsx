import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { CustomHeader } from '../../../components/CustomHeader';
import { AdminProfileStyles as styles } from './AdminProfileStyles';
import { Colors } from '../../../constants/Colors';
import { StatusBar } from 'expo-status-bar';

export default function EditAdminProfileScreen() {
    const router = useRouter();
    const { profile, updateUserProfile } = useAuth();

    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Nama Lengkap tidak boleh kosong');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateUserProfile({
                full_name: fullName,
                phone: phone,
            });
            Alert.alert('Sukses', 'Profil berhasil diperbarui', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Gagal', error.message || 'Gagal memperbarui profil');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F5F7FA' }]}>
            <StatusBar style="dark" />
            <CustomHeader title="Edit Profil Admin" showBack={true} />

            <ScrollView contentContainerStyle={styles.formContainer}>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nama Lengkap</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Nama Lengkap Admin"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email (Read Only)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#F0F0F0', color: Colors.textSecondary }]}
                        value={profile?.email || ''}
                        editable={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nomor Telepon</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="08xxxxxxxxxx"
                        keyboardType="phone-pad"
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
                        <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
