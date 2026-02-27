import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, TouchableOpacity,
    StatusBar, ActivityIndicator, StyleSheet, Image, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { formatDateTimeSafe } from '../../../utils/dateUtils';
import {
    PendingPaymentItem,
    fetchPaymentsByStatus,
} from '../../../services/paymentConfirmationService';

type FilterStatus = 'pending' | 'paid' | 'rejected' | 'all';

export default function PaymentConfirmationListScreen() {
    const router = useRouter();
    const [payments, setPayments] = useState<PendingPaymentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterStatus>('pending');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchPaymentsByStatus(activeFilter);
            setPayments(data);
        } catch (error) {
            console.error('Failed to load payments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [activeFilter]);

    useEffect(() => { loadData(); }, [loadData]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return formatDateTimeSafe(dateStr);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return Colors.warning;
            case 'paid': return '#2E7D32';
            case 'rejected': return Colors.danger;
            default: return Colors.textSecondary;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Menunggu';
            case 'paid': return 'Lunas';
            case 'rejected': return 'Ditolak';
            default: return status;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'pending': return '#FFF8E1';
            case 'paid': return '#E8F5E9';
            case 'rejected': return '#FFEBEE';
            default: return '#F5F5F5';
        }
    };

    const filters: { key: FilterStatus; label: string; icon: string }[] = [
        { key: 'pending', label: 'Pending', icon: 'time-outline' },
        { key: 'paid', label: 'Lunas', icon: 'checkmark-circle-outline' },
        { key: 'rejected', label: 'Ditolak', icon: 'close-circle-outline' },
        { key: 'all', label: 'Semua', icon: 'list-outline' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Konfirmasi Pembayaran</Text>
            </View>

            {/* Filter Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterTab, activeFilter === f.key && styles.filterTabActive]}
                        onPress={() => setActiveFilter(f.key)}
                    >
                        <Ionicons
                            name={f.icon as any}
                            size={16}
                            color={activeFilter === f.key ? Colors.green5 : Colors.textSecondary}
                        />
                        <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.green3} />
                </View>
            ) : payments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={64} color={Colors.textSecondary} />
                    <Text style={styles.emptyTitle}>Tidak Ada Pembayaran</Text>
                    <Text style={styles.emptySubtitle}>
                        {activeFilter === 'pending'
                            ? 'Belum ada pembayaran yang menunggu konfirmasi.'
                            : 'Tidak ada data pembayaran untuk filter ini.'}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={false} onRefresh={loadData} colors={[Colors.green3]} />}
                >
                    {payments.map((payment) => (
                        <TouchableOpacity
                            key={payment.id}
                            style={styles.paymentCard}
                            onPress={() => router.push({
                                pathname: '/admin/payment-confirmation/[id]',
                                params: { id: payment.id },
                            })}
                            activeOpacity={0.7}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.userInfo}>
                                    {payment.profiles?.avatar_url ? (
                                        <Image source={{ uri: payment.profiles.avatar_url }} style={styles.avatar} />
                                    ) : (
                                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                            <Ionicons name="person" size={18} color={Colors.green4} />
                                        </View>
                                    )}
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.userName} numberOfLines={1}>
                                            {payment.profiles?.full_name || 'Warga'}
                                        </Text>
                                        <Text style={styles.userAddress} numberOfLines={1}>
                                            {payment.profiles?.address || '-'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusBg(payment.status) }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                                        {getStatusLabel(payment.status)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>Iuran</Text>
                                    <Text style={styles.cardValue}>{payment.fees?.name || '-'}</Text>
                                </View>
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>Jumlah</Text>
                                    <Text style={styles.cardAmount}>{formatCurrency(payment.amount)}</Text>
                                </View>
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>Metode</Text>
                                    <Text style={styles.cardValue}>{payment.payment_method || '-'}</Text>
                                </View>
                                <View style={styles.cardRow}>
                                    <Text style={styles.cardLabel}>Tanggal</Text>
                                    <Text style={styles.cardValue}>{formatDate(payment.created_at)}</Text>
                                </View>
                            </View>

                            {payment.proof_url && (
                                <View style={styles.proofIndicator}>
                                    <Ionicons name="image-outline" size={14} color={Colors.green4} />
                                    <Text style={styles.proofText}>Bukti terlampir</Text>
                                </View>
                            )}

                            <View style={styles.cardFooter}>
                                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.green1 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15,
    },
    backButton: { padding: 5, marginRight: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.green5 },
    filterContainer: {
        maxHeight: 50, paddingHorizontal: 16, marginBottom: 8,
    },
    filterTab: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: Colors.white, marginRight: 8,
        borderWidth: 1, borderColor: Colors.green2,
    },
    filterTabActive: {
        backgroundColor: '#F1F8E9', borderColor: Colors.green3,
    },
    filterLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
    filterLabelActive: { color: Colors.green5 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40,
    },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.green5, marginTop: 16 },
    emptySubtitle: {
        fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
        marginTop: 8, lineHeight: 20,
    },
    content: { padding: 16, paddingBottom: 40 },
    paymentCard: {
        backgroundColor: Colors.white, borderRadius: 16, padding: 16,
        marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: {
        width: 40, height: 40, borderRadius: 20, marginRight: 10,
    },
    avatarPlaceholder: {
        backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center',
    },
    userName: { fontSize: 15, fontWeight: 'bold', color: Colors.green5 },
    userAddress: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '700' },
    cardBody: { gap: 6 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
    cardLabel: { fontSize: 13, color: Colors.textSecondary },
    cardValue: { fontSize: 13, fontWeight: '500', color: Colors.green5 },
    cardAmount: { fontSize: 14, fontWeight: 'bold', color: Colors.green3 },
    proofIndicator: {
        flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10,
        paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    proofText: { fontSize: 12, color: Colors.green4, fontWeight: '500' },
    cardFooter: { alignItems: 'flex-end', marginTop: 4 },
});
