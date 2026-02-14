import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    const [waPhone, setWaPhone] = useState(profile?.wa_phone || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [rtRw, setRtRw] = useState(profile?.rt_rw || '');
    const [username, setUsername] = useState(profile?.username || '');

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
                wa_phone: waPhone,
                address: address,
                rt_rw: rtRw,
                username: username
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

            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>

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
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Username Login"
                        autoCapitalize="none"
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
                    <Text style={styles.label}>Nomor WhatsApp</Text>
                    <TextInput
                        style={styles.input}
                        value={waPhone}
                        onChangeText={setWaPhone}
                        placeholder="08xxxxxxxxxx"
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Alamat Domisili</Text>
                    <TextInput
                        style={styles.input}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Alamat Lengkap"
                        multiline
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>RT / RW</Text>
                    <TextInput
                        style={styles.input}
                        value={rtRw}
                        onChangeText={setRtRw}
                        placeholder="Contoh: 005/010"
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

                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
