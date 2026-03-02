import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    Image, StatusBar, ActivityIndicator, Linking, Modal, TextInput,
    Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchReportById, updateReportStatus } from '../../services/laporanService';
import { formatDateSafe } from '../../utils/dateUtils';
import { CustomHeader } from '../../components/CustomHeader';
import { CustomAlertModal } from '../../components/CustomAlertModal';
import { Colors } from '../../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './SecurityReportDetailStyles';
import { supabase } from '../../lib/supabaseConfig';

export default function SecurityReportDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // UI States
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionImage, setCompletionImage] = useState<string | null>(null);
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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={styles.container}>
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="alert-circle-outline" size={64} color="#CCC" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Laporan tidak ditemukan.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isProcessed = data.status === 'Diproses' || data.status === 'Selesai' || data.status === 'Ditolak';
    const isFinished = data.status === 'Selesai' || data.status === 'Ditolak';

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <CustomHeader title="Detail Laporan" showBack={true} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Reporter Card */}
                <View style={styles.reporterCard}>
                    <View style={styles.reporterInfo}>
                        {data.profiles?.avatar_url ? (
                            <Image source={{ uri: data.profiles.avatar_url }} style={styles.reporterAvatar} />
                        ) : (
                            <View style={[styles.reporterAvatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={20} color="#FFF" />
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
                            onPress={() => Linking.openURL(data.image_url)}
                            style={styles.imageWrapper}
                        >
                            <Image source={{ uri: data.image_url }} style={styles.reportImage} resizeMode="cover" />
                            <View style={styles.zoomIcon}>
                                <Ionicons name="expand" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                    )}

                    {data.location && (
                        <TouchableOpacity
                            style={styles.locationBox}
                            onPress={() => Linking.openURL(data.location)}
                        >
                            <Ionicons name="location" size={16} color={Colors.primary} />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {data.location.startsWith('http') ? 'Lihat Lokasi di Google Maps' : data.location}
                            </Text>
                            <Ionicons name="open-outline" size={14} color={Colors.primary} />
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
                                <View style={[styles.timelineDot, styles.dotActive]}>
                                    <Ionicons name="checkmark" size={10} color="white" />
                                </View>
                                <View style={[styles.timelineLine, isProcessed && styles.lineActive]} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineLabel}>Laporan Diterima</Text>
                                <Text style={styles.timelineSublabel}>Laporan masuk antrean penanganan.</Text>
                            </View>
                        </View>

                        {/* Status 2: Diproses */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineIconBox}>
                                <View style={[styles.timelineDot, isProcessed ? styles.dotActive : styles.dotInactive]}>
                                    {isProcessed && <Ionicons name="sync" size={10} color="white" />}
                                </View>
                                <View style={[styles.timelineLine, isFinished && styles.lineActive]} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={[styles.timelineLabel, !isProcessed && styles.textInactive]}>
                                    {data.status === 'Diproses' || data.status === 'Selesai'
                                        ? `Sedang Diproses oleh ${data.processed_by?.role === 'admin' ? 'Admin' : 'Security'} ${data.processed_by?.full_name || 'Petugas'}`
                                        : 'Tahap Peninjauan'}
                                </Text>
                                <Text style={[styles.timelineSublabel, !isProcessed && styles.textInactive]}>
                                    Petugas sedang menindaklanjuti laporan ini.
                                </Text>
                            </View>
                        </View>

                        {/* Status 3: Selesai/Ditolak */}
                        <View style={[styles.timelineItem, { marginBottom: 0 }]}>
                            <View style={styles.timelineIconBox}>
                                <View style={[styles.timelineDot, isFinished ? (data.status === 'Ditolak' ? styles.dotDanger : styles.dotActive) : styles.dotInactive]}>
                                    {isFinished && <Ionicons name={data.status === 'Ditolak' ? 'close' : 'checkmark-done'} size={10} color="white" />}
                                </View>
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={[styles.timelineLabel, !isFinished && styles.textInactive]}>
                                    {data.status === 'Ditolak' ? 'Laporan Ditolak' :
                                        data.status === 'Selesai'
                                            ? `Laporan Selesai oleh ${data.completed_by?.role === 'admin' ? 'Admin' : 'Security'} ${data.completed_by?.full_name || 'Petugas'}`
                                            : 'Selesai Penanganan'}
                                </Text>
                                <Text style={[styles.timelineSublabel, !isFinished && styles.textInactive]}>
                                    {data.status === 'Selesai' ? 'Kendala telah diatasi sepenuhnya.' :
                                        data.status === 'Ditolak' ? `Ditolak: ${data.rejection_reason || '-'}` :
                                            'Hasil akhir penanganan laporan.'}
                                </Text>

                                {data.completion_image_url && (
                                    <TouchableOpacity
                                        style={styles.proofBox}
                                        onPress={() => Linking.openURL(data.completion_image_url)}
                                    >
                                        <Image source={{ uri: data.completion_image_url }} style={styles.proofImage} />
                                        <View style={styles.proofBadge}>
                                            <Ionicons name="camera" size={10} color="white" />
                                            <Text style={styles.proofText}>Bukti Selesai</Text>
                                        </View>
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
                            style={[styles.mainBtn, { backgroundColor: Colors.primary }]}
                            onPress={() => handleUpdateStatus('Diproses')}
                            disabled={isUpdating}
                        >
                            <Ionicons name="play-circle-outline" size={20} color="white" />
                            <Text style={styles.btnLabel}>Proses Laporan</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.mainBtn, { backgroundColor: Colors.success }]}
                            onPress={() => setShowCompletionModal(true)}
                            disabled={isUpdating}
                        >
                            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                            <Text style={styles.btnLabel}>Tandai Selesai</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => setShowRejectionModal(true)}
                        disabled={isUpdating}
                    >
                        <Ionicons name="close-circle-outline" size={20} color={Colors.danger} />
                        <Text style={[styles.btnLabel, { color: Colors.danger }]}>Tolak</Text>
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
                                <Text style={[styles.modalBtnText, { color: 'white' }]}>Konfirmasi</Text>
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
                                    <Ionicons name="close" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
                                <Ionicons name="camera" size={32} color={Colors.primary} />
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
                                style={[styles.modalBtn, { backgroundColor: Colors.success }]}
                                onPress={() => {
                                    handleUpdateStatus('Selesai', { completionImageUri: completionImage || undefined });
                                    setShowCompletionModal(false);
                                }}
                            >
                                <Text style={[styles.modalBtnText, { color: 'white' }]}>Selesai</Text>
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
        </SafeAreaView>
    );
}
