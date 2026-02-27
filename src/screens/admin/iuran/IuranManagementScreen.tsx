import React from 'react';
import {
    View, Text, SafeAreaView, ScrollView, TouchableOpacity,
    StatusBar, StyleSheet, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { countPendingPayments } from '../../../services/paymentConfirmationService';
import { useState, useCallback } from 'react';

interface MenuCard {
    key: string;
    title: string;
    subtitle: string;
    icon: string;
    iconColor: string;
    bgColor: string;
    route: string;
}

export default function IuranManagementScreen() {
    const router = useRouter();
    const [pendingCount, setPendingCount] = useState(0);

    const loadPendingCount = async () => {
        const count = await countPendingPayments();
        setPendingCount(count);
    };

    useFocusEffect(
        useCallback(() => {
            loadPendingCount();
        }, [])
    );

    const menuCards: MenuCard[] = [
        {
            key: 'fees',
            title: 'Kelola Iuran',
            subtitle: 'Tambah, edit, atau nonaktifkan jenis iuran untuk warga komplek Anda.',
            icon: 'create-outline',
            iconColor: '#1565C0',
            bgColor: '#E3F2FD',
            route: '/admin/manage-fees',
        },
        {
            key: 'methods',
            title: 'Metode Pembayaran',
            subtitle: 'Kelola rekening bank, e-wallet, dan QRIS untuk menerima pembayaran.',
            icon: 'card-outline',
            iconColor: '#2E7D32',
            bgColor: '#E8F5E9',
            route: '/admin/payment-methods',
        },
        {
            key: 'confirmation',
            title: 'Konfirmasi Pembayaran',
            subtitle: 'Review dan konfirmasi bukti pembayaran yang dikirim oleh warga.',
            icon: 'checkmark-done-circle-outline',
            iconColor: '#F57F17',
            bgColor: '#FFF8E1',
            route: '/admin/payment-confirmation',
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1B5E20" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Management Iuran</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={22} color="#1565C0" />
                    <Text style={styles.infoText}>
                        Kelola seluruh aspek iuran komplek Anda dari sini — mulai dari jenis iuran, metode pembayaran, hingga konfirmasi.
                    </Text>
                </View>

                {/* Menu Cards */}
                {menuCards.map((card) => (
                    <TouchableOpacity
                        key={card.key}
                        style={styles.card}
                        onPress={() => router.push(card.route as any)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.cardIcon, { backgroundColor: card.bgColor }]}>
                            <Ionicons name={card.icon as any} size={28} color={card.iconColor} />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{card.title}</Text>
                            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                        </View>
                        
                        {card.key === 'confirmation' && pendingCount > 0 && (
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>{pendingCount}</Text>
                            </View>
                        )}

                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7F5' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 48 : 16,
        paddingBottom: 15,
        backgroundColor: '#FFF',
    },
    backButton: { padding: 5, marginRight: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20' },
    content: { padding: 20, paddingBottom: 40 },
    infoBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: '#E3F2FD', padding: 14, borderRadius: 14,
        marginBottom: 20,
    },
    infoText: { flex: 1, fontSize: 13, color: '#1565C0', lineHeight: 18 },
    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 16, padding: 18,
        marginBottom: 12,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
            android: { elevation: 3 },
        }),
    },
    cardIcon: {
        width: 56, height: 56, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 16,
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    cardSubtitle: { fontSize: 12, color: '#888', marginTop: 4, lineHeight: 17 },
    badgeContainer: {
        backgroundColor: '#F44336',
        borderRadius: 12,
        minWidth: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        paddingHorizontal: 6,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
            android: { elevation: 2 },
        }),
    },
    badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
});
