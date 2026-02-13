import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Pressable, Image, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../../../contexts/ThemeContext';
import { CustomHeader } from '../../../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useProfilViewModel } from './ProfilViewModel';
import { ProfilStyles as styles } from './ProfilStyles';
import { CustomAlertModal } from '../../../components/CustomAlertModal';

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
                backgroundColor: isDark ? colors.green3 : '#D1D5DB',
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
                        backgroundColor: isDark ? colors.accent : '#FFFFFF',
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
        handleLogout,
        handleAvatarUpdate,
        isUploading,
        alertVisible,
        alertConfig,
        hideAlert
    } = useProfilViewModel();

    const { isDark, toggleTheme, colors } = useTheme();

    const renderInfoItem = (icon: string, label: string, value: string) => (
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.infoIconBox, { backgroundColor: colors.green1 }]}>
                <Ionicons name={icon as any} size={20} color={colors.green5} />
            </View>
            <View>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value}</Text>
            </View>
        </View>
    );

    const renderMenuItem = (icon: string, label: string, onPress: () => void) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon as any} size={22} color={colors.green5} />
            <Text style={[styles.menuText, { color: colors.green5 }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.green1} />
            <CustomHeader title="Profil Saya" showBack={false} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Profile Header Card */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={[styles.headerCard, { backgroundColor: colors.backgroundCard }]}>
                    <TouchableOpacity onPress={handleAvatarUpdate} disabled={isUploading} style={{ position: 'relative' }}>
                        <View style={[styles.avatarContainer, { backgroundColor: colors.green1, borderColor: colors.border, overflow: 'hidden' }]}>
                            {isUploading ? (
                                <ActivityIndicator color={colors.primary} />
                            ) : user.avatarUrl ? (
                                <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <Ionicons name="person" size={50} color={colors.green4} />
                            )}
                        </View>
                        {/* Camera Icon Overlay - Moved outside to prevent clipping */}
                        <View style={{
                            position: 'absolute',
                            bottom: 16, // Adjusting for the marginBottom of avatarContainer if needed, or just aligning to visual bottom
                            right: 0,
                            backgroundColor: colors.primary,
                            borderRadius: 16,
                            padding: 6,
                            borderWidth: 2,
                            borderColor: colors.backgroundCard
                        }}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.userName, { color: colors.green5 }]}>{user.name}</Text>
                    <Text style={[styles.userRole, { color: colors.green4, backgroundColor: colors.green1 }]}>Warga RT {user.rt_rw}</Text>
                </Animated.View>

                {/* Personal Info */}
                <Text style={[styles.sectionTitle, { color: colors.green5 }]}>Informasi Pribadi</Text>
                <Animated.View entering={FadeInDown.delay(200).duration(500)} style={[styles.infoCard, { backgroundColor: colors.backgroundCard }]}>
                    {renderInfoItem('home-outline', 'Alamat', user.address)}
                    {renderInfoItem('mail-outline', 'Email', user.email)}
                    {renderInfoItem('call-outline', 'Nomor Telepon', user.phone)}
                </Animated.View>

                {/* Settings Menu */}
                <Text style={[styles.sectionTitle, { color: colors.green5 }]}>Pengaturan</Text>
                <Animated.View entering={FadeInDown.delay(300).duration(500)} style={[styles.menuContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.green5 }]}>
                    {renderMenuItem('create-outline', 'Edit Profil', handleEditProfile)}
                    {renderMenuItem('lock-closed-outline', 'Ganti Password', handleChangePassword)}
                    {renderMenuItem('help-circle-outline', 'Bantuan', handleHelp)}

                    {/* Dark Mode Toggle — using Pressable-based custom toggle */}
                    <Pressable
                        style={styles.menuItem}
                        onPress={toggleTheme}
                    >
                        <Ionicons name={isDark ? 'moon' : 'moon-outline'} size={22} color={colors.green5} />
                        <Text style={[styles.menuText, { flex: 1, color: colors.green5 }]}>Mode Gelap</Text>
                        <ThemeToggle isDark={isDark} onToggle={toggleTheme} colors={colors} />
                    </Pressable>
                </Animated.View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                    <Text style={[styles.logoutText, { color: colors.danger }]}>Keluar Aplikasi</Text>
                </TouchableOpacity>

                <Text style={[styles.versionText, { color: colors.textSecondary }]}>Versi 1.0.0 (Beta)</Text>

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
