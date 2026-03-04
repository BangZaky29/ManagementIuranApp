import React, { useState } from 'react';
import { View, Text, TextInput, StatusBar, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { CustomButton } from '../../../components/common/CustomButton';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';

export default function EditSecurityProfileScreen() {
    const router = useRouter();
    const { profile, updateUserProfile } = useAuth();

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
            <StatusBar barStyle="dark-content" backgroundColor="#F0F4F8" />
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
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Alamat Lengkap</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Alamat Lengkap"
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
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email (Tidak dapat diubah)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: '#EEEEEE', color: '#999' }]}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    content: {
        padding: 20,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#BBDEFB',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#0D47A1',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#333',
        backgroundColor: '#FAFAFA',
    },
});
