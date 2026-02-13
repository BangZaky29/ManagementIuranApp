import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminHomeViewModel } from './AdminHomeViewModel';
import { styles } from './AdminHomeStyles';

export default function AdminHomeScreen() {
    const { user, handleLogout, navigateToManageResidents } = useAdminHomeViewModel();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="shield-checkmark" size={80} color="#1B5E20" />
                <Text style={styles.title}>Admin Dashboard</Text>
                <Text style={styles.subtitle}>Selamat datang, {user?.user_metadata?.full_name || 'Admin'}</Text>

                <View style={styles.card}>
                    <Text style={styles.infoText}>Kelola Data Warga</Text>
                    <Text style={[styles.infoText, { fontSize: 13, marginBottom: 20 }]}>
                        Tambah data warga baru dan generate akses token untuk pendaftaran.
                    </Text>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={navigateToManageResidents}
                    >
                        <Ionicons name="people" size={20} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.actionText}>Kelola Warga</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Keluar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
