import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StatusBar, Image, ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAdminHomeViewModel } from './AdminHomeViewModel';
import { styles } from './AdminHomeStyles';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { AdminSidebar } from '../../../components/navigation/AdminSidebar';
import { useTheme } from '../../../contexts/ThemeContext';

export default function AdminHomeScreen() {
    const vm = useAdminHomeViewModel();
    const { colors } = useTheme();
    const [sidebarVisible, setSidebarVisible] = useState(false);

    if (vm.isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#1B5E20" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={vm.isLoading} onRefresh={vm.refresh} colors={['#1B5E20']} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Halo, selamat datang</Text>
                        <Text style={styles.userName}>{vm.user?.user_metadata?.full_name || 'Admin'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.menuBtn}
                        onPress={() => setSidebarVisible(true)}
                    >
                        <Ionicons name="menu" size={24} color="#1B5E20" />
                        {(vm.pendingReports > 0 || vm.processingReports > 0 || vm.pendingPayments > 0) && (
                            <View style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#F44336',
                                borderWidth: 1.5,
                                borderColor: '#FFF'
                            }} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="people" size={18} color="#4CAF50" />
                        </View>
                        <Text style={styles.statNumber}>{vm.stats.wargaActive}</Text>
                        <Text style={styles.statLabel}>Warga Aktif</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#FFEBEE' }]}>
                            <Ionicons name="person-remove" size={18} color="#F44336" />
                        </View>
                        <Text style={styles.statNumber}>{vm.stats.wargaInactive}</Text>
                        <Text style={styles.statLabel}>Warga Non-aktif</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="shield-checkmark" size={18} color="#2196F3" />
                        </View>
                        <Text style={styles.statNumber}>{vm.stats.security}</Text>
                        <Text style={styles.statLabel}>Security</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
                            <Ionicons name="id-card" size={18} color="#FF9800" />
                        </View>
                        <Text style={styles.statNumber}>{vm.activeGuests}</Text>
                        <Text style={styles.statLabel}>Tamu Aktif</Text>
                    </View>
                </View>

                {/* Action Needed Banners */}
                <View style={styles.bannerContainer}>
                    {/* Panic Alert Banner (if active panics) */}
                    {vm.activePanics > 0 && (
                        <TouchableOpacity
                            style={[styles.actionBanner, { backgroundColor: '#F44336' }]}
                            onPress={vm.navigateToPanicLogs}
                            activeOpacity={0.8}
                        >
                            <View style={styles.actionBannerLeft}>
                                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                                    <Ionicons name="alert-circle" size={24} color="#FFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.actionBannerTitle}>
                                        🚨 {vm.activePanics} Darurat Aktif
                                    </Text>
                                    <Text style={styles.actionBannerSubtitle}>Warga membunyikan alarm. Segera periksa lokasi!</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}

                    {/* Pending Payments Banner */}
                    {vm.pendingPayments > 0 && (
                        <TouchableOpacity
                            style={[styles.actionBanner, { backgroundColor: colors.status.pending.text }]}
                            onPress={vm.navigateToPaymentConfirmation}
                            activeOpacity={0.8}
                        >
                            <View style={styles.actionBannerLeft}>
                                <View style={styles.actionIconBox}>
                                    <Ionicons name="wallet" size={20} color="#FFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.actionBannerTitle}>
                                        {vm.pendingPayments} Iuran Menunggu
                                    </Text>
                                    <Text style={styles.actionBannerSubtitle}>Ada bukti transfer yang butuh konfirmasi Anda.</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}

                    {/* Pending Reports Banner */}
                    {vm.pendingReports > 0 && (
                        <TouchableOpacity
                            style={[styles.actionBanner, { backgroundColor: colors.status.diproses.text }]}
                            onPress={vm.navigateToReports}
                            activeOpacity={0.8}
                        >
                            <View style={styles.actionBannerLeft}>
                                <View style={styles.actionIconBox}>
                                    <Ionicons name="chatbubbles" size={20} color="#FFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.actionBannerTitle}>
                                        {vm.pendingReports} Laporan Baru
                                    </Text>
                                    <Text style={styles.actionBannerSubtitle}>Warga mengirim laporan yang butuh dicek.</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Ringkasan Aktivitas */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Ringkasan Aktivitas</Text>
                    <TouchableOpacity onPress={vm.navigateToActivityLog}>
                        <Text style={{ color: '#1B5E20', fontSize: 13, fontWeight: '700' }}>Lihat Semua</Text>
                    </TouchableOpacity>
                </View>

                {vm.activityLogs.length === 0 ? (
                    <View style={styles.emptyActivity}>
                        <Ionicons name="time-outline" size={48} color="#CCC" />
                        <Text style={styles.emptyText}>Belum Ada Aktivitas</Text>
                        <Text style={styles.emptySubtext}>Aktivitas bayar iuran, tamu, atau darurat warga akan muncul di sini.</Text>
                    </View>
                ) : (
                    vm.activityLogs.slice(0, 5).map((log) => {
                        let iconName = 'ellipse';
                        let iconColor = '#999';
                        let bgColor = '#F5F5F5';

                        if (log.action_type === 'payment') {
                            iconName = 'wallet'; iconColor = colors.status.selesai.text; bgColor = colors.status.selesai.bg;
                        } else if (log.action_type === 'report') {
                            iconName = 'chatbubble-ellipses'; iconColor = colors.status.diproses.text; bgColor = colors.status.diproses.bg;
                        } else if (log.action_type === 'panic') {
                            iconName = 'alert-circle'; iconColor = colors.danger; bgColor = '#FFEBEE';
                        } else if (log.action_type === 'visitor') {
                            iconName = 'id-card'; iconColor = colors.status.menunggu.text; bgColor = colors.status.menunggu.bg;
                        }

                        return (
                            <View key={log.id} style={styles.activityCard}>
                                <View style={[styles.activityIconBox, { backgroundColor: bgColor }]}>
                                    <Ionicons name={iconName as any} size={22} color={iconColor} />
                                </View>
                                <View style={styles.activityContent}>
                                    <View style={styles.activityHeaderRow}>
                                        <Text style={styles.activityTitle} numberOfLines={1}>{log.action_title}</Text>
                                        <Text style={styles.activityTime}>{vm.formatTime(log.created_at)}</Text>
                                    </View>
                                    <Text style={styles.activityDesc} numberOfLines={2}>{log.description}</Text>

                                    <View style={styles.activityUserRow}>
                                        {log.profiles?.avatar_url ? (
                                            <Image source={{ uri: log.profiles.avatar_url }} style={styles.activityAvatar} />
                                        ) : (
                                            <View style={[styles.activityAvatar, { justifyContent: 'center', alignItems: 'center' }]}>
                                                <Ionicons name="person" size={10} color="#999" />
                                            </View>
                                        )}
                                        <Text style={styles.activityUserName}>{log.profiles?.full_name || 'System'}</Text>

                                        {/* Role Badge */}
                                        {log.profiles?.role && (
                                            <View style={[
                                                {
                                                    marginLeft: 6,
                                                    paddingHorizontal: 6,
                                                    paddingVertical: 2,
                                                    borderRadius: 4,
                                                },
                                                log.profiles.role === 'admin' ? { backgroundColor: colors.status.admin.bg } :
                                                    log.profiles.role === 'security' ? { backgroundColor: colors.status.security.bg } :
                                                        { backgroundColor: colors.status.warga.bg } // warga
                                            ]}>
                                                <Text style={[
                                                    { fontSize: 9, fontWeight: 'bold' },
                                                    log.profiles.role === 'admin' ? { color: colors.status.admin.text } :
                                                        log.profiles.role === 'security' ? { color: colors.status.security.text } :
                                                            { color: colors.status.warga.text } // warga
                                                ]}>
                                                    {log.profiles.role.toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Sidebar Drawer */}
            <AdminSidebar
                visible={sidebarVisible}
                onClose={() => setSidebarVisible(false)}
                pendingPayments={vm.pendingPayments}
                pendingReports={vm.pendingReports}
                processingReports={vm.processingReports}
            />

            <CustomAlertModal
                visible={vm.alertVisible}
                title={vm.alertConfig.title}
                message={vm.alertConfig.message}
                type={vm.alertConfig.type}
                buttons={vm.alertConfig.buttons}
                onClose={vm.hideAlert}
            />
        </SafeAreaView>
    );
}
