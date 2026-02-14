import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';

export default function EditProfilScreen() {
    const router = useRouter();
    const { profile, updateUserProfile } = useAuth();
    const { colors } = useTheme();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        username: profile?.username || '',
        wa_phone: profile?.wa_phone || '',
        address: profile?.address || '',
        rt_rw: profile?.rt_rw || '',
    });

    const handleSave = async () => {
        if (!formData.full_name.trim()) {
            Alert.alert('Error', 'Nama Lengkap tidak boleh kosong');
            return;
        }
        if (!formData.username.trim()) {
            Alert.alert('Error', 'Username tidak boleh kosong');
            return;
        }

        setIsLoading(true);
        try {
            await updateUserProfile({
                full_name: formData.full_name,
                username: formData.username,
                wa_phone: formData.wa_phone,
                address: formData.address,
                rt_rw: formData.rt_rw,
            });
            Alert.alert('Sukses', 'Profil berhasil diperbarui');
            router.back();
        } catch (error: any) {
            Alert.alert('Gagal', error.message || 'Terjadi kesalahan saat menyimpan profil');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.backgroundCard} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.backgroundCard, borderBottomColor: colors.border, marginTop: 40 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Profil</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Nama Lengkap</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                        value={formData.full_name}
                        onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                        placeholder="Nama Lengkap"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                        value={formData.username}
                        onChangeText={(text) => setFormData({ ...formData, username: text })}
                        placeholder="Username"
                        placeholderTextColor={colors.textSecondary}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Nomor WhatsApp</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                        value={formData.wa_phone}
                        onChangeText={(text) => setFormData({ ...formData, wa_phone: text })}
                        placeholder="08xx-xxxx-xxxx"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Alamat</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                        value={formData.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        placeholder="Jl. Mawar No. 1"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>RT / RW</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                        value={formData.rt_rw}
                        onChangeText={(text) => setFormData({ ...formData, rt_rw: text })}
                        placeholder="001/002"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Simpan Perubahan</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
