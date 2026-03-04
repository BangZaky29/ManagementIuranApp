import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, ActivityIndicator, Modal, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAdminProfileViewModel } from './AdminProfileViewModel';
import { AdminProfileStyles as styles } from './AdminProfileStyles';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { Colors } from '../../../constants/Colors';
import Constants from 'expo-constants';
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

export default function AdminProfileScreen() {
    const {
        user,
        handleEditProfile,
        handleLogout,
        handleAvatarUpdate,
        isUploading,
        alertVisible,
        alertConfig,
        hideAlert,
        editModalVisible,
        setEditModalVisible,
        editName,
        setEditName,
        handleSaveProfile,
        handleEditComplexInfo,
        handleSoundSettings,
        isSubmitting
    } = useAdminProfileViewModel();

    const { isDark, toggleTheme, colors } = useTheme();

    const renderInfoItem = (icon: string, label: string, value: string, isVerified = false) => (
        <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name={icon as any} size={20} color="#2196F3" />
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    {isVerified && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, backgroundColor: '#E3F2FD', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                            <Ionicons name="checkmark-circle" size={12} color="#2196F3" />
                            <Text style={{ fontSize: 10, color: '#2196F3', marginLeft: 2, fontWeight: '600' }}>Terverifikasi</Text>
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
            <Text style={[styles.menuText, { flex: 1, color: colors.textPrimary }]}>{label}</Text>
            {isLocked && <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />}
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: '#F5F7FA' }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
            <CustomHeader title="Profil Admin" showBack={false} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Header Card */}
                <View style={[styles.headerCard, { backgroundColor: '#FFF' }]}>
                    <TouchableOpacity onPress={handleAvatarUpdate} disabled={isUploading} style={{ position: 'relative' }}>
                        <View style={[styles.avatarContainer, { borderColor: '#E3F2FD' }]}>
                            {isUploading ? (
                                <ActivityIndicator color={Colors.primary} />
                            ) : user.avatarUrl ? (
                                <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
                            ) : (
                                <Ionicons name="person" size={50} color={Colors.textSecondary} />
                            )}
                        </View>
                        <View style={{
                            position: 'absolute',
                            bottom: 12,
                            right: 0,
                            backgroundColor: Colors.primary,
                            borderRadius: 12,
                            padding: 6,
                            borderWidth: 2,
                            borderColor: '#FFF'
                        }}>
                            <Ionicons name="camera" size={12} color="#FFF" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={[styles.userRole, { backgroundColor: '#E3F2FD', color: '#1565C0' }]}>
                        {user.role} • {user.housingComplexName ? user.housingComplexName : `RT ${user.rt_rw}`}
                    </Text>
                </View>

                {/* Info Section */}
                <Text style={styles.sectionTitle}>Informasi Admin</Text>
                <View style={[styles.infoCard, { backgroundColor: '#FFF' }]}>
                    {renderInfoItem('person-outline', 'Nama Lengkap', user.name)}
                    {renderInfoItem('at-outline', 'Username', user.username)}
                    {renderInfoItem('mail-outline', 'Email', user.email, true)}
                    {renderInfoItem('logo-whatsapp', 'WhatsApp', user.wa_phone)}
                    {renderInfoItem('home-outline', 'Alamat Domisili', user.address)}
                    {renderInfoItem('map-outline', 'RT / RW', user.rt_rw)}
                    {renderInfoItem('shield-checkmark-outline', 'Status', user.isActive ? 'Aktif' : 'Non-Aktif')}
                </View>

                {/* Settings Section */}
                <Text style={styles.sectionTitle}>Pengaturan</Text>
                <View style={[styles.menuContainer, { backgroundColor: '#FFF', borderColor: '#EEE' }]}>
                    {renderMenuItem('create-outline', 'Edit Profil & Data', handleEditProfile)}
                    {renderMenuItem('volume-high-outline', 'Pengaturan Suara', handleSoundSettings, !FeatureFlags.IS_SOUND_SETTINGS_ENABLED)}

                    {/* Dark Mode Toggle */}
                    <Pressable
                        style={styles.menuItem}
                        onPress={() => {
                            if (!FeatureFlags.IS_DARK_MODE_ENABLED) {
                                handleSoundSettings(); // Reusing the same "Under Development" logic
                                return;
                            }
                            toggleTheme();
                        }}
                    >
                        <Ionicons name={isDark ? 'moon' : 'moon-outline'} size={22} color={colors.primary} />
                        <Text style={[styles.menuText, { flex: 1, color: colors.textPrimary }]}>Mode Gelap</Text>
                        {!FeatureFlags.IS_DARK_MODE_ENABLED && <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />}
                        <ThemeToggle isDark={isDark} onToggle={FeatureFlags.IS_DARK_MODE_ENABLED ? toggleTheme : () => { }} colors={colors} />
                    </Pressable>

                    {renderMenuItem('information-circle-outline', 'Edit Informasi Komplek', handleEditComplexInfo)}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                    <Text style={styles.logoutText}>Keluar Admin</Text>
                </TouchableOpacity>

                <Text style={[styles.versionText, { color: Colors.textSecondary }]}>
                    Warlok Admin v{Constants.expoConfig?.version ?? '1.0.0'} (beta)
                </Text>

            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Edit Profil Admin</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nama Lengkap</Text>
                            <TextInput
                                style={styles.input}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Nama Lengkap"
                            />
                        </View>


                        <View style={styles.formActions}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.buttonTextCancel}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSaveProfile}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Simpan</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
