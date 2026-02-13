import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminHomeScreen() {
    const { signOut, user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.replace('/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Ionicons name="shield-checkmark" size={80} color="#1B5E20" />
                <Text style={styles.title}>Admin Dashboard</Text>
                <Text style={styles.subtitle}>Selamat datang, {user?.user_metadata?.full_name || 'Admin'}</Text>

                <View style={styles.card}>
                    <Text style={styles.infoText}>Modul Admin sedang dalam pengembangan.</Text>
                    <Text style={styles.infoText}>Nantikan fitur manajemen warga, iuran, dan laporan di update berikutnya.</Text>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Keluar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F5E9',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1B5E20',
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#2E7D32',
        marginBottom: 40,
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 40,
    },
    infoText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 24,
    },
    logoutButton: {
        backgroundColor: '#C62828',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    logoutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
