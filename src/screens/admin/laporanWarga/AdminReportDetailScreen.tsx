
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StatusBar, Image, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { CustomHeader } from '../../../components/CustomHeader';
import { ReportLocationViewer } from '../../../components/ReportLocationViewer';
import { Report, updateReportStatus } from '../../../services/laporanService';
import { supabase } from '../../../lib/supabaseConfig';
import { formatDateTimeSafe } from '../../../utils/dateUtils';
import { useTheme } from '../../../contexts/ThemeContext';

export default function AdminReportDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();
    const [data, setData] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

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
                        user:profiles(full_name, avatar_url)
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setData(report as any); // Cast because of joined data
            } catch (error) {
                console.error("Error fetching detail:", error);
                showAlert("Error", "Gagal memuat detail laporan", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateStatus = async (newStatus: string, reason?: string) => {
        if (!data) return;
        setProcessingId(newStatus);
        try {
            await updateReportStatus(data.id, newStatus, reason);
            setData({ ...data, status: newStatus as any, rejection_reason: reason || data.rejection_reason });
            showAlert('Sukses', `Status laporan diubah menjadi ${newStatus}`, 'success');
        } catch (error) {
            console.error('Error updating status:', error);
            showAlert('Error', 'Gagal memperbarui status', 'error');
        } finally {
            setProcessingId(null);
            setShowRejectionModal(false);
            setRejectionReason('');
        }
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Menunggu': return Colors.warning;
            case 'Diproses': return Colors.primary;
            case 'Selesai': return Colors.success;
            case 'Ditolak': return Colors.danger;
            default: return Colors.textSecondary;
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </View>
        );
    }

    if (!data) {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <CustomHeader title="Detail Laporan" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Laporan tidak ditemukan</Text>
                </View>
            </View>
        );
    }

    const formattedDate = formatDateTimeSafe(data.created_at);

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <StatusBar barStyle="dark-content" />
            <CustomHeader title="Detail Laporan" showBack={true} />

            <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

                    {/* Image Section */}
                    {data.image_url && (
                        <Image
                            source={{ uri: data.image_url }}
                            style={{ width: '100%', height: 250, borderRadius: 12, marginBottom: 16 }}
                            resizeMode="cover"
                        />
                    )}

                    {/* Main Content */}
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 16, elevation: 2 }}>

                        {/* User Info */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            {(data as any).user?.avatar_url ? (
                                <Image
                                    source={{ uri: (data as any).user.avatar_url }}
                                    style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#eee' }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.green1, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                    <Ionicons name="person" size={20} color={Colors.primary} />
                                </View>
                            )}
                            <View>
                                <Text style={{ fontWeight: 'bold', fontSize: 16, color: Colors.textPrimary }}>
                                    {(data as any).user?.full_name || 'Warga'}
                                </Text>
                                <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>{formattedDate}</Text>
                            </View>
                        </View>

                        {/* Status Badge */}
                        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                            <View style={{
                                backgroundColor: getStatusColor(data.status) + '20',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 6
                            }}>
                                <Text style={{ color: getStatusColor(data.status), fontWeight: 'bold', fontSize: 13 }}>
                                    {data.status}
                                </Text>
                            </View>
                            <View style={{ marginLeft: 8, backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                                <Text style={{ color: Colors.textSecondary, fontWeight: '500', fontSize: 13 }}>{data.category}</Text>
                            </View>
                        </View>

                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 8 }}>{data.title}</Text>
                        <Text style={{ fontSize: 15, color: Colors.textSecondary, lineHeight: 24, marginBottom: 20 }}>{data.description}</Text>

                        <ReportLocationViewer
                            locationUrl={data.location}
                            onOpenLocation={handleOpenLocation}
                        />

                        {data.status === 'Ditolak' && data.rejection_reason && (
                            <View style={{ marginTop: 20, backgroundColor: Colors.danger + '10', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: Colors.danger }}>
                                <Text style={{ fontWeight: 'bold', color: Colors.danger, marginBottom: 4, fontSize: 13 }}>Alasan Penolakan:</Text>
                                <Text style={{ color: Colors.textPrimary, lineHeight: 20, fontSize: 14 }}>{data.rejection_reason}</Text>
                            </View>
                        )}
                    </View>

                    {/* Admin Actions */}
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 }}>Ubah Status Laporan</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 40 }}>
                        {data.status !== 'Diproses' && data.status !== 'Selesai' && (
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: Colors.primary, padding: 14, borderRadius: 10, alignItems: 'center' }}
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
                                style={{ flex: 1, backgroundColor: Colors.success, padding: 14, borderRadius: 10, alignItems: 'center' }}
                                onPress={() => handleUpdateStatus('Selesai')}
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
                                style={{ flex: 1, backgroundColor: Colors.danger, padding: 14, borderRadius: 10, alignItems: 'center' }}
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
                        style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, elevation: 5 }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 6 }}>Alasan Penolakan</Text>
                        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 16 }}>Mohon berikan alasan mengapa laporan ini ditolak.</Text>

                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 10,
                                padding: 12,
                                height: 120,
                                textAlignVertical: 'top',
                                color: colors.textPrimary,
                                backgroundColor: colors.green1 + '40',
                                marginBottom: 20
                            }}
                            placeholder="Contoh: Laporan kurang jelas atau data tidak lengkap..."
                            placeholderTextColor={Colors.textSecondary + '80'}
                            multiline={true}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                        />

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#F3F4F6' }}
                                onPress={() => setShowRejectionModal(false)}
                            >
                                <Text style={{ color: Colors.textSecondary, fontWeight: 'bold' }}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 2,
                                    backgroundColor: Colors.danger,
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    opacity: rejectionReason.trim() ? 1 : 0.6
                                }}
                                onPress={() => handleUpdateStatus('Ditolak', rejectionReason)}
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

            <CustomAlertModal
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
            />
        </View>
    );
}
