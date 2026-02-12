import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Colors } from '../../constants/Colors';
import { CustomHeader } from '../../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useProfilViewModel } from './ProfilViewModel';
import { ProfilStyles as styles } from './ProfilStyles';
import { CustomAlertModal } from '../../components/CustomAlertModal';

export default function ProfilScreen() {
    const {
        user,
        handleEditProfile,
        handleChangePassword,
        handleHelp,
        handleLogout,
        alertVisible,
        alertConfig,
        hideAlert
    } = useProfilViewModel();

    const renderInfoItem = (icon: string, label: string, value: string) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Ionicons name={icon as any} size={20} color={Colors.green5} />
            </View>
            <View>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );

    const renderMenuItem = (icon: string, label: string, onPress: () => void) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon as any} size={22} color={Colors.green5} />
            <Text style={styles.menuText}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
            <CustomHeader title="Profil Saya" showBack={false} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Profile Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={50} color={Colors.green4} />
                    </View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userRole}>Warga RT {user.rt_rw}</Text>
                </View>

                {/* Personal Info */}
                <Text style={styles.sectionTitle}>Informasi Pribadi</Text>
                <View style={styles.infoCard}>
                    {renderInfoItem('home-outline', 'Alamat', user.address)}
                    {renderInfoItem('mail-outline', 'Email', user.email)}
                    {renderInfoItem('call-outline', 'Nomor Telepon', user.phone)}
                </View>

                {/* Settings Menu */}
                <Text style={styles.sectionTitle}>Pengaturan</Text>
                <View style={styles.menuContainer}>
                    {renderMenuItem('create-outline', 'Edit Profil', handleEditProfile)}
                    {renderMenuItem('lock-closed-outline', 'Ganti Password', handleChangePassword)}
                    {renderMenuItem('help-circle-outline', 'Bantuan', handleHelp)}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
                    <Text style={styles.logoutText}>Keluar Aplikasi</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Versi 1.0.0 (Beta)</Text>

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
