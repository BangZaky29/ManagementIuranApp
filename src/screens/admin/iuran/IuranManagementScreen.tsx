import { useTheme } from '../../../contexts/ThemeContext';
import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StatusBar, StyleSheet, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemeColors } from '../../../theme/AppTheme';
import { countPendingPayments } from '../../../services/payment';
import { useState, useCallback } from 'react';
import { CustomHeader } from '../../../components/common/CustomHeader';

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
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
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
            iconColor: colors.info,
            bgColor: colors.infoBg,
            route: '/admin/manage-fees',
        },
        {
            key: 'methods',
            title: 'Metode Pembayaran',
            subtitle: 'Kelola rekening bank, e-wallet, dan QRIS untuk menerima pembayaran.',
            icon: 'card-outline',
            iconColor: colors.success,
            bgColor: colors.successBg,
            route: '/admin/payment-methods',
        },
        {
            key: 'confirmation',
            title: 'Konfirmasi Pembayaran',
            subtitle: 'Review dan konfirmasi bukti pembayaran yang dikirim oleh warga.',
            icon: 'checkmark-done-circle-outline',
            iconColor: colors.warning,
            bgColor: colors.warningBg,
            route: '/admin/payment-confirmation',
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />
            <CustomHeader title="Management Iuran" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={22} color={colors.info} />
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

                        <Ionicons name="chevron-forward" size={20} color={colors.border} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    infoBanner: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: colors.infoBg, padding: 14, borderRadius: 14,
        marginBottom: 20,
    },
    infoText: { flex: 1, fontSize: 13, color: colors.info, lineHeight: 18 },
    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface, borderRadius: 16, padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            android: { elevation: 2 },
        }),
    },
    cardIcon: {
        width: 56, height: 56, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 16,
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    cardSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 17 },
    badgeContainer: {
        backgroundColor: colors.danger,
        borderRadius: 12,
        minWidth: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
});
