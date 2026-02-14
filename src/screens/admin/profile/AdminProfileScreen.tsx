import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminProfileViewModel } from './AdminProfileViewModel';
import { AdminProfileStyles as styles } from './AdminProfileStyles';
import { CustomHeader } from '../../../components/CustomHeader';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { Colors } from '../../../constants/Colors';
import Constants from 'expo-constants';

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
        editPhone,
        setEditPhone,
        handleSaveProfile,
        isSubmitting
    } = useAdminProfileViewModel();

    const renderInfoItem = (icon: string, label: string, value: string) => (
        <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name={icon as any} size={20} color="#2196F3" />
            </View>
            <View>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );

    const renderMenuItem = (icon: string, label: string, onPress: () => void) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon as any} size={22} color={Colors.textPrimary} />
            <Text style={styles.menuText}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F5F7FA' }]}>
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
                    {renderInfoItem('id-card-outline', 'NIK', user.nik)}
                    {renderInfoItem('mail-outline', 'Email', user.email)}
                    {renderInfoItem('call-outline', 'Nomor HP', user.phone)}
                    {renderInfoItem('logo-whatsapp', 'WhatsApp', user.wa_phone)}
                    {renderInfoItem('home-outline', 'Alamat Domisili', user.address)}
                    {renderInfoItem('map-outline', 'RT / RW', user.rt_rw)}
                    {renderInfoItem('shield-checkmark-outline', 'Status', user.isActive ? 'Aktif' : 'Non-Aktif')}
                </View>

                {/* Settings Section */}
                <Text style={styles.sectionTitle}>Pengaturan</Text>
                <View style={[styles.menuContainer, { backgroundColor: '#FFF', borderColor: '#EEE' }]}>
                    {renderMenuItem('create-outline', 'Edit Profil & Data', handleEditProfile)}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                    <Text style={styles.logoutText}>Keluar Admin</Text>
                </TouchableOpacity>

                <Text style={[styles.versionText, { color: Colors.textSecondary }]}>
                    WargaPintar Admin v{Constants.expoConfig?.version ?? '1.0.0'} (beta)
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

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nomor Telepon</Text>
                            <TextInput
                                style={styles.input}
                                value={editPhone}
                                onChangeText={setEditPhone}
                                placeholder="08xxxxxxxxxx"
                                keyboardType="phone-pad"
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
