import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StatusBar, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { CustomButton } from '../../../components/common/CustomButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { ThemeColors } from '../../../theme/AppTheme';

import { CustomAlertModal } from '../../../components/common/CustomAlertModal';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[]
    });

    const hideAlert = () => setAlertVisible(false);

    const handleSave = () => {
        if (newPassword !== confirmPassword) {
            setAlertConfig({
                title: 'Gagal',
                message: 'Konfirmasi password tidak cocok.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }

        setAlertConfig({
            title: 'Sukses',
            message: 'Password berhasil diubah!',
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
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
            <CustomHeader title="Ganti Password" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password Lama</Text>
                        <TextInput
                            style={styles.input}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            secureTextEntry
                            placeholder="Masukkan password lama"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password Baru</Text>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            placeholder="Masukkan password baru"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Konfirmasi Password Baru</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="Ulangi password baru"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>
                </View>

                <CustomButton title="Simpan Password" onPress={handleSave} />
            </ScrollView>

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
        color: colors.textPrimary,
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
