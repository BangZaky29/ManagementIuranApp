import { useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';

import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { getDashboardStats } from '../../../services/admin';
import { countPendingPayments } from '../../../services/payment';
import { supabase } from '../../../lib/supabaseConfig';
import { CustomHeader } from '../../../components/CustomHeader';
import { AdminSidebar } from '../../../components/navigation/AdminSidebar';
import { styles } from './AdminDashboardStyles';
import { formatFullDateSafe, formatDateTimeSafe } from '../../../utils/dateUtils';
import { fetchRecentActivityLogs, ActivityLog } from '../../../services/activityLog';
import { useRouter } from 'expo-router';

export default function AdminDashboardScreen() {
    const router = useRouter();
    const [stats, setStats] = useState({ warga: 0, security: 0, activeUsers: 0, laporanMasuk: 0 });
    const [pendingPayments, setPendingPayments] = useState(0);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const loadData = async () => {
        try {
            const [statsData, recentLogs, reportResult, paymentCount] = await Promise.all([
                getDashboardStats(),
                fetchRecentActivityLogs(5),
                supabase.from('reports').select('*', { count: 'exact', head: true }),
                countPendingPayments(),
            ]);

            setStats({
                ...statsData,
                laporanMasuk: reportResult.count || 0
            });
            setActivities(recentLogs);
            setPendingPayments(paymentCount);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const StatCard = ({ title, count, icon, color, subtitle }: any) => {
        const isEmpty = !count || count === 0 || count === '0';
        const activeColor = isEmpty ? Colors.textSecondary + '40' : color;
        const iconColor = isEmpty ? Colors.textSecondary : '#FFF';

        return (
            <View style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: activeColor }]}>
                    <Ionicons name={icon} size={24} color={iconColor} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardCount}>{isLoading ? '...' : count}</Text>
                    {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
                </View>
            </View>
        );
    };

    const HamburgerButton = (
        <TouchableOpacity
            onPress={() => setSidebarVisible(true)}
            style={{
                padding: 6,
                backgroundColor: '#E8F5E9',
                borderRadius: 10,
            }}
        >
            <Ionicons name="menu" size={22} color="#1B5E20" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <CustomHeader
                title="Dashboard Admin"
                showBack={false}
                rightIcon={HamburgerButton}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Selamat Datang, Admin</Text>
                    <Text style={styles.dateText}>{formatFullDateSafe(new Date())}</Text>
                </View>

                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Warga"
                        count={stats.warga}
                        icon="people"
                        color={Colors.primary}
                        subtitle="Terdaftar"
                    />
                    <StatCard
                        title="Total Security"
                        count={stats.security}
                        icon="shield-checkmark"
                        color={Colors.primary}
                        subtitle="Personil"
                    />
                    <StatCard
                        title="User Aktif"
                        count={stats.activeUsers}
                        icon="checkmark-circle"
                        color={Colors.success}
                        subtitle="Sudah Login"
                    />
                    <StatCard
                        title="Laporan Masuk"
                        count={stats.laporanMasuk}
                        icon="document-text"
                        color={Colors.warning}
                        subtitle="Total"
                    />
                </View>

                {/* Pending Payments Banner */}
                {pendingPayments > 0 && (
                    <View style={{
                        backgroundColor: '#FFF8E1',
                        padding: 16,
                        borderRadius: 14,
                        marginHorizontal: 16,
                        marginTop: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                    }}>
                        <View style={{
                            width: 40, height: 40, borderRadius: 12,
                            backgroundColor: '#F57F17', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Ionicons name="receipt" size={20} color="#FFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#F57F17' }}>
                                {pendingPayments} Pembayaran Menunggu Konfirmasi
                            </Text>
                            <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                                Buka via Menu → Management Iuran
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Ringkasan Aktivitas</Text>
                    <TouchableOpacity onPress={() => router.push('/admin/activity-log')}>
                        <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>Lihat Semua</Text>
                    </TouchableOpacity>
                </View>

                {activities.length > 0 ? (
                    activities.slice(0, 5).map((item) => (
                        <View key={item.id} style={[styles.card, { padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                            <View style={{
                                width: 42, height: 42, borderRadius: 21,
                                backgroundColor: item.action_type === 'panic' ? '#FFEBEE' : '#E8F5E9',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Ionicons
                                    name={
                                        item.action_type === 'payment' ? 'wallet' :
                                        item.action_type === 'report' ? 'chatbubble-ellipses' :
                                        item.action_type === 'panic' ? 'alert-circle' : 'id-card'
                                    }
                                    size={20}
                                    color={
                                        item.action_type === 'payment' ? '#4CAF50' :
                                        item.action_type === 'report' ? '#2196F3' :
                                        item.action_type === 'panic' ? '#F44336' : '#FF9800'
                                    }
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }} numberOfLines={1}>
                                    {item.action_title}
                                </Text>
                                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                                    {item.description}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 10, color: '#999' }}>{formatDateTimeSafe(item.created_at)}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={[styles.card, { padding: 20, alignItems: 'center' }]}>
                        <Text style={{ color: Colors.textSecondary }}>Belum ada aktivitas terbaru.</Text>
                    </View>
                )}

            </ScrollView>

            {/* Sidebar */}
            <AdminSidebar
                visible={sidebarVisible}
                onClose={() => setSidebarVisible(false)}
                pendingPayments={pendingPayments}
            />
        </View>
    );
}
