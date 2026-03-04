import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ThemeColors } from '../../../theme/AppTheme';

export default function EditProfilScreen() {
    const router = useRouter();
    const { profile, updateUserProfile } = useAuth();
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profil</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.form}
                enableOnAndroid={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nama Lengkap</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.full_name}
                        onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                        placeholder="Nama Lengkap"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.username}
                        onChangeText={(text) => setFormData({ ...formData, username: text })}
                        placeholder="Username"
                        placeholderTextColor={colors.textSecondary}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nomor WhatsApp</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.wa_phone}
                        onChangeText={(text) => setFormData({ ...formData, wa_phone: text })}
                        placeholder="08xx-xxxx-xxxx"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Alamat</Text>
                    <TextInput
                        style={[
                            styles.input,
                            { height: 100, textAlignVertical: 'top' }
                        ]}
                        value={formData.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        placeholder="Jl. Mawar No. 1"
                        placeholderTextColor={colors.textSecondary}
                        multiline={true}
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>RT / RW</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.rt_rw}
                        onChangeText={(text) => setFormData({ ...formData, rt_rw: text })}
                        placeholder="001/002"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { opacity: isLoading ? 0.7 : 1 }]}
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator color={colors.textWhite} /> : <Text style={styles.saveButtonText}>Simpan Perubahan</Text>}
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        color: colors.textPrimary,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: colors.textWhite,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
