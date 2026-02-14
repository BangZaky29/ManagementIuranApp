import { useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';


import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { getDashboardStats } from '../../../services/adminService';
import { supabase } from '../../../lib/supabaseConfig';
import { CustomHeader } from '../../../components/CustomHeader';
import { styles } from './AdminDashboardStyles';

export default function AdminDashboardScreen() {
    const [stats, setStats] = useState({ warga: 0, security: 0, activeUsers: 0, laporanMasuk: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        try {
            // Fetch verify user stats (existing mock/service)
            const data = await getDashboardStats();

            // Fetch real report count
            const { count, error } = await supabase
                .from('reports')
                .select('*', { count: 'exact', head: true }); // Head request for count only

            setStats({
                ...data,
                laporanMasuk: count || 0
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadStats();
    };

    const StatCard = ({ title, count, icon, color, subtitle }: any) => {
        const isEmpty = !count || count === 0 || count === '0';
        const activeColor = isEmpty ? Colors.textSecondary + '40' : color; // 40 is hex for 25% opacity
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

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <CustomHeader title="Dashboard Admin" showBack={false} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
            >
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Selamat Datang, Admin</Text>
                    <Text style={styles.dateText}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
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
                        subtitle="Buld"
                    />
                </View>

                {/* Quick Actions or Charts could go here */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Ringkasan Aktivitas</Text>
                </View>

                <View style={[styles.card, { padding: 20, alignItems: 'center' }]}>
                    <Text style={{ color: Colors.textSecondary }}>Belum ada aktivitas terbaru.</Text>
                </View>

            </ScrollView>
        </View>
    );
}
