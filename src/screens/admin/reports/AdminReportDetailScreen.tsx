
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, Image, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { ReportLocationViewer } from '../../../components/laporan/ReportLocationViewer';
import { Report, updateReportStatus } from '../../../services/laporan';
import { supabase } from '../../../lib/supabaseConfig';
import { formatDateTimeSafe } from '../../../utils/dateUtils';
import { useTheme } from '../../../contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

export default function AdminReportDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();
    const [data, setData] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [imageAspectRatio, setImageAspectRatio] = useState<number>(4 / 3);

    // Modal & Alert State
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'success' | 'info' | 'warning' | 'error';
        buttons: any[];
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        buttons: []
    });

    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionImage, setCompletionImage] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const showAlert = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info', buttons?: any[]) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            buttons: buttons || [{ text: 'OK', onPress: hideAlert }]
        });
    };

    const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

    useEffect(() => {
        loadDetail();
    }, [id]);

    const loadDetail = async () => {
        if (typeof id === 'string') {
            setLoading(true);
            try {
                // We need to fetch user info as well
                const { data: report, error } = await supabase
                    .from('reports')
                    .select(`
                        *,
                        user:profiles!reports_user_id_fkey(full_name, avatar_url),
                        processed_by:profiles!reports_processed_by_id_fkey(full_name, role),
                        completed_by:profiles!reports_completed_by_id_fkey(full_name, role)
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setData(report as any); // Cast because of joined data

                if (report?.image_url) {
                    Image.getSize(report.image_url, (width, height) => {
                        if (width && height) {
                            setImageAspectRatio(width / height);
                        }
                    }, (error) => {
                        console.warn("Failed to get image size", error);
                    });
                }
            } catch (error) {
                console.error("Error fetching detail:", error);
                showAlert("Error", "Gagal memuat detail laporan", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateStatus = async (newStatus: string, options?: { reason?: string; completionImageUri?: string }) => {
        if (!data) return;
        setProcessingId(newStatus);
        try {
            await updateReportStatus(data.id, newStatus, {
                rejectionReason: options?.reason,
                completionImageUri: options?.completionImageUri,
                actorId: (await supabase.auth.getUser()).data.user?.id
            });

            setData({
                ...data,
                status: newStatus as any,
                rejection_reason: options?.reason || data.rejection_reason,
                completion_image_url: options?.completionImageUri ? 'updating...' : data.completion_image_url
            });

            showAlert('Sukses', `Status laporan diubah menjadi ${newStatus}`, 'success');
            loadDetail(); // Reload to get real URLs and updated state
        } catch (error) {
            console.error('Error updating status:', error);
            showAlert('Error', 'Gagal memperbarui status', 'error');
        } finally {
            setProcessingId(null);
            setShowRejectionModal(false);
            setShowCompletionModal(false);
            setRejectionReason('');
            setCompletionImage(null);
        }
    };

    const handlePickCompletionImage = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                showAlert('Izin Ditolak', 'Izin kamera diperlukan untuk mengambil foto bukti.', 'warning');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                allowsEditing: false,
                quality: 0.5,
            });

            if (!result.canceled && result.assets[0].uri) {
                setCompletionImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Pick completion image error:', error);
        }
    };

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

    const handleRewindStatus = () => {
        if (!data) return;
        let prevStatus = '';
        if (data.status === 'Selesai' || data.status === 'Ditolak') {
            prevStatus = 'Diproses';
        } else if (data.status === 'Diproses') {
            prevStatus = 'Menunggu';
        }

        if (!prevStatus) return;

        showAlert(
            'Ulangi Progres?',
            `Apakah Anda yakin ingin mengembalikan status laporan ini ke "${prevStatus}"?`,
            'warning',
            [
                { text: 'Batal', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Ya, Kembalikan',
                    style: 'destructive',
                    onPress: () => handleUpdateStatus(prevStatus)
                }
            ]
        );
    };

    const handleOpenLocation = () => {
        if (data?.location) {
            import('react-native').then(({ Linking }) => {
                Linking.openURL(data.location!).catch(err => {
                    console.error("Failed to open map", err);
                    showAlert('Gagal', 'Tidak dapat membuka peta.', 'error');
                });
            });
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Menunggu': return { bg: colors.status.menunggu.bg, text: colors.status.menunggu.text };
            case 'Diproses': return { bg: colors.status.diproses.bg, text: colors.status.diproses.text };
            case 'Selesai': return { bg: colors.status.selesai.bg, text: colors.status.selesai.text };
            case 'Ditolak': return { bg: colors.status.ditolak.bg, text: colors.status.ditolak.text };
            default: return { bg: '#F3F4F6', text: colors.textSecondary };
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (!data) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Laporan tidak ditemukan</Text>
                </View>
            </View>
        );
    }

    const formattedDate = formatDateTimeSafe(data.created_at);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
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

            <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: colors.surface }}>
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

                    {/* Image Section */}
                    {data.image_url && (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => setSelectedImage(data.image_url ?? null)}
                            style={{
                                width: '100%',
                                borderRadius: 16,
                                backgroundColor: '#F3F4F6',
                                borderWidth: 4,
                                borderColor: colors.surface,
                                marginBottom: 20,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 5,
                                overflow: 'hidden'
                            }}
                        >
                            <Image
                                source={{ uri: data.image_url }}
                                style={{ width: '100%', aspectRatio: imageAspectRatio }}
                                resizeMode="cover"
                            />
                            <View style={{ position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 20 }}>
                                <Ionicons name="expand" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Main Content */}
                    <View style={{ backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginBottom: 16, elevation: 2 }}>

                        {/* User Info */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            {(data as any).user?.avatar_url ? (
                                <Image
                                    source={{ uri: (data as any).user.avatar_url }}
                                    style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#eee' }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySubtle, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                    <Ionicons name="person" size={20} color={colors.primary} />
                                </View>
                            )}
                            <View>
                                <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.textPrimary }}>
                                    {(data as any).user?.full_name || 'Warga'}
                                </Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{formattedDate}</Text>
                            </View>
                        </View>

                        {/* Status Badge */}
                        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                            <View style={{
                                backgroundColor: getStatusStyle(data.status).bg,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 6
                            }}>
                                <Text style={{ color: getStatusStyle(data.status).text, fontWeight: 'bold', fontSize: 13 }}>
                                    {data.status}
                                </Text>
                            </View>
                            <View style={{ marginLeft: 8, backgroundColor: colors.surfaceSubtle, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                                <Text style={{ color: colors.textSecondary, fontWeight: '500', fontSize: 13 }}>{data.category}</Text>
                            </View>
                        </View>

                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 }}>{data.title}</Text>
                        <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginBottom: 20 }}>{data.description}</Text>

                        <ReportLocationViewer
                            locationUrl={data.location}
                            onOpenLocation={handleOpenLocation}
                        />

                        {data.status === 'Ditolak' && data.rejection_reason && (
                            <View style={{ marginTop: 20, backgroundColor: colors.dangerBg, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: colors.danger }}>
                                <Text style={{ color: colors.textPrimary, lineHeight: 20, fontSize: 14 }}>{data.rejection_reason}</Text>
                            </View>
                        )}
                    </View>

                    {/* Progress Log UI */}
                    <View style={{ marginBottom: 24, paddingHorizontal: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <Ionicons name="time-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>Log Progres Pengerjaan</Text>
                        </View>

                        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: colors.status.diproses.text }}>
                            {/* Simple Logic for Progress Log */}
                            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.status.selesai.text, marginTop: 4, marginRight: 12 }} />
                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Laporan Diterima</Text>
                                        <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{formattedDate}</Text>
                                    </View>
                                </View>
                            </View>

                            {data.status !== 'Menunggu' && (
                                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.status.menunggu.text, marginTop: 4, marginRight: 12 }} />
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 13, color: colors.textPrimary, marginBottom: 4 }}>
                                                Sedang Diproses oleh{' '}
                                                <Text style={{
                                                    color: getRoleColor(data.processed_by?.role),
                                                    fontWeight: 'bold',
                                                    backgroundColor: getRoleBg(data.processed_by?.role),
                                                    paddingHorizontal: 6,
                                                    paddingVertical: 2,
                                                    borderRadius: 4,
                                                    overflow: 'hidden'
                                                }}>
                                                    {data.processed_by?.role === 'admin' ? 'Admin' : 'Security'} {data.processed_by?.full_name || 'Petugas'}
                                                </Text>
                                            </Text>
                                            <Text style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>{formatDateTimeSafe(data.updated_at || data.created_at)}</Text>
                                            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Laporan sedang ditangani petugas.</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {(data.status === 'Selesai' || data.status === 'Ditolak') && (
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: data.status === 'Selesai' ? colors.status.selesai.text : colors.status.ditolak.text, marginTop: 4, marginRight: 12 }} />
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 13, color: colors.textPrimary, marginBottom: 4 }}>
                                                {data.status === 'Selesai' ? (
                                                    <>
                                                        Laporan Selesai oleh{' '}
                                                        <Text style={{
                                                            color: getRoleColor(data.completed_by?.role),
                                                            fontWeight: 'bold',
                                                            backgroundColor: getRoleBg(data.completed_by?.role),
                                                            paddingHorizontal: 6,
                                                            paddingVertical: 2,
                                                            borderRadius: 4,
                                                            overflow: 'hidden'
                                                        }}>
                                                            {data.completed_by?.role === 'admin' ? 'Admin' : 'Security'} {data.completed_by?.full_name || 'Petugas'}
                                                        </Text>
                                                    </>
                                                ) : 'Laporan Ditolak'}
                                            </Text>
                                            <Text style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>{formatDateTimeSafe(data.updated_at || data.created_at)}</Text>
                                            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 10 }}>{data.status === 'Selesai' ? 'Kendala telah diatasi.' : 'Laporan belum dapat diproses.'}</Text>

                                            {data.status === 'Selesai' && data.completion_image_url && (
                                                <TouchableOpacity
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        backgroundColor: '#F0FDF4',
                                                        paddingVertical: 8,
                                                        paddingHorizontal: 12,
                                                        borderRadius: 8,
                                                        borderWidth: 1,
                                                        borderColor: '#DCFCE7',
                                                        alignSelf: 'flex-start',
                                                        marginTop: 4
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
                            )}
                        </View>
                    </View>

                    {/* Admin Actions */}
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 }}>Ubah Status Laporan</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 40 }}>
                        {data.status !== 'Diproses' && data.status !== 'Selesai' && (
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: colors.primary, padding: 14, borderRadius: 10, alignItems: 'center' }}
                                onPress={() => handleUpdateStatus('Diproses')}
                                disabled={!!processingId}
                            >
                                {processingId === 'Diproses' ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Proses</Text>
                                )}
                            </TouchableOpacity>
                        )}

                        {data.status === 'Diproses' && (
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: colors.success, padding: 14, borderRadius: 10, alignItems: 'center' }}
                                onPress={() => setShowCompletionModal(true)}
                                disabled={!!processingId}
                            >
                                {processingId === 'Selesai' ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Selesai</Text>
                                )}
                            </TouchableOpacity>
                        )}

                        {data.status !== 'Selesai' && data.status !== 'Ditolak' && (
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: colors.danger, padding: 14, borderRadius: 10, alignItems: 'center' }}
                                onPress={() => setShowRejectionModal(true)}
                                disabled={!!processingId}
                            >
                                {processingId === 'Ditolak' ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Tolak</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                </ScrollView>
            </SafeAreaView>

            {/* Rejection Modal */}
            <Modal
                visible={showRejectionModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowRejectionModal(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}
                    activeOpacity={1}
                    onPress={() => setShowRejectionModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 24, elevation: 5 }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 6 }}>Alasan Penolakan</Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>Mohon berikan alasan mengapa laporan ini ditolak.</Text>

                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 10,
                                padding: 12,
                                height: 120,
                                textAlignVertical: 'top',
                                color: colors.textPrimary,
                                backgroundColor: colors.primarySubtle,
                                marginBottom: 20
                            }}
                            placeholder="Contoh: Laporan kurang jelas atau data tidak lengkap..."
                            placeholderTextColor={colors.textSecondary}
                            multiline={true}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                        />

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: colors.surfaceSubtle }}
                                onPress={() => setShowRejectionModal(false)}
                            >
                                <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 2,
                                    backgroundColor: colors.danger,
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    opacity: rejectionReason.trim() ? 1 : 0.6
                                }}
                                onPress={() => handleUpdateStatus('Ditolak', { reason: rejectionReason })}
                                disabled={!rejectionReason.trim() || processingId === 'Ditolak'}
                            >
                                {processingId === 'Ditolak' ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Kirim Penolakan</Text>
                                )}
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
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}
                    activeOpacity={1}
                    onPress={() => setShowCompletionModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 24, elevation: 5 }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            </View>
                            <View>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>Selesaikan Laporan</Text>
                                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Konfirmasi penanganan selesai</Text>
                            </View>
                        </View>

                        <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 20 }}>
                            Anda dapat melampirkan foto bukti pengerjaan atau hasil akhir laporan ini (opsional).
                        </Text>

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
                                    <Ionicons name="close" size={20} color={colors.danger} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={{
                                    borderWidth: 1.5,
                                    borderColor: colors.primary,
                                    borderStyle: 'dashed',
                                    borderRadius: 12,
                                    paddingVertical: 30,
                                    alignItems: 'center',
                                    marginBottom: 20,
                                    backgroundColor: colors.successBg
                                }}
                                onPress={handlePickCompletionImage}
                            >
                                <Ionicons name="camera" size={32} color={colors.primary} />
                                <Text style={{ marginTop: 8, color: colors.primary, fontWeight: '600', fontSize: 13 }}>Ambil Foto Bukti (Opsional)</Text>
                            </TouchableOpacity>
                        )}

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: colors.surfaceSubtle }}
                                onPress={() => setShowCompletionModal(false)}
                            >
                                <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 2,
                                    backgroundColor: colors.primary,
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    alignItems: 'center'
                                }}
                                onPress={() => handleUpdateStatus('Selesai', { completionImageUri: completionImage || undefined })}
                                disabled={processingId === 'Selesai'}
                            >
                                {processingId === 'Selesai' ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Selesai</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <CustomAlertModal
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
            />

            {/* In-App Image Viewer Modal */}
            <Modal
                visible={!!selectedImage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedImage(null)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={1}
                    onPress={() => setSelectedImage(null)}
                >
                    <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={{ width: '100%', height: '70%' }}
                                resizeMode="contain"
                            />
                        )}
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                top: 50,
                                right: 20,
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            onPress={() => setSelectedImage(null)}
                        >
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
