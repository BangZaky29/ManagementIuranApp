import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    Image, RefreshControl, StatusBar, ActivityIndicator, Linking, Modal, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSecurityReportsViewModel } from './SecurityReportsViewModel';
import { styles } from './SecurityReportsStyles';
import { formatDateSafe } from '../../utils/dateUtils';
import { CustomHeader } from '../../components/CustomHeader';
import { CustomAlertModal } from '../../components/CustomAlertModal';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

const STATUS_FILTERS = ['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Ditolak'];

export default function SecurityReportsScreen() {
    const vm = useSecurityReportsViewModel();
    const router = useRouter();
    const { colors } = useTheme();

    useEffect(() => {
        vm.loadReports();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Selesai': return { bg: '#E8F5E9', text: colors.success };
            case 'Diproses': return { bg: '#E3F2FD', text: colors.warning };
            case 'Ditolak': return { bg: '#FFEBEE', text: colors.danger };
            default: return { bg: '#FFF3E0', text: '#E65100' };
        }
    };

    const navigateToDetail = (reportId: string) => {
        router.push(`/security/reports/${reportId}` as any);
    };

    const renderReportItem = ({ item }: { item: any }) => {
        const { bg, text } = getStatusStyle(item.status);
        const hasLocation = item.location && item.location.startsWith('http');

        return (
            <TouchableOpacity
                style={styles.reportCard}
                onPress={() => navigateToDetail(item.id)}
                activeOpacity={0.7}
            >
                <View style={[styles.cardHeader, { borderBottomWidth: 0 }]}>
                    {item.profiles?.avatar_url ? (
                        <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={18} color={colors.primary} />
                        </View>
                    )}
                    <View style={styles.headerInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.userName}>{item.profiles?.full_name || 'Warga'}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                                <Text style={[styles.statusText, { color: text }]}>{item.status}</Text>
                            </View>
                        </View>
                        <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                            <Text style={styles.dateText}>{formatDateSafe(item.created_at)}</Text>
                            <View style={styles.categoryTag}>
                                <Text style={styles.categoryText}>{item.category}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <CustomHeader title="Laporan Warga" showBack={true} />

            {/* Filter Chips */}
            <View>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={STATUS_FILTERS}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                vm.filterStatus === item && styles.filterChipActive
                            ]}
                            onPress={() => vm.setFilterStatus(item)}
                        >
                            <Text style={[
                                styles.filterText,
                                vm.filterStatus === item && styles.filterTextActive
                            ]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {vm.isLoading && !vm.refreshing ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0D47A1" />
                </View>
            ) : (
                <FlatList
                    data={vm.reports}
                    renderItem={renderReportItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={vm.refreshing}
                            onRefresh={() => vm.loadReports(true)}
                            colors={[colors.primary]}
                        />
                    }
                    ListFooterComponent={
                        <View style={{ paddingBottom: 40 }}>
                            {vm.hasMore ? (
                                <TouchableOpacity
                                    style={styles.loadMoreBtn}
                                    onPress={() => vm.loadReports(false, true)}
                                    disabled={vm.isLoading}
                                >
                                    {vm.isLoading ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <Text style={styles.loadMoreText}>Lihat Lebih Banyak</Text>
                                    )}
                                </TouchableOpacity>
                            ) : vm.reports.length > 7 && (
                                <TouchableOpacity
                                    style={styles.loadMoreBtn}
                                    onPress={() => vm.loadReports(true)}
                                >
                                    <Text style={styles.loadMoreText}>Lihat Lebih Sedikit</Text>
                                </TouchableOpacity>
                            )}
                            {!vm.hasMore && vm.reports.length > 0 && (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#999', fontSize: 12 }}>Sudah menampilkan semua laporan</Text>
                                </View>
                            )}
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>Tidak ada laporan</Text>
                            <Text style={styles.emptySubtext}>Semua laporan warga sudah tertangani.</Text>
                        </View>
                    }
                />
            )}

            <CustomAlertModal
                visible={vm.alertConfig.visible}
                title={vm.alertConfig.title}
                message={vm.alertConfig.message}
                type={vm.alertConfig.type}
                buttons={vm.alertConfig.buttons}
                onClose={vm.hideAlert}
            />
        </SafeAreaView>
    );
}
