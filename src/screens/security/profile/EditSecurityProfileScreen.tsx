import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StatusBar, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { CustomButton } from '../../../components/common/CustomButton';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { ThemeColors } from '../../../theme/AppTheme';

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
    },
    formCard: {
        backgroundColor: colors.surface,
        padding: 24,
        borderRadius: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.surfaceSubtle,
    },
});

export default function EditSecurityProfileScreen() {
    const router = useRouter();
    const { profile, updateUserProfile } = useAuth();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [name, setName] = useState(profile?.full_name || '');
    const [nik, setNik] = useState(profile?.nik || '');
    const [username, setUsername] = useState(profile?.username || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [rtRw, setRtRw] = useState(profile?.rt_rw || '');
    const [phone, setPhone] = useState(profile?.wa_phone || '');

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    const handleSave = async () => {
        try {
            await updateUserProfile({
                full_name: name,
                nik,
                username,
                address,
                rt_rw: rtRw,
                wa_phone: phone,
            });

            setAlertConfig({
                title: 'Sukses',
                message: 'Profil berhasil diperbarui!',
                type: 'success',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => {
                            hideAlert();
                            router.back();
                        }
                    }
                ]
            });
            setAlertVisible(true);
        } catch (error: any) {
            setAlertConfig({
                title: 'Gagal',
                message: error.message || 'Gagal memperbarui profil',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        }
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />
            <CustomHeader title="Edit Profil" showBack={true} />

            <KeyboardAwareScrollView
                contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
                enableOnAndroid={true}
                extraScrollHeight={Platform.OS === 'ios' ? 20 : 40}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nama Lengkap</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Nama Lengkap"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nomor Telepon (WA)</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholder="Nomor Telepon WhatsApp"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>NIK</Text>
                        <TextInput
                            style={styles.input}
                            value={nik}
                            onChangeText={setNik}
                            keyboardType="numeric"
                            placeholder="Nomor Induk Kependudukan"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Alamat Lengkap</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Alamat Lengkap"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>RT/RW</Text>
                        <TextInput
                            style={styles.input}
                            value={rtRw}
                            onChangeText={setRtRw}
                            placeholder="Contoh: 001/005"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email (Tidak dapat diubah)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surfaceSubtle, color: colors.textSecondary }]}
                            value={profile?.email || ''}
                            editable={false}
                        />
                    </View>
                </View>

                <CustomButton title="Simpan Perubahan" onPress={handleSave} />
            </KeyboardAwareScrollView>

            <CustomAlertModal
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
            />
        </SafeAreaView>
    );
}
