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

const STATUS_FILTERS = ['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Ditolak'];

export default function SecurityReportsScreen() {
    const vm = useSecurityReportsViewModel();
    const { colors } = useTheme();
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionImage, setCompletionImage] = useState<string | null>(null);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

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

    const openLocation = (url: string | null) => {
        if (url && url.startsWith('http')) {
            Linking.openURL(url);
        }
    };

    const handleRejectPress = (reportId: string) => {
        setSelectedReportId(reportId);
        setRejectionReason('');
        setShowRejectionModal(true);
    };

    const handleCompletePress = (reportId: string) => {
        setSelectedReportId(reportId);
        setCompletionImage(null);
        setShowCompletionModal(true);
    };

    const confirmRejection = () => {
        if (selectedReportId) {
            vm.handleUpdateStatus(selectedReportId, 'Ditolak', { reason: rejectionReason });
            setShowRejectionModal(false);
            setSelectedReportId(null);
        }
    };

    const confirmCompletion = () => {
        if (selectedReportId) {
            vm.handleUpdateStatus(selectedReportId, 'Selesai', { completionImageUri: completionImage || undefined });
            setShowCompletionModal(false);
            setSelectedReportId(null);
        }
    };

    const handlePickCompletionImage = async () => {
        const uri = await vm.pickCompletionImage();
        if (uri) setCompletionImage(uri);
    };

    const renderReportItem = ({ item }: { item: any }) => {
        const { bg, text } = getStatusStyle(item.status);
        const hasLocation = item.location && item.location.startsWith('http');

        return (
            <View style={styles.reportCard}>
                <View style={styles.cardHeader}>
                    {item.profiles?.avatar_url ? (
                        <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={20} color={colors.primary} />
                        </View>
                    )}
                    <View style={styles.headerInfo}>
                        <Text style={styles.userName}>{item.profiles?.full_name || 'Warga'}</Text>
                        <Text style={styles.dateText}>{formatDateSafe(item.created_at)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                        <Text style={[styles.statusText, { color: text }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.reportTitle}>{item.title}</Text>
                    <Text style={styles.reportDesc}>{item.description}</Text>

                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>

                    {item.image_url && (
                        <View style={{
                            marginTop: 12,
                            borderRadius: 12,
                            overflow: 'hidden',
                            borderWidth: 1,
                            borderColor: '#F0F0F0'
                        }}>
                            <Image source={{ uri: item.image_url }} style={styles.imagePreview} resizeMode="cover" />
                        </View>
                    )}

                    {item.location && (
                        <TouchableOpacity
                            style={styles.locationRow}
                            onPress={() => openLocation(item.location)}
                            disabled={!hasLocation}
                        >
                            <Ionicons name="location" size={14} color={colors.primary} />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {hasLocation ? 'Lihat Lokasi di Maps' : item.location}
                            </Text>
                            {hasLocation && <Ionicons name="open-outline" size={12} color={colors.primary} />}
                        </TouchableOpacity>
                    )}

                    {/* Rejection Reason display */}
                    {item.status === 'Ditolak' && item.rejection_reason && (
                        <View style={styles.rejectionBox}>
                            <Text style={styles.rejectionLabel}>Catatan Penolakan:</Text>
                            <Text style={styles.rejectionText}>{item.rejection_reason}</Text>
                        </View>
                    )}
                </View>

                {/* Security Actions */}
                {item.status !== 'Selesai' && item.status !== 'Ditolak' && (
                    <View style={styles.actionRow}>
                        {item.status === 'Menunggu' ? (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.btnBlue]}
                                onPress={() => vm.handleUpdateStatus(item.id, 'Diproses')}
                            >
                                <Ionicons name="play-circle-outline" size={18} color="#FFF" />
                                <Text style={styles.btnText}>Proses</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.btnGreen]}
                                onPress={() => handleCompletePress(item.id)}
                            >
                                <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                                <Text style={styles.btnText}>Selesaikan</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' }]}
                            onPress={() => handleRejectPress(item.id)}
                        >
                            <Ionicons name="close-circle-outline" size={18} color="#6B7280" />
                            <Text style={[styles.btnText, { color: '#6B7280' }]}>Tolak</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
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
                        vm.hasMore ? (
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
                        ) : (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: '#999', fontSize: 12 }}>Sudah menampilkan semua laporan</Text>
                            </View>
                        )
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

            {/* Rejection Modal */}
            <Modal
                visible={showRejectionModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowRejectionModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowRejectionModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalContent}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                <Ionicons name="close-circle" size={24} color="#EF4444" />
                            </View>
                            <View>
                                <Text style={styles.modalTitle}>Tolak Laporan</Text>
                                <Text style={{ fontSize: 12, color: '#666' }}>Berikan alasan penolakan</Text>
                            </View>
                        </View>

                        <Text style={styles.modalSubtitle}>Mohon berikan catatan agar warga memahami mengapa laporan ini tidak dapat diproses.</Text>

                        <TextInput
                            style={[styles.input, { height: 120 }]}
                            placeholder="Contoh: Lokasi tidak ditemukan atau laporan tidak sesuai kategori..."
                            placeholderTextColor="#9CA3AF"
                            multiline={true}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.btnCancel]}
                                onPress={() => setShowRejectionModal(false)}
                            >
                                <Text style={[styles.btnText, { color: '#666' }]}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.btnConfirm, !rejectionReason.trim() && { opacity: 0.6 }]}
                                onPress={confirmRejection}
                                disabled={!rejectionReason.trim()}
                            >
                                <Text style={styles.btnText}>Konfirmasi Tolak</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Completion Modal */}
            <Modal
                visible={showCompletionModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCompletionModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCompletionModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalContent}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            </View>
                            <View>
                                <Text style={styles.modalTitle}>Selesaikan Laporan</Text>
                                <Text style={{ fontSize: 12, color: '#666' }}>Konfirmasi penanganan selesai</Text>
                            </View>
                        </View>

                        <Text style={styles.modalSubtitle}>Anda dapat melampirkan foto bukti pengerjaan atau hasil akhir laporan ini (opsional).</Text>

                        {completionImage ? (
                            <View style={{ position: 'relative', marginBottom: 20, borderRadius: 12, overflow: 'hidden' }}>
                                <Image source={{ uri: completionImage }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
                                <TouchableOpacity
                                    style={{
                                        position: 'absolute', top: 8, right: 8,
                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                        width: 32, height: 32, borderRadius: 16,
                                        justifyContent: 'center', alignItems: 'center'
                                    }}
                                    onPress={() => setCompletionImage(null)}
                                >
                                    <Ionicons name="close" size={20} color={Colors.danger} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={{
                                    borderWidth: 1.5,
                                    borderColor: Colors.green4,
                                    borderStyle: 'dashed',
                                    borderRadius: 12,
                                    paddingVertical: 30,
                                    alignItems: 'center',
                                    marginBottom: 20,
                                    backgroundColor: '#F0FDF4'
                                }}
                                onPress={handlePickCompletionImage}
                            >
                                <Ionicons name="camera" size={32} color={Colors.green4} />
                                <Text style={{ marginTop: 8, color: Colors.green5, fontWeight: '600', fontSize: 13 }}>Ambil Foto Bukti (Opsional)</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.btnCancel]}
                                onPress={() => setShowCompletionModal(false)}
                            >
                                <Text style={[styles.btnText, { color: '#666' }]}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.btnConfirm, { backgroundColor: Colors.green5 }]}
                                onPress={confirmCompletion}
                            >
                                <Text style={styles.btnText}>Selesai</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

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
