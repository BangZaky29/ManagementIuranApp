import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, ScrollView, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabaseConfig';
import { styles } from './LaporanListStyles';
import { CustomHeader } from '../../../components/CustomHeader';
import { Colors } from '../../../constants/Colors';

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
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

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
                    user:profiles(full_name, avatar_url)
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


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Menunggu': return Colors.warning;
            case 'Diproses': return Colors.primary;
            case 'Selesai': return Colors.success;
            case 'Ditolak': return Colors.danger;
            default: return Colors.textSecondary;
        }
    };

    const filteredReports = useMemo(() => {
        return reports.filter(item => {
            const matchCategory = filterCategory === 'Semua' || item.category === filterCategory;
            const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
            return matchCategory && matchStatus;
        });
    }, [reports, filterCategory, filterStatus]);

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
                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            {/* Removed Description/Image/Footer as requested */}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <CustomHeader title="Laporan Warga" showBack={false} />

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
                    data={filteredReports}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
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
