import React, { useState } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, TouchableOpacity,
    StatusBar, Image, ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAdminHomeViewModel } from './AdminHomeViewModel';
import { styles } from './AdminHomeStyles';
import { CustomAlertModal } from '../../components/CustomAlertModal';
import { AdminSidebar } from '../../components/navigation/AdminSidebar';

export default function AdminHomeScreen() {
    const vm = useAdminHomeViewModel();
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
            <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={false} onRefresh={vm.refresh} colors={['#1B5E20']} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Selamat datang,</Text>
                        <Text style={styles.userName}>{vm.user?.user_metadata?.full_name || 'Admin'}</Text>
                    </View>
                    <TouchableOpacity
                        style={{
                            padding: 10,
                            backgroundColor: '#E8F5E9',
                            borderRadius: 12,
                        }}
                        onPress={() => setSidebarVisible(true)}
                    >
                        <Ionicons name="menu" size={22} color="#1B5E20" />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { borderLeftColor: '#4CAF50' }]}>
                        <Text style={styles.statNumber}>{vm.stats.warga}</Text>
                        <Text style={styles.statLabel}>Warga</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#2196F3' }]}>
                        <Text style={styles.statNumber}>{vm.stats.security}</Text>
                        <Text style={styles.statLabel}>Security</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#FF9800' }]}>
                        <Text style={styles.statNumber}>{vm.activeGuests}</Text>
                        <Text style={styles.statLabel}>Tamu Aktif</Text>
                    </View>
                </View>

                {/* Panic Alert Banner (if active panics) */}
                {vm.activePanics > 0 && (
                    <TouchableOpacity style={styles.panicBanner} onPress={vm.navigateToPanicLogs}>
                        <View style={styles.panicBannerLeft}>
                            <Ionicons name="alert-circle" size={24} color="#FFF" />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.panicBannerTitle}>
                                    🚨 {vm.activePanics} Darurat Aktif
                                </Text>
                                <Text style={styles.panicBannerSubtitle}>Tap untuk lihat detail</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#FFF" />
                    </TouchableOpacity>
                )}

                {/* Pending Payments Banner */}
                {vm.pendingPayments > 0 && (
                    <TouchableOpacity
                        style={[styles.panicBanner, { backgroundColor: '#F57F17', marginTop: vm.activePanics > 0 ? 8 : 16 }]}
                        onPress={vm.navigateToPaymentConfirmation}
                    >
                        <View style={styles.panicBannerLeft}>
                            <Ionicons name="receipt" size={24} color="#FFF" />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.panicBannerTitle}>
                                    💰 {vm.pendingPayments} Pembayaran Menunggu
                                </Text>
                                <Text style={styles.panicBannerSubtitle}>Tap untuk konfirmasi</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#FFF" />
                    </TouchableOpacity>
                )}

                {/* Ringkasan Aktivitas — Recent Panic Logs */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Ringkasan Aktivitas</Text>
                    {vm.recentPanics.length > 0 && (
                        <TouchableOpacity onPress={vm.navigateToPanicLogs}>
                            <Text style={styles.seeAll}>Lihat Semua →</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {vm.recentPanics.length === 0 ? (
                    <View style={styles.emptyActivity}>
                        <Ionicons name="shield-checkmark" size={40} color="#4CAF50" />
                        <Text style={styles.emptyText}>Tidak ada darurat aktif</Text>
                        <Text style={styles.emptySubtext}>Lingkungan aman 👍</Text>
                    </View>
                ) : (
                    vm.recentPanics.map((log) => {
                        const hasLocation = log.location?.startsWith('http');
                        return (
                            <TouchableOpacity
                                key={log.id}
                                style={styles.activityCard}
                                onPress={() => vm.openPanicLocation(log)}
                                activeOpacity={hasLocation ? 0.7 : 1}
                            >
                                <View style={styles.activityLeft}>
                                    {log.profiles?.avatar_url ? (
                                        <Image source={{ uri: log.profiles.avatar_url }} style={styles.activityAvatar} />
                                    ) : (
                                        <View style={[styles.activityAvatar, styles.avatarPlaceholder]}>
                                            <Ionicons name="person" size={16} color="#F44336" />
                                        </View>
                                    )}
                                    <View style={{ marginLeft: 12, flex: 1 }}>
                                        <Text style={styles.activityName} numberOfLines={1}>
                                            {log.profiles?.full_name || 'Warga'}
                                        </Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                            <Ionicons
                                                name={hasLocation ? 'location' : 'location-outline'}
                                                size={12}
                                                color={hasLocation ? '#1976D2' : '#999'}
                                            />
                                            <Text style={[styles.activityLocation, { color: hasLocation ? '#1976D2' : '#999' }]} numberOfLines={1}>
                                                {hasLocation ? 'Buka Lokasi GPS' : (log.location || 'Lokasi tidak diketahui')}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.activityRight}>
                                    <Text style={styles.activityTime}>{vm.formatTime(log.created_at)}</Text>
                                    {hasLocation && <Ionicons name="open-outline" size={14} color="#1976D2" style={{ marginTop: 4 }} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            {/* Sidebar Drawer */}
            <AdminSidebar
                visible={sidebarVisible}
                onClose={() => setSidebarVisible(false)}
                pendingPayments={vm.pendingPayments}
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
