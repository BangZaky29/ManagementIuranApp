import React, { useEffect, useState, useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Image, StatusBar, ActivityIndicator, Linking, Modal, TextInput,
    Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchReportById, updateReportStatus } from '../../services/laporan';
import { formatDateSafe, formatDateTimeSafe } from '../../utils/dateUtils';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomAlertModal } from '../../components/common/CustomAlertModal';
import * as ImagePicker from 'expo-image-picker';
import { createStyles } from './SecurityReportDetailStyles';
import { supabase } from '../../lib/supabaseConfig';
import { useTheme } from '../../contexts/ThemeContext';

export default function SecurityReportDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // UI States
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionImage, setCompletionImage] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Alert
    const [alertConfig, setAlertConfig] = useState<any>({
        visible: false, title: '', message: '', type: 'info', buttons: []
    });

    const loadData = async () => {
        if (!id) return;
        try {
            const report = await fetchReportById(id);
            if (report) {
                setData(report);
            }
        } catch (error) {
            console.error('Failed to load report detail:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const getRoleColor = (role?: string) => {
        if (role === 'admin') return colors.status.admin.text;
        if (role === 'security') return colors.status.security.text;
        return colors.status.warga.text;
    };

    const getRoleBg = (role?: string) => {
        if (role === 'admin') return colors.status.admin.bg;
        if (role === 'security') return colors.status.security.bg;
        return colors.status.warga.bg;
    };

    const handleUpdateStatus = async (status: string, options?: { reason?: string; completionImageUri?: string }) => {
        setIsUpdating(true);
        try {
            const actorId = (await supabase.auth.getUser()).data.user?.id;
            await updateReportStatus(data.id, status, {
                rejectionReason: options?.reason,
                completionImageUri: options?.completionImageUri,
                actorId: actorId
            });

            // Reload data
            await loadData();

            setAlertConfig({
                visible: true,
                title: 'Berhasil',
                message: `Status laporan berhasil diperbarui menjadi ${status}.`,
                type: 'success',
                buttons: [{ text: 'OK', onPress: () => setAlertConfig({ ...alertConfig, visible: false }) }]
            });
        } catch (error) {
            console.error('Update status error:', error);
            setAlertConfig({
                visible: true,
                title: 'Gagal',
                message: 'Terjadi kesalahan saat memperbarui status.',
                type: 'danger',
                buttons: [{ text: 'OK', onPress: () => setAlertConfig({ ...alertConfig, visible: false }) }]
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setCompletionImage(result.assets[0].uri);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={styles.container}>
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
                    <Text style={{ marginTop: 10, color: colors.textSecondary }}>Laporan tidak ditemukan.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleRewindStatus = () => {
        if (!data) return;
        let prevStatus = '';
        if (data.status === 'Selesai' || data.status === 'Ditolak') {
            prevStatus = 'Diproses';
        } else if (data.status === 'Diproses') {
            prevStatus = 'Menunggu';
        }

        if (!prevStatus) return;

        setAlertConfig({
            visible: true,
            title: 'Ulangi Progres?',
            message: `Apakah Anda yakin ingin mengembalikan status laporan ini ke "${prevStatus}"?`,
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: () => setAlertConfig({ ...alertConfig, visible: false }) },
                {
                    text: 'Ya, Kembalikan',
                    style: 'destructive',
                    onPress: () => {
                        setAlertConfig({ ...alertConfig, visible: false });
                        handleUpdateStatus(prevStatus);
                    }
                }
            ]
        });
    };

    const isProcessed = data.status === 'Diproses' || data.status === 'Selesai' || data.status === 'Ditolak';
    const isFinished = data.status === 'Selesai' || data.status === 'Ditolak';

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />
            <CustomHeader
                title="Detail Laporan"
                showBack={true}
                rightIcon={
                    (data.status !== 'Menunggu') ? (
                        <TouchableOpacity onPress={handleRewindStatus}>
                            <Ionicons name="arrow-undo-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    ) : undefined
                }
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Reporter Card */}
                <View style={styles.reporterCard}>
                    <View style={styles.reporterInfo}>
                        {data.profiles?.avatar_url ? (
                            <Image source={{ uri: data.profiles.avatar_url }} style={styles.reporterAvatar} />
                        ) : (
                            <View style={[styles.reporterAvatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={20} color={colors.textWhite} />
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.reporterName}>{data.profiles?.full_name || 'Warga'}</Text>
                            <Text style={styles.reporterAddress}>{data.profiles?.address || 'Alamat tidak tersedia'}</Text>
                        </View>
                    </View>
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>
                    <View style={styles.contentHeader}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{data.category}</Text>
                        </View>
                        <Text style={styles.timestamp}>{formatDateSafe(data.created_at)}</Text>
                    </View>

                    <Text style={styles.reportTitle}>{data.title}</Text>
                    <Text style={styles.reportDesc}>{data.description}</Text>

                    {data.image_url && (
                        <TouchableOpacity
                            onPress={() => setSelectedImage(data.image_url ?? null)}
                            style={styles.imageWrapper}
                        >
                            <Image source={{ uri: data.image_url }} style={styles.reportImage} resizeMode="cover" />
                            <View style={styles.zoomIcon}>
                                <Ionicons name="expand" size={16} color={colors.textWhite} />
                            </View>
                        </TouchableOpacity>
                    )}

                    {data.location && (
                        <TouchableOpacity
                            style={styles.locationBox}
                            onPress={() => Linking.openURL(data.location)}
                        >
                            <Ionicons name="location" size={16} color={colors.primary} />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {data.location.startsWith('http') ? 'Lihat Lokasi di Google Maps' : data.location}
                            </Text>
                            <Ionicons name="open-outline" size={14} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Progress Timeline (Warga Style) */}
                <View style={styles.timelineCard}>
                    <Text style={styles.sectionTitle}>Status Progres</Text>

                    <View style={styles.timeline}>
                        {/* Status 1: Menunggu */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineIconBox}>
                                <View style={[styles.timelineDot, { backgroundColor: colors.status.selesai.text }]}>
                                    <Ionicons name="checkmark" size={10} color={colors.textWhite} />
                                </View>
                                <View style={[styles.timelineLine, isProcessed && { backgroundColor: colors.status.diproses.text }]} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineLabel}>Laporan Diterima</Text>
                                <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>{formatDateTimeSafe(data.created_at)}</Text>
                                <Text style={styles.timelineSublabel}>Laporan masuk antrean penanganan.</Text>
                            </View>
                        </View>

                        {/* Status 2: Diproses */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineIconBox}>
                                <View style={[styles.timelineDot, { backgroundColor: isProcessed ? colors.status.diproses.text : colors.border }]}>
                                    {isProcessed && <Ionicons name="sync" size={10} color={colors.textWhite} />}
                                </View>
                                <View style={[styles.timelineLine, isFinished && { backgroundColor: isFinished ? (data.status === 'Ditolak' ? colors.status.ditolak.text : colors.status.selesai.text) : colors.border }]} />
                            </View>
                            <View style={styles.timelineContent}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    <Text style={[styles.timelineLabel, !isProcessed && styles.textInactive, { flex: 0 }]}>
                                        {isProcessed ? 'Sedang Diproses oleh ' : 'Tahap Peninjauan'}
                                    </Text>
                                    {isProcessed && (
                                        <Text style={{
                                            color: getRoleColor(data.processed_by?.role),
                                            fontWeight: 'bold',
                                            backgroundColor: getRoleBg(data.processed_by?.role),
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 4,
                                            fontSize: 12,
                                            overflow: 'hidden',
                                            marginLeft: 4
                                        }}>
                                            {data.processed_by?.role === 'admin' ? 'Admin' : 'Security'} {data.processed_by?.full_name || 'Petugas'}
                                        </Text>
                                    )}
                                </View>
                                <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 6 }}>{isProcessed ? formatDateTimeSafe(data.updated_at || data.created_at) : '-'}</Text>
                                <Text style={[styles.timelineSublabel, !isProcessed && styles.textInactive]}>
                                    Petugas sedang menindaklanjuti laporan ini.
                                </Text>
                            </View>
                        </View>

                        {/* Status 3: Selesai/Ditolak */}
                        <View style={[styles.timelineItem, { marginBottom: 0 }]}>
                            <View style={styles.timelineIconBox}>
                                <View style={[styles.timelineDot, { backgroundColor: isFinished ? (data.status === 'Ditolak' ? colors.status.ditolak.text : colors.status.selesai.text) : colors.border }]}>
                                    {isFinished && <Ionicons name={data.status === 'Ditolak' ? 'close' : 'checkmark-done'} size={10} color={colors.textWhite} />}
                                </View>
                            </View>
                            <View style={styles.timelineContent}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                                    <Text style={[styles.timelineLabel, !isFinished && styles.textInactive, { flex: 0 }]}>
                                        {data.status === 'Ditolak' ? 'Laporan Ditolak' :
                                            data.status === 'Selesai' ? 'Laporan Selesai oleh ' : 'Selesai Penanganan'}
                                    </Text>
                                    {isFinished && data.status === 'Selesai' && (
                                        <Text style={{
                                            color: getRoleColor(data.completed_by?.role),
                                            fontWeight: 'bold',
                                            backgroundColor: getRoleBg(data.completed_by?.role),
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 4,
                                            fontSize: 12,
                                            overflow: 'hidden',
                                            marginLeft: 4,
                                            marginTop: 2
                                        }}>
                                            {data.completed_by?.role === 'admin' ? 'Admin' : 'Security'} {data.completed_by?.full_name || 'Petugas'}
                                        </Text>
                                    )}
                                </View>
                                <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 6 }}>{isFinished ? formatDateTimeSafe(data.updated_at || data.created_at) : '-'}</Text>
                                <Text style={[styles.timelineSublabel, !isFinished && styles.textInactive]}>
                                    {data.status === 'Selesai' ? 'Kendala telah diatasi sepenuhnya.' :
                                        data.status === 'Ditolak' ? `Ditolak: ${data.rejection_reason || '-'}` :
                                            'Hasil akhir penanganan laporan.'}
                                </Text>

                                {isFinished && data.status === 'Selesai' && data.completion_image_url && (
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: colors.success + '1A',
                                            paddingVertical: 8,
                                            paddingHorizontal: 12,
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor: colors.success + '33',
                                            alignSelf: 'flex-start',
                                            marginTop: 8
                                        }}
                                        onPress={() => setSelectedImage(data.completion_image_url ?? null)}
                                    >
                                        <Ionicons name="image-outline" size={16} color={colors.success} />
                                        <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: 'bold', color: colors.success }}>Lihat Bukti Penanganan</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Action Bar */}
            {!isFinished && (
                <View style={styles.actionBar}>
                    {data.status === 'Menunggu' ? (
                        <TouchableOpacity
                            style={[styles.mainBtn, { backgroundColor: colors.primary }]}
                            onPress={() => handleUpdateStatus('Diproses')}
                            disabled={isUpdating}
                        >
                            <Ionicons name="play-circle-outline" size={20} color={colors.textWhite} />
                            <Text style={styles.btnLabel}>Proses Laporan</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.mainBtn, { backgroundColor: colors.success }]}
                            onPress={() => setShowCompletionModal(true)}
                            disabled={isUpdating}
                        >
                            <Ionicons name="checkmark-circle-outline" size={20} color={colors.textWhite} />
                            <Text style={styles.btnLabel}>Tandai Selesai</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => setShowRejectionModal(true)}
                        disabled={isUpdating}
                    >
                        <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
                        <Text style={[styles.btnLabel, { color: colors.danger }]}>Tolak</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Rejection Modal */}
            <Modal visible={showRejectionModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Tolak Laporan</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Berikan alasan penolakan..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={4}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setShowRejectionModal(false)}
                            >
                                <Text style={styles.modalBtnText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnConfirm]}
                                onPress={() => {
                                    handleUpdateStatus('Ditolak', { reason: rejectionReason });
                                    setShowRejectionModal(false);
                                }}
                            >
                                <Text style={[styles.modalBtnText, { color: colors.textWhite }]}>Konfirmasi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Completion Modal */}
            <Modal visible={showCompletionModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selesaikan Laporan</Text>
                        <Text style={styles.modalSubtitle}>Anda bisa melampirkan foto bukti pengerjaan (opsional).</Text>

                        {completionImage ? (
                            <View style={styles.imagePreviewBox}>
                                <Image source={{ uri: completionImage }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageBtn}
                                    onPress={() => setCompletionImage(null)}
                                >
                                    <Ionicons name="close" size={20} color={colors.textWhite} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
                                <Ionicons name="camera" size={32} color={colors.primary} />
                                <Text style={styles.pickImageText}>Ambil Foto Bukti</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setShowCompletionModal(false)}
                            >
                                <Text style={styles.modalBtnText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.success }]}
                                onPress={() => {
                                    handleUpdateStatus('Selesai', { completionImageUri: completionImage || undefined });
                                    setShowCompletionModal(false);
                                }}
                            >
                                <Text style={[styles.modalBtnText, { color: colors.textWhite }]}>Selesai</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <CustomAlertModal
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />

            {/* Full Screen Image Viewer Modal */}
            <Modal
                visible={!!selectedImage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedImage(null)}
            >
                <TouchableOpacity
                    style={styles.imageViewerOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedImage(null)}
                >
                    <View style={styles.imageViewerContent}>
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.fullImage}
                                resizeMode="contain"
                            />
                        )}
                        <TouchableOpacity
                            style={styles.closeImageBtn}
                            onPress={() => setSelectedImage(null)}
                        >
                            <Ionicons name="close" size={28} color={colors.textWhite} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}
