import React, { useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StatusBar, Image, ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue, useAnimatedStyle, withRepeat,
    withSequence, withTiming, FadeInDown
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSecurityHomeViewModel } from './SecurityHomeViewModel';
import { createStyles } from './SecurityHomeStyles';
import { useRouter } from 'expo-router';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import { CustomHeader } from '../../components/common/CustomHeader';
import { PanicLogCard } from '../../components/panic/PanicLogCard';
import { useSecurityTheme } from '../../contexts/ThemeContext';

export default function SecurityHomeScreen() {
    const vm = useSecurityHomeViewModel();
    const router = useRouter(); // For chat navigation
    const { colors } = useSecurityTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const scale = useSharedValue(1);

    React.useEffect(() => {
        if (vm.activePanics > 0) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 800 }),
                    withTiming(1, { duration: 800 })
                ),
                -1,
                true
            );
        } else {
            scale.value = 1;
        }
    }, [vm.activePanics]);

    const animatedPanicStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    if (vm.isLoading) {
        return (
            <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />
            <CustomHeader title="Dashboard Security" showBack={false} colors={colors} />

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={false} onRefresh={vm.refresh} colors={[colors.primary]} />}
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
                                <Ionicons name="person" size={20} color={colors.primary} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { borderLeftColor: colors.status.warga.text, position: 'relative' }]}>
                        {/* Bubbles at top right */}
                        <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 4 }}>
                            {vm.stats.wargaActive > 0 && (
                                <View style={{ backgroundColor: colors.status.warga.text, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 10, color: colors.textWhite, fontWeight: 'bold' }}>{vm.stats.wargaActive}</Text>
                                </View>
                            )}
                            {vm.stats.wargaInactive > 0 && (
                                <View style={{ backgroundColor: colors.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 10, color: colors.textWhite, fontWeight: 'bold' }}>{vm.stats.wargaInactive}</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.statNumber}>{vm.stats.warga}</Text>
                        <Text style={styles.statLabel}>Total Warga</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: colors.danger }]}>
                        <Text style={styles.statNumber}>{vm.activePanics}</Text>
                        <Text style={styles.statLabel}>Darurat Aktif</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
                        <Text style={styles.statNumber}>{vm.activeGuests}</Text>
                        <Text style={styles.statLabel}>Tamu Aktif</Text>
                    </View>
                </View>

                {/* Panic Alert Banner (if active panics) */}
                {vm.activePanics > 0 && (
                    <Animated.View style={animatedPanicStyle}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={vm.navigateToPanicLogs}
                        >
                            <LinearGradient
                                colors={[colors.danger, colors.danger]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.panicBanner}
                            >
                                <View style={styles.panicBannerLeft}>
                                    <View style={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        padding: 8, borderRadius: 12
                                    }}>
                                        <Ionicons name="notifications" size={24} color={colors.textWhite} />
                                    </View>
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.panicBannerTitle}>
                                            {vm.activePanics} Laporan Darurat Aktif!
                                        </Text>
                                        <Text style={styles.panicBannerSubtitle}>Ketuk untuk melihat detail kejadian</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textWhite} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Quick Actions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Menu Operasional</Text>
                </View>
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity style={styles.quickAction} onPress={vm.navigateToPanicLogs}>
                        <View style={[styles.quickIcon, { backgroundColor: colors.dangerBg }]}>
                            <Ionicons name="warning" size={24} color={colors.danger} />
                            {vm.activePanics > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{vm.activePanics}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.quickLabel}>Log Darurat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={vm.navigateToGuestBook}>
                        <View style={[styles.quickIcon, { backgroundColor: colors.primarySubtle }]}>
                            <Ionicons name="id-card" size={24} color={colors.primary} />
                            {vm.pendingGuestsCount > 0 && (
                                <View style={[styles.badge, styles.badgeYellow]}>
                                    <Text style={styles.badgeTextBlack}>{vm.pendingGuestsCount}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.quickLabel}>Buku Tamu</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={vm.navigateToReports}>
                        <View style={[styles.quickIcon, { backgroundColor: colors.primarySubtle }]}>
                            <Ionicons name="document-text" size={24} color={colors.primary} />
                            <View style={{ position: 'absolute', top: -4, right: -4, flexDirection: 'row', gap: 2 }}>
                                {vm.pendingReportsCount > 0 && (
                                    <View style={[styles.badge, { backgroundColor: colors.status.menunggu.bg }]}>
                                        <Text style={[styles.badgeText, { color: colors.status.menunggu.text }]}>{vm.pendingReportsCount}</Text>
                                    </View>
                                )}
                                {vm.processingReportsCount > 0 && (
                                    <View style={[styles.badge, { backgroundColor: colors.status.diproses.bg }]}>
                                        <Text style={[styles.badgeText, { color: colors.status.diproses.text }]}>{vm.processingReportsCount}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <Text style={styles.quickLabel}>Laporan Warga</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/chat' as any)}>
                        <View style={[styles.quickIcon, { backgroundColor: colors.success + '20' }]}>
                            <Ionicons name="chatbubbles" size={24} color={colors.success} />
                            {vm.unreadChatCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{vm.unreadChatCount}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.quickLabel}>Pesan</Text>
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
                        <Ionicons name="shield-checkmark" size={40} color={colors.success} />
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
                        <Ionicons name="document-text-outline" size={40} color={colors.primary} />
                        <Text style={styles.emptyText}>Tidak ada laporan baru</Text>
                        <Text style={styles.emptySubtext}>Semua laporan warga sudah tertangani.</Text>
                    </View>
                ) : (
                    vm.recentReports.map((report) => (
                        <TouchableOpacity
                            key={report.id}
                            style={[styles.activityCard, { borderLeftColor: colors.primary }]}
                            onPress={vm.navigateToReports}
                        >
                            <View style={styles.activityLeft}>
                                <View style={[styles.activityIconBox, { backgroundColor: colors.primarySubtle }]}>
                                    <Ionicons name="document-text" size={20} color={colors.primary} />
                                </View>
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={styles.activityName} numberOfLines={1}>{report.title}</Text>
                                        <View style={[
                                            styles.statusDot,
                                            {
                                                backgroundColor: report.status === 'Selesai' ? colors.status.selesai.text :
                                                    report.status === 'Diproses' ? colors.status.diproses.text : colors.status.menunggu.text
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
