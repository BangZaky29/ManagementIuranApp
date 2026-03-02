import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar, Image, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReportDetailStyles as styles } from './ReportDetailStyles';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/CustomHeader';
import { Ionicons } from '@expo/vector-icons';

import { useReportDetailViewModel } from './ReportDetailViewModel';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { ReportLocationViewer } from '../../../components/ReportLocationViewer';
import { formatDateTimeSafe } from '../../../utils/dateUtils';

export default function ReportDetailScreen() {
    const {
        data,
        loading,
        imageAspectRatio,
        alertVisible,
        alertConfig,
        hideAlert,
        handleOpenLocation,
        handleDelete,
        handleEdit,
        getStatusColor,
        getStatusBg,
        refresh
    } = useReportDetailViewModel();
    const [showProofModal, setShowProofModal] = useState(false);

    // Reload data when screen is focused (in case we return from Edit)
    useFocusEffect(
        React.useCallback(() => {
            refresh();
        }, [])
    );

    if (loading) {
        return (
            <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Memuat...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Laporan tidak ditemukan.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const formattedDate = formatDateTimeSafe(data.created_at);
    const updatedDate = data.updated_at ? formatDateTimeSafe(data.updated_at) : null;

    // Timeline helpers
    const isProcessed = data.status !== 'Menunggu';
    const isFinal = data.status === 'Selesai' || data.status === 'Ditolak';

    const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
        switch (category) {
            case 'Fasilitas': return 'construct-outline';
            case 'Kebersihan': return 'leaf-outline';
            case 'Keamanan': return 'shield-checkmark-outline';
            case 'Infrastruktur': return 'build-outline';
            default: return 'help-circle-outline';
        }
    };

    return (
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <CustomHeader title="Detail Laporan" showBack={true} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Main Card */}
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(data.status) }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(data.status) }]}>{data.status}</Text>
                        </View>

                        <View style={styles.actionButtonsRow}>
                            {/* Edit Button */}
                            {data.status === 'Menunggu' && (
                                <TouchableOpacity onPress={handleEdit} style={styles.iconBtn}>
                                    <Ionicons name="create-outline" size={18} color={Colors.primary} />
                                </TouchableOpacity>
                            )}
                            {/* Delete Button */}
                            <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
                                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.title}>{data.title}</Text>

                    <View style={styles.categoryRow}>
                        <View style={styles.categoryIcon}>
                            <Ionicons name={getCategoryIcon(data.category)} size={16} color={Colors.green5} />
                        </View>
                        <Text style={styles.category}>{data.category}</Text>
                    </View>

                    <Text style={styles.description}>{data.description}</Text>

                    {data.image_url && (
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: data.image_url }}
                                style={[styles.image, { aspectRatio: imageAspectRatio }]}
                                resizeMode="cover"
                            />
                        </View>
                    )}

                    <ReportLocationViewer
                        locationUrl={data.location}
                        onOpenLocation={handleOpenLocation}
                    />
                </View>

                {/* Modern Status Timeline */}
                <View style={styles.timelineSection}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="time-outline" size={24} color={Colors.green5} />
                        <Text style={styles.sectionTitle}>Alur Penanganan</Text>
                    </View>

                    <View style={styles.timelineWrapper}>
                        {/* Status 1: Created */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.dot, styles.dotActive]}>
                                    <Ionicons name="checkmark" size={10} color="white" />
                                </View>
                                <View style={[styles.line, (isProcessed || isFinal) && styles.lineActive]} />
                            </View>
                            <View style={styles.timelineContent}>
                                <View style={styles.timelineHeader}>
                                    <Text style={styles.timelineTitle}>Laporan Diterima</Text>
                                    <Text style={styles.timelineDate}>{formattedDate}</Text>
                                </View>
                                <Text style={styles.timelineDesc}>Laporan berhasil dikirim dan masuk ke sistem Antrean Manajemen Laporan.</Text>
                            </View>
                        </View>

                        {/* Status 2: Processed */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.dot, isProcessed ? styles.dotActive : styles.dotInactive]}>
                                    {isProcessed && <Ionicons name="search" size={10} color="white" />}
                                </View>
                                <View style={[styles.line, isFinal && styles.lineActive]} />
                            </View>
                            <View style={styles.timelineContent}>
                                <View style={styles.timelineHeader}>
                                    <Text style={[styles.timelineTitle, !isProcessed && { color: '#9CA3AF' }]}>
                                        {isProcessed ? 'Sedang Diproses' : 'Tahap Peninjauan'}
                                    </Text>
                                    {isProcessed && updatedDate && (
                                        <Text style={styles.timelineDate}>{updatedDate}</Text>
                                    )}
                                </View>
                                <Text style={[styles.timelineDesc, !isProcessed && { color: '#9CA3AF' }]}>
                                    {isProcessed
                                        ? 'Laporan telah divalidasi dan saat ini dalam tahap penanganan oleh petugas terkait.'
                                        : 'Laporan Anda menunggu konfirmasi petugas untuk segera ditindaklanjuti.'}
                                </Text>
                            </View>
                        </View>

                        {/* Status 3: Final */}
                        <View style={[styles.timelineItem, { minHeight: undefined }]}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.dot, isFinal ? styles.dotActive : styles.dotInactive]}>
                                    {isFinal && <Ionicons name={data.status === 'Ditolak' ? 'close' : 'star'} size={10} color="white" />}
                                </View>
                            </View>
                            <View style={[styles.timelineContent, { paddingBottom: 0 }]}>
                                <View style={styles.timelineHeader}>
                                    <Text style={[styles.timelineTitle, !isFinal && { color: '#9CA3AF' }]}>
                                        {data.status === 'Ditolak' ? 'Laporan Ditolak' :
                                            data.status === 'Selesai' ? 'Laporan Selesai' : 'Laporan Ditutup'}
                                    </Text>
                                    {isFinal && updatedDate && (
                                        <Text style={styles.timelineDate}>{updatedDate}</Text>
                                    )}
                                </View>
                                <Text style={[styles.timelineDesc, !isFinal && { color: '#9CA3AF' }]}>
                                    {data.status === 'Selesai' ? 'Terima kasih atas laporan Anda. Kendala telah berhasil diatasi sepenuhnya.' :
                                        data.status === 'Ditolak' ? 'Mohon maaf, laporan Anda belum dapat kami proses saat ini karena alasan tertentu.' :
                                            'Status akhir laporan akan diperbarui setelah penanganan dinyatakan selesai.'}
                                </Text>

                                {/* Proof Button for Completed Reports */}
                                {data.status === 'Selesai' && data.completion_image_url && (
                                    <TouchableOpacity
                                        style={styles.proofButton}
                                        onPress={() => setShowProofModal(true)}
                                    >
                                        <Ionicons name="image-outline" size={18} color={Colors.green5} />
                                        <Text style={styles.proofButtonText}>Lihat Bukti Penanganan</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Improved Rejection Reason Box */}
                                {data.status === 'Ditolak' && data.rejection_reason && (
                                    <View style={styles.rejectionReasonBox}>
                                        <View style={styles.rejectionHeader}>
                                            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                                            <Text style={styles.rejectionLabel}>Catatan Petugas:</Text>
                                        </View>
                                        <Text style={styles.rejectionText}>{data.rejection_reason}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

            </ScrollView>

            <CustomAlertModal
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
            />

            {/* Proof Modal */}
            <Modal
                visible={showProofModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowProofModal(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={1}
                    onPress={() => setShowProofModal(false)}
                >
                    <View style={{ width: '90%', maxHeight: '80%', backgroundColor: 'black', borderRadius: 16, overflow: 'hidden' }}>
                        {data.completion_image_url && (
                            <Image
                                source={{ uri: data.completion_image_url }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="contain"
                            />
                        )}
                        <TouchableOpacity
                            style={{ position: 'absolute', top: 20, right: 20, backgroundColor: 'white', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => setShowProofModal(false)}
                        >
                            <Ionicons name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}
