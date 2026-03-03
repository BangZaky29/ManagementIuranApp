import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useSoundSettingsViewModel } from './SoundSettingsViewModel';
import { CustomHeader } from '../../components/CustomHeader';
import { createStyles } from './SoundSettingsStyles';

export default function SoundSettingsScreen() {
    const { colors } = useTheme();
    const vm = useSoundSettingsViewModel();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

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
            <Animated.View
                entering={FadeInRight.duration(400)}
                key={value}
                style={[
                    styles.optionContainer,
                    { backgroundColor: isSelected ? colors.primary + '10' : colors.backgroundCard }
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.optionItem,
                        isSelected && { borderColor: colors.primary, borderWidth: 1.5 }
                    ]}
                    onPress={onSelect}
                >
                    <View style={styles.optionInfo}>
                        <View style={[
                            styles.iconCircle,
                            { backgroundColor: isSelected ? colors.primary : colors.background }
                        ]}>
                            <Ionicons
                                name={(value === 'vibrate.wav' ? "pulse" : "musical-note-outline") as any}
                                size={18}
                                color={isSelected ? '#FFF' : colors.textSecondary}
                            />
                        </View>
                        <Text style={[
                            styles.optionLabel,
                            { color: colors.textPrimary },
                            isSelected && { fontWeight: '700' }
                        ]}>
                            {label}
                        </Text>
                    </View>
                    {isSelected && (
                        <Animated.View entering={FadeInDown}>
                            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                        </Animated.View>
                    )}
                </TouchableOpacity>

                {value !== 'default' && (
                    <TouchableOpacity
                        style={[styles.playButton, { borderLeftColor: colors.border }]}
                        onPress={() => vm.playSound(value, type)}
                    >
                        <Ionicons
                            name={isPlaying ? "stop-circle" : "play-circle"}
                            size={32}
                            color={isPlaying ? colors.danger : colors.primary}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>
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
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>Notifikasi Darurat (SOS)</Text>
                        <View>
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
                    </View>
                )}

                <Animated.View entering={FadeInDown.delay(400)} style={[styles.infoBox, { backgroundColor: colors.primary + '05' }]}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        Catatan: Perubahan suara mungkin baru akan terasa setelah aplikasi dijalankan ulang atau build ulang (EAS) untuk memperbarui channel sistem.
                    </Text>
                </Animated.View>
            </ScrollView>

            <View style={styles.overlayContainer}>
                {vm.isSaving && (
                    <View style={styles.loadingToast}>
                        <ActivityIndicator size="small" color="#FFF" />
                        <Text style={styles.overlayText}>Menyimpan...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
