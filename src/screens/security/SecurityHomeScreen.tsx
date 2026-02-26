import React from 'react';
import {
    View, Text, SafeAreaView, ScrollView, TouchableOpacity,
    StatusBar, Image, ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSecurityHomeViewModel } from './SecurityHomeViewModel';
import { styles } from './SecurityHomeStyles';
import { CustomAlertModal } from '../../components/CustomAlertModal';

export default function SecurityHomeScreen() {
    const vm = useSecurityHomeViewModel();

    if (vm.isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0D47A1" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F0F4F8" />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={false} onRefresh={vm.refresh} colors={['#0D47A1']} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Tugas Berjaga,</Text>
                        <Text style={styles.userName}>{vm.user?.user_metadata?.full_name || 'Petugas'}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileBtn} onPress={vm.navigateToProfile}>
                        {vm.securityProfile?.avatar_url ? (
                            <Image source={{ uri: vm.securityProfile.avatar_url }} style={styles.profileAvatar} />
                        ) : (
                            <View style={[styles.profileAvatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={20} color="#0D47A1" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { borderLeftColor: '#4CAF50' }]}>
                        <Text style={styles.statNumber}>{vm.stats.warga}</Text>
                        <Text style={styles.statLabel}>Total Warga</Text>
                        <View style={{ flexDirection: 'row', marginTop: 4, gap: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginRight: 4 }} />
                                <Text style={{ fontSize: 10, color: '#666' }}>{vm.stats.wargaActive} Aktif</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#F44336', marginRight: 4 }} />
                                <Text style={{ fontSize: 10, color: '#666' }}>{vm.stats.wargaInactive} Non-Aktif</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: '#F44336' }]}>
                        <Text style={styles.statNumber}>{vm.activePanics}</Text>
                        <Text style={styles.statLabel}>Darurat Aktif</Text>
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
                                <Text style={styles.panicBannerSubtitle}>Segera cek lokasi kejadian</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#FFF" />
                    </TouchableOpacity>
                )}

                {/* Quick Actions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Menu Operasional</Text>
                </View>
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity style={styles.quickAction} onPress={vm.navigateToPanicLogs}>
                        <View style={[styles.quickIcon, { backgroundColor: '#FFEBEE' }]}>
                            <Ionicons name="warning" size={24} color="#F44336" />
                            {vm.activePanics > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{vm.activePanics}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.quickLabel}>Log Darurat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={vm.navigateToGuestBook}>
                        <View style={[styles.quickIcon, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="id-card" size={24} color="#0D47A1" />
                        </View>
                        <Text style={styles.quickLabel}>Buku Tamu</Text>
                    </TouchableOpacity>
                </View>

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
                        <Text style={styles.emptySubtext}>Lingkungan aman terkendali 👍</Text>
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
