import { useTheme } from '../../../contexts/ThemeContext';
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, ActivityIndicator, Modal, TextInput, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { useAdminProfileViewModel } from './AdminProfileViewModel';
import { createStyles } from './AdminProfileStyles';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
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
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
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
        isSubmitting,
        redeemModalVisible,
        setRedeemModalVisible,
        redeemCode,
        setRedeemCode,
        isRedeeming,
        handleOpenRedeemModal,
        submitRedeemCode,
        availablePlans,
        isLoadingPlans,
        plansModalVisible,
        setPlansModalVisible
    } = useAdminProfileViewModel();

    const { isDark, toggleTheme } = useTheme();

    const renderInfoItem = (icon: string, label: string, value: string, isVerified = false) => (
        <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: colors.primarySubtle }]}>
                <Ionicons name={icon as any} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    {isVerified && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, backgroundColor: colors.primarySubtle, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                            <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                            <Text style={{ fontSize: 10, color: colors.primary, marginLeft: 2, fontWeight: '600' }}>Terverifikasi</Text>
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
        <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
            <CustomHeader title="Profil Admin" showBack={false} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Header Card */}
                <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity onPress={handleAvatarUpdate} disabled={isUploading} style={{ position: 'relative' }}>
                        <View style={[styles.avatarContainer, { borderColor: colors.primarySubtle }]}>
                            {isUploading ? (
                                <ActivityIndicator color={colors.primary} />
                            ) : user.avatarUrl ? (
                                <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
                            ) : (
                                <Ionicons name="person" size={50} color={colors.textSecondary} />
                            )}
                        </View>
                        <View style={{
                            position: 'absolute',
                            bottom: 12,
                            right: 0,
                            backgroundColor: colors.primary,
                            borderRadius: 12,
                            padding: 6,
                            borderWidth: 2,
                            borderColor: colors.surface
                        }}>
                            <Ionicons name="camera" size={12} color="#FFF" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={[styles.userRole, { backgroundColor: colors.primarySubtle, color: colors.primary }]}>
                        {user.role} • {user.housingComplexName ? user.housingComplexName : `RT ${user.rt_rw}`}
                    </Text>
                </View>

                {/* Info Section */}
                <Text style={styles.sectionTitle}>Informasi Admin</Text>
                <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity onPress={() => setPlansModalVisible(true)} activeOpacity={0.7}>
                        {renderInfoItem('star-outline', 'Paket Langganan', user.activePlanName, true)}
                    </TouchableOpacity>
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
                <View style={[styles.menuContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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

                    {renderMenuItem('key-outline', 'Klaim Kode Referral', handleOpenRedeemModal)}
                    {renderMenuItem('information-circle-outline', 'Edit Informasi Komplek', handleEditComplexInfo)}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                    <Text style={styles.logoutText}>Keluar Admin</Text>
                </TouchableOpacity>

                <Text style={[styles.versionText, { color: colors.textSecondary }]}>
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

            {/* Redeem Code Modal */}
            <Modal
                visible={redeemModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setRedeemModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>Masukkan Kode Referral</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 15 }}>
                            Dapatkan kode referral dari halaman utama Warlok Website untuk mengaktifkan fitur tambahan.
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Kode Berlangganan</Text>
                            <TextInput
                                style={styles.input}
                                value={redeemCode}
                                onChangeText={setRedeemCode}
                                placeholder="Contoh: WLK-PRO-ABC123"
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.formActions}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setRedeemModalVisible(false)}
                            >
                                <Text style={styles.buttonTextCancel}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={submitRedeemCode}
                                disabled={isRedeeming}
                            >
                                {isRedeeming ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Aktifkan</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Available Plans Modal (Dynamic from DB) */}
            <Modal
                visible={plansModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setPlansModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.formContainer, { maxHeight: '80%', paddingBottom: 20 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={styles.formTitle}>Daftar Paket Warlok</Text>
                            <TouchableOpacity onPress={() => setPlansModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {isLoadingPlans ? (
                            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {availablePlans.map((plan) => (
                                    <View key={plan.id} style={{ 
                                        backgroundColor: colors.background, 
                                        borderRadius: 16, 
                                        padding: 16, 
                                        marginBottom: 12,
                                        borderWidth: plan.name === user.activePlanName ? 2 : 1,
                                        borderColor: plan.name === user.activePlanName ? colors.primary : colors.border
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{plan.display_name}</Text>
                                            {plan.is_popular && (
                                                <View style={{ backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                                    <Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>POPULER</Text>
                                                </View>
                                            )}
                                        </View>
                                        
                                        <Text style={{ fontSize: 18, color: colors.primary, fontWeight: 'bold', marginTop: 4 }}>
                                            {plan.price === 0 ? 'Gratis' : `Rp ${plan.price.toLocaleString('id-ID')}`}
                                            {plan.price > 0 && <Text style={{ fontSize: 12, fontWeight: 'normal', color: colors.textSecondary }}> / bln</Text>}
                                        </Text>

                                        <View style={{ marginTop: 10, gap: 5 }}>
                                            {(plan.features_list || []).map((feat: string, i: number) => (
                                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                                                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 6 }}>{feat}</Text>
                                                </View>
                                            ))}
                                        </View>
                                        
                                        {plan.name === user.activePlanName && (
                                            <View style={{ marginTop: 12, backgroundColor: colors.successBg, padding: 8, borderRadius: 8, alignItems: 'center' }}>
                                                <Text style={{ color: colors.success, fontSize: 12, fontWeight: 'bold' }}>Paket Anda Saat Ini</Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                                
                                <Text style={{ fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 10, fontStyle: 'italic' }}>
                                    Lakukan perpanjangan paket melalui website warlok-website.nuansasolution.id menggunakan browser HP Anda.
                                </Text>
                            </ScrollView>
                        )}
                        
                        <TouchableOpacity
                            style={{
                                backgroundColor: colors.primary,
                                padding: 16,
                                borderRadius: 12,
                                marginTop: 15,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row'
                            }}
                            onPress={() => Linking.openURL('https://warlok-website.nuansasolution.id/')}
                        >
                            <Ionicons name="globe-outline" size={20} color="#FFF" style={{ marginRight: 10 }} />
                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Buka Website Warlok</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                padding: 12,
                                marginTop: 8,
                                alignItems: 'center'
                            }}
                            onPress={() => setPlansModalVisible(false)}
                        >
                            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Tutup</Text>
                        </TouchableOpacity>
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
