import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import Constants from 'expo-constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { Ionicons } from '@expo/vector-icons';
import { useLaporanViewModel } from './LaporanViewModel';
import { useAuth } from '../../../contexts/AuthContext';
import { createStyles } from './LaporanStyles';

export default function LaporanScreen() {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const { profile } = useAuth();
    const hasLaporan = profile?.housing_complexes?.has_laporan ?? false;

    const {
        selectedFilter,
        setSelectedFilter,
        filteredReports,
        handleCreateReport,
        handleReportClick,
        handleLoadMore,
        handleShowLess,
        canLoadMore,
        canShowLess
    } = useLaporanViewModel();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Selesai': return colors.status.selesai.text;
            case 'Diproses': return colors.status.diproses.text;
            case 'Menunggu': return colors.status.menunggu.text;
            case 'Ditolak': return colors.status.ditolak.text;
            default: return colors.textSecondary;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'Selesai': return colors.status.selesai.bg;
            case 'Diproses': return colors.status.diproses.bg;
            case 'Menunggu': return colors.status.menunggu.bg;
            case 'Ditolak': return colors.status.ditolak.bg;
            default: return colors.surfaceSubtle;
        }
    };

    const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
        switch (category) {
            case 'Fasilitas': return 'construct-outline';
            case 'Kebersihan': return 'leaf-outline';
            case 'Keamanan': return 'shield-checkmark-outline';
            case 'Infrastruktur': return 'build-outline';
            default: return 'help-circle-outline';
        }
    };

    if (!hasLaporan) {
        return (
            <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />
                <CustomHeader title="Lapor & Keluhan" showBack={false} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="lock-closed" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>
                        Fitur Terkunci
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
                        Fitur Laporan Warga tidak tersedia dalam paket berlangganan komplek Anda saat ini. Hubungi pengurus komplek untuk melakukan Upgrade Paket Warga Lokal.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
            <CustomHeader title="Lapor & Keluhan" showBack={false} />

            <View style={styles.container}>
                {/* Filter Tabs */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScrollView}
                        contentContainerStyle={styles.filterContainer}
                    >
                        {['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Ditolak'].map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterTab,
                                    selectedFilter === filter && styles.filterTabActive
                                ]}
                                onPress={() => setSelectedFilter(filter as any)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    selectedFilter === filter && styles.filterTextActive
                                ]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Report List */}
                <View style={{ flex: 1 }}>
                    <FlashList
                        data={filteredReports}
                        keyExtractor={(item) => item.id}
                        // @ts-ignore: type incompatibility with React 19
                        estimatedItemSize={100}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={
                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 16, gap: 10 }}>
                                {canShowLess && (
                                    <TouchableOpacity 
                                        onPress={handleShowLess}
                                        style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.surfaceSubtle, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}
                                    >
                                        <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>Tampilkan Lebih Sedikit</Text>
                                    </TouchableOpacity>
                                )}
                                {canLoadMore && (
                                    <TouchableOpacity 
                                        onPress={handleLoadMore}
                                        style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.primary, borderRadius: 8 }}
                                    >
                                        <Text style={{ color: colors.textWhite, fontWeight: '500' }}>Tampilkan Lebih Banyak</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
                                <Text style={styles.emptyText}>Belum ada laporan</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.reportItem}
                                onPress={() => handleReportClick(item.id)}
                            >
                                <View style={styles.reportIconCard}>
                                    <Ionicons
                                        name={getCategoryIcon(item.category)}
                                        size={24}
                                        color={colors.primary}
                                    />
                                </View>
                                <View style={styles.reportContent}>
                                    <Text style={styles.reportTitle}>{item.title}</Text>
                                    <Text style={styles.reportMeta}>{item.date} • {item.category}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* FAB */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleCreateReport}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={30} color={colors.textWhite} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
