import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StatusBar, Image, ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSecurityHomeViewModel } from './SecurityHomeViewModel';
import { styles } from './SecurityHomeStyles';
import { CustomAlertModal } from '../../components/CustomAlertModal';
import { CustomHeader } from '../../components/CustomHeader';
import { PanicLogCard } from '../../components/PanicLogCard';

export default function SecurityHomeScreen() {
    const vm = useSecurityHomeViewModel();

    if (vm.isLoading) {
        return (
            <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0D47A1" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <CustomHeader title="Dashboard Security" showBack={false} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={false} onRefresh={vm.refresh} colors={['#0D47A1']} />}
            >
                {/* Profile Header Card */}
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
                    <View style={[styles.statCard, { borderLeftColor: '#4CAF50', position: 'relative' }]}>
                        {/* Bubbles at top right */}
                        <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 4 }}>
                            {vm.stats.wargaActive > 0 && (
                                <View style={{ backgroundColor: '#4CAF50', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>{vm.stats.wargaActive}</Text>
                                </View>
                            )}
                            {vm.stats.wargaInactive > 0 && (
                                <View style={{ backgroundColor: '#F44336', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>{vm.stats.wargaInactive}</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.statNumber}>{vm.stats.warga}</Text>
                        <Text style={styles.statLabel}>Total Warga</Text>
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
                            {vm.pendingGuestsCount > 0 && (
                                <View style={[styles.badge, styles.badgeYellow]}>
                                    <Text style={styles.badgeTextBlack}>{vm.pendingGuestsCount}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.quickLabel}>Buku Tamu</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={vm.navigateToReports}>
                        <View style={[styles.quickIcon, { backgroundColor: '#E8EAF6' }]}>
                            <Ionicons name="document-text" size={24} color="#3F51B5" />
                            {vm.pendingReportsCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{vm.pendingReportsCount}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.quickLabel}>Laporan Warga</Text>
                    </TouchableOpacity>
                </View>

                {/* Ringkasan Aktivitas — Recent Panic Logs */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Darurat Terbaru</Text>
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
                    vm.recentPanics.map((log) => (
                        <PanicLogCard
                            key={log.id}
                            log={log}
                            showResolveButton={false}
                        />
                    ))
                )}

                {/* Ringkasan Laporan Warga */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Laporan Warga Terbaru</Text>
                    <TouchableOpacity onPress={vm.navigateToReports}>
                        <Text style={styles.seeAll}>Lihat Semua →</Text>
                    </TouchableOpacity>
                </View>

                {vm.recentReports.length === 0 ? (
                    <View style={styles.emptyActivity}>
                        <Ionicons name="document-text-outline" size={40} color="#3F51B5" />
                        <Text style={styles.emptyText}>Tidak ada laporan baru</Text>
                        <Text style={styles.emptySubtext}>Semua laporan warga sudah tertangani.</Text>
                    </View>
                ) : (
                    vm.recentReports.map((report) => (
                        <TouchableOpacity
                            key={report.id}
                            style={[styles.activityCard, { borderLeftColor: '#3F51B5' }]}
                            onPress={vm.navigateToReports}
                        >
                            <View style={styles.activityLeft}>
                                <View style={[styles.activityIconBox, { backgroundColor: '#E8EAF6' }]}>
                                    <Ionicons name="document-text" size={20} color="#3F51B5" />
                                </View>
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={styles.activityName} numberOfLines={1}>{report.title}</Text>
                                        <View style={[
                                            styles.statusDot,
                                            {
                                                backgroundColor: report.status === 'Selesai' ? '#4CAF50' :
                                                    report.status === 'Diproses' ? '#2196F3' : '#FF9800'
                                            }
                                        ]} />
                                    </View>
                                    <Text style={styles.activityDesc} numberOfLines={1}>{report.description}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
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
