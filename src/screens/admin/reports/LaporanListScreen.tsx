import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, ScrollView, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabaseConfig';
import { createStyles } from './LaporanListStyles';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { Colors } from '../../../constants/Colors';
import { formatDateTimeSafe } from '../../../utils/dateUtils';
import { useTheme } from '../../../contexts/ThemeContext';

// Type definition based on db schema
type Report = {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    image_url: string | null;
    location: string | null;
    created_at: string;
    user: {
        full_name: string;
        avatar_url: string | null;
    } | null;
};

const CATEGORIES = ['Semua', 'Fasilitas', 'Keamanan', 'Kebersihan', 'Lainnya'];
const STATUSES = ['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Ditolak'];

export default function LaporanListScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    // Pagination
    const [visibleCount, setVisibleCount] = useState(7);
    const PAGE_SIZE = 7;

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            await fetchReportsData();
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReportsData = async () => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select(`
                    *,
                    user:profiles!reports_user_id_fkey(full_name, avatar_url)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            // Silent error or toast if needed, but alert might be annoying on auto-refresh
        }
    };

    useEffect(() => {
        fetchReports();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('public:reports')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'reports' },
                (payload) => {
                    console.log('Real-time update received:', payload);
                    fetchReportsData(); // Reload data on any change
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);


    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Menunggu': return { bg: colors.status.menunggu.bg, text: colors.status.menunggu.text };
            case 'Diproses': return { bg: colors.status.diproses.bg, text: colors.status.diproses.text };
            case 'Selesai': return { bg: colors.status.selesai.bg, text: colors.status.selesai.text };
            case 'Ditolak': return { bg: colors.status.ditolak.bg, text: colors.status.ditolak.text };
            default: return { bg: '#F3F4F6', text: colors.textSecondary };
        }
    };

    const filteredReports = useMemo(() => {
        return reports.filter(item => {
            const matchCategory = filterCategory === 'Semua' || item.category === filterCategory;
            const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
            return matchCategory && matchStatus;
        });
    }, [reports, filterCategory, filterStatus]);

    const paginatedReports = useMemo(() => {
        return filteredReports.slice(0, visibleCount);
    }, [filteredReports, visibleCount]);

    const pendingCount = useMemo(() => reports.filter(r => r.status === 'Menunggu').length, [reports]);
    const processingCount = useMemo(() => reports.filter(r => r.status === 'Diproses').length, [reports]);

    const handleShowMore = () => setVisibleCount(prev => prev + PAGE_SIZE);
    const handleShowLess = () => setVisibleCount(PAGE_SIZE);

    const openDetail = (reportId: string) => {
        router.push(`/admin/laporan/${reportId}` as any);
    };

    const renderItem = ({ item }: { item: Report }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openDetail(item.id)}
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    {item.user?.avatar_url ? (
                        <Image
                            source={{ uri: item.user.avatar_url }}
                            style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8, backgroundColor: '#eee' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.green1, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                            <Ionicons name="person" size={16} color={Colors.primary} />
                        </View>
                    )}
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={styles.userName}>{item.user?.full_name || 'Warga'}</Text>
                        <Text style={styles.dateText}>
                            {formatDateTimeSafe(item.created_at)}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(item.status).bg }]}>
                    <Text style={[styles.statusText, { color: getStatusStyle(item.status).text }]}>{item.status}</Text>
                </View>
            </View>

            {/* Removed Description/Image/Footer as requested */}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <CustomHeader
                title=""
                showBack={true}
                rightIcon={
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: 250, justifyContent: 'flex-start' }}>
                        <Text style={[styles.headerTitle]}>Laporan Warga</Text>
                        <View style={{ flexDirection: 'row', marginLeft: 8, gap: 4 }}>
                            {pendingCount > 0 && (
                                <View style={[styles.headerBubble, { backgroundColor: colors.status.menunggu.bg }]}>
                                    <Text style={[styles.bubbleText, { color: colors.status.menunggu.text }]}>{pendingCount}</Text>
                                </View>
                            )}
                            {processingCount > 0 && (
                                <View style={[styles.headerBubble, { backgroundColor: colors.status.diproses.bg }]}>
                                    <Text style={[styles.bubbleText, { color: colors.status.diproses.text }]}>{processingCount}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                }
            />

            {/* Filters */}
            <View style={styles.filterContainer}>
                {/* Category Dropdown */}
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowCategoryModal(true)}
                >
                    <View>
                        <Text style={styles.dropdownLabel}>Kategori</Text>
                        <Text style={styles.dropdownText}>{filterCategory}</Text>
                    </View>
                    <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>

                {/* Status Dropdown */}
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowStatusModal(true)}
                >
                    <View>
                        <Text style={styles.dropdownLabel}>Status</Text>
                        <Text style={styles.dropdownText}>{filterStatus}</Text>
                    </View>
                    <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Category Modal */}
            <Modal
                visible={showCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCategoryModal(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pilih Kategori</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)} style={styles.modalClose}>
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.modalItem, filterCategory === cat && styles.modalItemActive]}
                                    onPress={() => {
                                        setFilterCategory(cat);
                                        setShowCategoryModal(false);
                                    }}
                                >
                                    <Text style={[styles.modalItemText, filterCategory === cat && styles.modalItemTextActive]}>
                                        {cat}
                                    </Text>
                                    {filterCategory === cat && (
                                        <Ionicons name="checkmark" size={20} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Status Modal */}
            <Modal
                visible={showStatusModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowStatusModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowStatusModal(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pilih Status</Text>
                            <TouchableOpacity onPress={() => setShowStatusModal(false)} style={styles.modalClose}>
                                <Ionicons name="close" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {STATUSES.map((stat) => (
                                <TouchableOpacity
                                    key={stat}
                                    style={[styles.modalItem, filterStatus === stat && styles.modalItemActive]}
                                    onPress={() => {
                                        setFilterStatus(stat);
                                        setShowStatusModal(false);
                                    }}
                                >
                                    <Text style={[styles.modalItemText, filterStatus === stat && styles.modalItemTextActive]}>
                                        {stat}
                                    </Text>
                                    {filterStatus === stat && (
                                        <Ionicons name="checkmark" size={20} color={Colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={paginatedReports}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListFooterComponent={
                        <View style={{ marginBottom: 20 }}>
                            {filteredReports.length > visibleCount ? (
                                <TouchableOpacity style={styles.paginationBtn} onPress={handleShowMore}>
                                    <Text style={styles.paginationBtnText}>Lihat lebih banyak</Text>
                                    <Ionicons name="chevron-down" size={16} color={Colors.primary} />
                                </TouchableOpacity>
                            ) : filteredReports.length > PAGE_SIZE && (
                                <TouchableOpacity style={styles.paginationBtn} onPress={handleShowLess}>
                                    <Text style={styles.paginationBtnText}>Lihat lebih sedikit</Text>
                                    <Ionicons name="chevron-up" size={16} color={Colors.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={48} color={Colors.textSecondary} />
                            <Text style={styles.emptyStateText}>Belum ada laporan masuk</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={fetchReports} />
                    }
                />
            )}
        </View>
    );
}
