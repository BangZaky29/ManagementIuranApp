import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useSecurityProfileViewModel } from './SecurityProfileViewModel';
import { styles } from './SecurityProfileStyles';
import { CustomAlertModal } from '../../../components/CustomAlertModal';

export default function SecurityProfileScreen() {
    const {
        user,
        handleEditProfile,
        handleChangePassword,
        handleSoundSettings,
        handleLogout,
        handleAvatarUpdate,
        isUploading,
        alertVisible,
        alertConfig,
        hideAlert
    } = useSecurityProfileViewModel();

    const renderInfoItem = (icon: string, label: string, value: string) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Ionicons name={icon as any} size={20} color="#0D47A1" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );

    const renderMenuItem = (icon: string, label: string, onPress: () => void) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon as any} size={22} color="#0D47A1" />
            <Text style={styles.menuText}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F0F4F8" />

            {/* Header Aligned with Guest Book */}
            <View style={styles.header}>
                <Text style={styles.title}>Profil Petugas</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Profile Header Card */}
                <View style={styles.headerCard}>
                    <TouchableOpacity onPress={handleAvatarUpdate} disabled={isUploading} style={{ position: 'relative' }}>
                        <View style={styles.avatarContainer}>
                            {isUploading ? (
                                <ActivityIndicator color="#0D47A1" />
                            ) : user.avatarUrl ? (
                                <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
                            ) : (
                                <Ionicons name="person" size={50} color="#90CAF9" />
                            )}
                        </View>
                        {/* Camera Icon Overlay */}
                        <View style={{
                            position: 'absolute', bottom: 16, right: 0,
                            backgroundColor: '#0D47A1', borderRadius: 16, padding: 6,
                            borderWidth: 2, borderColor: '#FFF'
                        }}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userRole}>Security</Text>
                </View>

                {/* Personal Info */}
                <Text style={styles.sectionTitle}>Informasi Pribadi</Text>
                <View style={styles.infoCard}>
                    {renderInfoItem('card-outline', 'NIK', user.nik)}
                    {renderInfoItem('person-outline', 'Username', user.username)}
                    {renderInfoItem('home-outline', 'Alamat', user.address)}
                    {renderInfoItem('map-outline', 'RT/RW', user.rt_rw)}
                    {renderInfoItem('mail-outline', 'Email', user.email)}
                    {renderInfoItem('logo-whatsapp', 'WhatsApp', user.phone)}
                </View>

                {/* Settings Menu */}
                <Text style={styles.sectionTitle}>Pengaturan</Text>
                <View style={styles.menuContainer}>
                    {renderMenuItem('create-outline', 'Edit Profil', handleEditProfile)}
                    {renderMenuItem('lock-closed-outline', 'Ganti Password', handleChangePassword)}
                    {renderMenuItem('volume-high-outline', 'Pengaturan Suara', handleSoundSettings)}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#C62828" />
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
