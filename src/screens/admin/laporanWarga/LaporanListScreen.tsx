import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, ScrollView, RefreshControl } from 'react-native';
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

const CATEGORIES = ['Semua', 'Fasilitas Umum', 'Keamanan', 'Kebersihan', 'Lainnya'];
const STATUSES = ['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Ditolak'];

export default function LaporanListScreen() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Filters
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [filterStatus, setFilterStatus] = useState('Semua');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            // Join with profiles table to get user name
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
            Alert.alert('Error', 'Gagal memuat laporan warga');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setIsUpdating(id);
        try {
            const { error } = await supabase
                .from('reports')
                .update({ status: newStatus, updated_at: new Date() })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            const updatedReports = reports.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            );
            setReports(updatedReports);

            // Also update selected report if open
            if (selectedReport && selectedReport.id === id) {
                setSelectedReport({ ...selectedReport, status: newStatus });
            }

            Alert.alert('Sukses', `Status laporan diubah menjadi ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Gagal memperbarui status');
        } finally {
            setIsUpdating(null);
        }
    };

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

    const openDetail = (report: Report) => {
        setSelectedReport(report);
        setDetailModalVisible(true);
    };

    const renderItem = ({ item }: { item: Report }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openDetail(item)}
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user?.full_name || 'Warga'}</Text>
                    <Text style={styles.dateText}>
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.reportCategory}>{item.category}</Text>
                <Text style={styles.reportTitle}>{item.title}</Text>
                <Text style={styles.reportDescription} numberOfLines={3}>{item.description}</Text>

                {item.image_url && (
                    <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 150, borderRadius: 8, marginTop: 8 }} resizeMode="cover" />
                )}
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.locationText}>Klik untuk detail & aksi</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <CustomHeader title="Laporan Warga" showBack={false} />

            {/* Filters */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.filterChip, filterCategory === cat && styles.filterChipActive]}
                            onPress={() => setFilterCategory(cat)}
                        >
                            <Text style={[styles.filterText, filterCategory === cat && styles.filterTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterScroll, { marginTop: 8 }]}>
                    {STATUSES.map(stat => (
                        <TouchableOpacity
                            key={stat}
                            style={[styles.filterChip, filterStatus === stat && styles.filterChipActive]}
                            onPress={() => setFilterStatus(stat)}
                        >
                            <Text style={[styles.filterText, filterStatus === stat && styles.filterTextActive]}>{stat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

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

            {/* Detail Modal */}
            <Modal
                visible={detailModalVisible}
                animationType="slide"
                onRequestClose={() => setDetailModalVisible(false)}
            >
                {selectedReport && (
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.closeButton}>
                                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Detail Laporan</Text>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {selectedReport.image_url && (
                                <Image source={{ uri: selectedReport.image_url }} style={styles.modalImage} resizeMode="cover" />
                            )}

                            <View style={styles.modalBody}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Pelapor</Text>
                                    <Text style={styles.detailValue}>{selectedReport.user?.full_name || 'Warga'}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Judul</Text>
                                    <Text style={styles.detailValue}>{selectedReport.title}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Status</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status) }]}>
                                            <Text style={styles.statusText}>{selectedReport.status}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Kategori</Text>
                                    <Text style={styles.detailValue}>{selectedReport.category}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Deskripsi</Text>
                                    <Text style={styles.detailValue}>{selectedReport.description}</Text>
                                </View>

                                {selectedReport.location && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Lokasi</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="location" size={18} color={Colors.primary} />
                                            <Text style={[styles.detailValue, { marginLeft: 6 }]}>{selectedReport.location}</Text>
                                        </View>
                                        <View style={styles.mapPlaceholder}>
                                            <Text style={{ color: Colors.textSecondary }}>Peta Lokasi (Coming Soon)</Text>
                                        </View>
                                    </View>
                                )}

                                <View style={{ height: 20 }} />
                                <Text style={styles.detailLabel}>Aksi Admin</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                                    {selectedReport.status === 'Menunggu' && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: Colors.primary, flex: 1, justifyContent: 'center' }]}
                                            onPress={() => { handleUpdateStatus(selectedReport.id, 'Diproses'); setDetailModalVisible(false); }}
                                        >
                                            <Text style={styles.actionText}>Proses Laporan</Text>
                                        </TouchableOpacity>
                                    )}
                                    {selectedReport.status === 'Diproses' && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: Colors.success, flex: 1, justifyContent: 'center' }]}
                                            onPress={() => { handleUpdateStatus(selectedReport.id, 'Selesai'); setDetailModalVisible(false); }}
                                        >
                                            <Text style={styles.actionText}>Tandai Selesai</Text>
                                        </TouchableOpacity>
                                    )}
                                    {(selectedReport.status === 'Menunggu' || selectedReport.status === 'Diproses') && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: Colors.danger, flex: 1, justifyContent: 'center' }]}
                                            onPress={() => { handleUpdateStatus(selectedReport.id, 'Ditolak'); setDetailModalVisible(false); }}
                                        >
                                            <Text style={styles.actionText}>Tolak</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                )}
            </Modal>
        </View>
    );
}
