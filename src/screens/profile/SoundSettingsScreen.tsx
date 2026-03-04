import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useSoundSettingsViewModel } from './SoundSettingsViewModel';
import { CustomHeader } from '../../components/common/CustomHeader';
import { createStyles } from './SoundSettingsStyles';
import Constants from 'expo-constants';

export default function SoundSettingsScreen() {
    const { colors } = useTheme();
    const vm = useSoundSettingsViewModel();
    const styles = useMemo(() => createStyles(colors), [colors]);

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

    const renderSoundOption = (label: string, value: string, currentValue: string, onSelect: () => void, type: 'notif' | 'alert', index: number) => {
        const isSelected = value === currentValue;
        const isPlaying = vm.playingValue === value;

        return (
            <Animated.View
                entering={FadeInRight.delay(index * 50).duration(400)}
                key={value}
                style={[
                    styles.optionContainer,
                    {
                        backgroundColor: isSelected ? colors.primary + '10' : colors.backgroundCard,
                        borderColor: isSelected ? colors.primary : 'transparent',
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.optionItem}
                    onPress={onSelect}
                    activeOpacity={0.7}
                >
                    <View style={styles.optionInfo}>
                        <View style={[
                            styles.iconCircle,
                            { backgroundColor: isSelected ? colors.primary : colors.background }
                        ]}>
                            <Ionicons
                                name={(value === 'vibrate.wav' ? "pulse" : "musical-note") as any}
                                size={18}
                                color={isSelected ? '#FFF' : colors.textSecondary}
                            />
                        </View>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.optionLabel,
                                { color: isSelected ? colors.primary : colors.textPrimary },
                                isSelected && { fontWeight: '700' }
                            ]}
                        >
                            {label}
                        </Text>
                    </View>
                    {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => vm.playSound(value, type)}
                    activeOpacity={0.6}
                >
                    <Ionicons
                        name={isPlaying ? "stop-circle" : "play-circle"}
                        size={32}
                        color={isPlaying ? colors.danger : colors.primary}
                    />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader title="Pengaturan Suara" showBack={true} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifikasi Umum</Text>

                <View style={styles.section}>
                    <View style={styles.settingRow}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Getaran</Text>
                            <Text style={[styles.settingSubLabel, { color: colors.textSecondary }]}>Aktifkan getar saat notifikasi masuk</Text>
                        </View>
                        <Switch
                            value={vm.settings?.vibration_enabled}
                            onValueChange={vm.toggleVibration}
                            trackColor={{ false: '#D1D1D1', true: colors.primary + '80' }}
                            thumbColor={vm.settings?.vibration_enabled ? colors.primary : '#F4F3F4'}
                        />
                    </View>

                    <Text style={[styles.subSectionTitle, { color: colors.textSecondary }]}>Suara Pesan Masuk</Text>
                    {vm.availableNotifSounds.map((sound, index) => (
                        renderSoundOption(sound.label, sound.value, vm.settings?.notif_sound || '', () => vm.updateSound('notif', sound.value), 'notif', index)
                    ))}
                </View>

                {vm.isAdminOrSecurity && (
                    <View style={styles.section}>
                        <View style={styles.sosSectionHeader}>
                            <Ionicons name="warning" size={20} color={colors.danger} />
                            <Text style={[styles.subSectionTitle, { color: colors.danger, marginBottom: 0 }]}>
                                Notifikasi Darurat (SOS)
                            </Text>
                        </View>

                        {vm.availableAlertSounds.map((sound, index) => (
                            renderSoundOption(sound.label, sound.value, vm.settings?.alert_sound || '', () => vm.updateSound('alert', sound.value), 'alert', index + 5)
                        ))}

                        <View style={styles.durationContainer}>
                            <Text style={[styles.durationLabel, { color: colors.textSecondary }]}>
                                Durasi Perulangan Alert
                            </Text>
                            <View style={styles.durationPresets}>
                                {[15, 30, 45, 60].map((sec) => (
                                    <TouchableOpacity
                                        key={sec}
                                        onPress={() => vm.updateAlertDuration(sec)}
                                        style={[
                                            styles.durationChip,
                                            { backgroundColor: colors.backgroundCard },
                                            vm.settings?.alert_duration === sec && {
                                                backgroundColor: colors.danger + '20',
                                                borderColor: colors.danger
                                            }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.durationChipText,
                                            { color: colors.textPrimary },
                                            vm.settings?.alert_duration === sec && { color: colors.danger, fontWeight: '700' }
                                        ]}>
                                            {sec}s
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {__DEV__ && (
                    <View style={[styles.infoBox, { backgroundColor: colors.primary + '05' }]}>
                        <Ionicons name="information-circle" size={20} color={colors.primary} />
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            Perubahan suara mungkin baru akan aktif sepenuhnya setelah aplikasi dimulai ulang atau melalui proses build ulang EAS.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {vm.isSaving && (
                <View style={styles.overlayContainer}>
                    <View style={styles.loadingToast}>
                        <ActivityIndicator size="small" color="#FFF" />
                        <Text style={styles.overlayText}>Menyimpan...</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}