import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../../../contexts/ThemeContext';
import Constants from 'expo-constants';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useProfilViewModel } from './ProfilViewModel';
import { createStyles } from './ProfilStyles';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { FeatureFlags } from '../../../constants/FeatureFlags';

/* ───── Custom Toggle ───── */
const ThemeToggle = ({ isDark, onToggle, colors }: { isDark: boolean; onToggle: () => void; colors: any }) => {
    const translateX = useSharedValue(isDark ? 22 : 2);

    React.useEffect(() => {
        translateX.value = withTiming(isDark ? 22 : 2, { duration: 200 });
    }, [isDark]);

    const thumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Pressable
            onPress={onToggle}
            style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: isDark ? colors.primary : '#D1D5DB',
                justifyContent: 'center',
                padding: 2,
            }}
            hitSlop={10}
        >
            <Animated.View
                style={[
                    {
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: isDark ? colors.accent : colors.surface,
                        elevation: 2,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                    },
                    thumbStyle,
                ]}
            />
        </Pressable>
    );
};

export default function ProfilScreen() {
    const {
        user,
        handleEditProfile,
        handleChangePassword,
        handleHelp,
        handleSoundSettings,
        handleLogout,
        handleAvatarUpdate,
        isUploading,
        alertVisible,
        alertConfig,
        hideAlert
    } = useProfilViewModel();

    const { isDark, toggleTheme, colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

    const renderInfoItem = (icon: string, label: string, value: string, isVerified = false) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Ionicons name={icon as any} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    {isVerified && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, backgroundColor: colors.successBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                            <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                            <Text style={{ fontSize: 10, color: colors.success, marginLeft: 2, fontWeight: '600' }}>Terverifikasi</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );

    const renderMenuItem = (icon: string, label: string, onPress: () => void, isLocked = false) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon as any} size={22} color={colors.primary} />
            <Text style={styles.menuText}>{label}</Text>
            {isLocked && <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />}
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
            <CustomHeader title="Profil Saya" showBack={false} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Profile Header Card */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.headerCard}>
                    <TouchableOpacity onPress={handleAvatarUpdate} disabled={isUploading} style={{ position: 'relative' }}>
                        <View style={styles.avatarContainer}>
                            {isUploading ? (
                                <ActivityIndicator color={colors.primary} />
                            ) : user.avatarUrl ? (
                                <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <Ionicons name="person" size={50} color={colors.textSecondary} />
                            )}
                        </View>
                        {/* Camera Icon Overlay - Moved outside to prevent clipping */}
                        <View style={{
                            position: 'absolute',
                            bottom: 16,
                            right: 0,
                            backgroundColor: colors.primary,
                            borderRadius: 16,
                            padding: 6,
                            borderWidth: 2,
                            borderColor: colors.surface
                        }}>
                            <Ionicons name="camera" size={14} color={colors.textWhite} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userRole}>
                        {user.housingComplexName ? `${user.housingComplexName} | ${user.rt_rw}` : `Warga RT ${user.rt_rw}`}
                    </Text>
                </Animated.View>

                {/* Personal Info */}
                <Text style={styles.sectionTitle}>Informasi Pribadi</Text>
                <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.infoCard}>
                    {renderInfoItem('card-outline', 'NIK', user.nik)}
                    {renderInfoItem('person-outline', 'Username', user.username)}
                    {renderInfoItem('home-outline', 'Alamat', user.address)}
                    {renderInfoItem('mail-outline', 'Email', user.email, true)}
                    {renderInfoItem('logo-whatsapp', 'WhatsApp', user.phone)}
                </Animated.View>

                {/* Settings Menu */}
                <Text style={styles.sectionTitle}>Pengaturan</Text>
                <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.menuContainer}>
                    {renderMenuItem('create-outline', 'Edit Profil', handleEditProfile)}
                    {renderMenuItem('lock-closed-outline', 'Ganti Password', handleChangePassword)}
                    {renderMenuItem('volume-high-outline', 'Pengaturan Suara', handleSoundSettings, !FeatureFlags.IS_SOUND_SETTINGS_ENABLED)}
                    {renderMenuItem('help-circle-outline', 'Bantuan', handleHelp)}

                    {/* Dark Mode Toggle — using Pressable-based custom toggle */}
                    <Pressable
                        style={styles.menuItem}
                        onPress={() => {
                            if (!FeatureFlags.IS_DARK_MODE_ENABLED) {
                                handleSoundSettings(); // Reusing the same "Under Development" logic if possible, or direct alert
                                return;
                            }
                            toggleTheme();
                        }}
                    >
                        <Ionicons name={isDark ? 'moon' : 'moon-outline'} size={22} color={colors.primary} />
                        <Text style={styles.menuText}>Mode Gelap</Text>
                        {!FeatureFlags.IS_DARK_MODE_ENABLED && <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />}
                        <ThemeToggle isDark={isDark} onToggle={FeatureFlags.IS_DARK_MODE_ENABLED ? toggleTheme : () => { }} colors={colors} />
                    </Pressable>
                </Animated.View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                    <Text style={styles.logoutText}>Keluar Aplikasi</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>
                    Versi {Constants.expoConfig?.version ?? '1.0.0'} (beta)
                </Text>

            </ScrollView>

            {/* Custom Alert Modal */}
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
