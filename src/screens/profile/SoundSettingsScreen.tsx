import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useSoundSettingsViewModel } from './SoundSettingsViewModel';
import { CustomHeader } from '../../components/CustomHeader';

export default function SoundSettingsScreen() {
    const { colors } = useTheme();
    const vm = useSoundSettingsViewModel();

    if (vm.isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <CustomHeader title="Pengaturan Suara" showBack={true} />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    const renderSoundOption = (label: string, value: string, currentValue: string, onSelect: () => void, type: 'notif' | 'alert') => {
        const isSelected = value === currentValue;
        const isPlaying = vm.playingValue === value;

        return (
            <View key={value} style={styles.optionContainer}>
                <TouchableOpacity
                    style={[
                        styles.optionItem,
                        { backgroundColor: colors.backgroundCard },
                        isSelected && { borderColor: colors.primary, borderWidth: 1 }
                    ]}
                    onPress={onSelect}
                >
                    <View style={styles.optionInfo}>
                        <Ionicons
                            name={(value === 'vibrate.wav' ? "pulse" : "musical-note-outline") as any}
                            size={20}
                            color={isSelected ? colors.primary : colors.textSecondary}
                        />
                        <Text style={[styles.optionLabel, { color: colors.textPrimary }, isSelected && { fontWeight: 'bold' }]}>
                            {label}
                        </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>

                {value !== 'default' && (
                    <TouchableOpacity
                        style={[styles.playButton, { borderLeftColor: colors.border }]}
                        onPress={() => vm.playSound(value, type)}
                    >
                        <Ionicons
                            name={isPlaying ? "stop-circle" : "play-circle-outline"}
                            size={28}
                            color={isPlaying ? colors.danger : colors.primary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader title="Pengaturan Suara" showBack={true} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifikasi Umum</Text>
                <View style={styles.section}>
                    <View style={[styles.settingRow, { backgroundColor: colors.backgroundCard }]}>
                        <View>
                            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Getaran</Text>
                            <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>Aktifkan getar saat notifikasi masuk</Text>
                        </View>
                        <Switch
                            value={vm.settings?.vibration_enabled}
                            onValueChange={vm.toggleVibration}
                            trackColor={{ false: '#767577', true: colors.primary }}
                        />
                    </View>

                    <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>Suara Pesan Masuk</Text>
                    {vm.availableNotifSounds.map(sound => (
                        renderSoundOption(
                            sound.label,
                            sound.value,
                            vm.settings?.notif_sound || '',
                            () => vm.updateSound('notif', sound.value),
                            'notif'
                        )
                    ))}
                </View>

                {vm.isAdminOrSecurity && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>Notifikasi Darurat (SOS)</Text>
                        <View style={styles.section}>
                            <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>Suara Alert Darurat</Text>
                            {vm.availableAlertSounds.map(sound => (
                                renderSoundOption(
                                    sound.label,
                                    sound.value,
                                    vm.settings?.alert_sound || '',
                                    () => vm.updateSound('alert', sound.value),
                                    'alert'
                                )
                            ))}
                        </View>
                    </>
                )}

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        Catatan: Perubahan suara mungkin baru akan terasa setelah aplikasi dijalankan ulang atau build ulang (EAS) untuk memastikan aset native terdaftar dengan benar.
                    </Text>
                </View>
            </ScrollView>

            {vm.isSaving && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.overlayText}>Menyimpan...</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16 },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
    subSectionTitle: { fontSize: 12, marginBottom: 8, marginTop: 8, marginLeft: 4 },
    section: { marginBottom: 16 },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12
    },
    settingLabel: { fontSize: 16, fontWeight: '600' },
    settingSubLabel: { fontSize: 12, marginTop: 2 },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        flex: 1
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    playButton: {
        paddingHorizontal: 15,
        height: '100%',
        justifyContent: 'center',
        borderLeftWidth: 1,
    },
    optionInfo: { flexDirection: 'row', alignItems: 'center' },
    optionLabel: { fontSize: 15, marginLeft: 12 },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        marginTop: 20,
        alignItems: 'flex-start'
    },
    infoText: { fontSize: 12, flex: 1, marginLeft: 8, lineHeight: 18 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    overlayText: { color: '#FFF', marginLeft: 10, fontWeight: 'bold' }
});
