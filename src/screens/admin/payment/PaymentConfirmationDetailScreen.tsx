import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StatusBar, ActivityIndicator, StyleSheet, Image, TextInput, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeColors } from '../../../theme/AppTheme';
import { CustomHeader } from '../../../components/common/CustomHeader';
import { CustomButton } from '../../../components/common/CustomButton';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';
import {
    PendingPaymentItem,
    fetchPaymentDetail,
    confirmPayment,
    rejectPayment,
} from '../../../services/payment';
import { useTheme } from '../../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function PaymentConfirmationDetailScreen() {
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const router = useRouter();
    const { user } = useAuth();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [payment, setPayment] = useState<PendingPaymentItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [imageZoomed, setImageZoomed] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[],
    });

    useEffect(() => {
        loadPayment();
    }, [id]);

    const loadPayment = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await fetchPaymentDetail(id);
            setPayment(data);
        } catch (error) {
            console.error('Failed to load payment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const handleApprove = () => {
        setAlertConfig({
            title: 'Konfirmasi Lunas?',
            message: `Apakah Anda yakin ingin mengkonfirmasi pembayaran dari ${payment?.profiles?.full_name}?`,
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: () => setAlertVisible(false) },
                {
                    text: 'Konfirmasi Lunas', onPress: async () => {
                        setAlertVisible(false);
                        setIsProcessing(true);
                        try {
                            await confirmPayment(id!, user!.id, adminNotes || undefined);
                            setAlertConfig({
                                title: 'Berhasil ✅',
                                message: 'Pembayaran berhasil dikonfirmasi sebagai lunas.',
                                type: 'success',
                                buttons: [{
                                    text: 'OK', onPress: () => {
                                        setAlertVisible(false);
                                        router.back();
                                    }
                                }],
                            });
                            setAlertVisible(true);
                        } catch (error: any) {
                            setAlertConfig({
                                title: 'Gagal',
                                message: error?.userMessage || 'Gagal mengkonfirmasi pembayaran.',
                                type: 'error',
                                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
                            });
                            setAlertVisible(true);
                        } finally {
                            setIsProcessing(false);
                        }
                    },
                },
            ],
        });
        setAlertVisible(true);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            setAlertConfig({
                title: 'Perhatian',
                message: 'Alasan penolakan wajib diisi.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            });
            setAlertVisible(true);
            return;
        }

        setIsProcessing(true);
        try {
            await rejectPayment(id!, user!.id, rejectReason.trim());
            setAlertConfig({
                title: 'Ditolak ❌',
                message: 'Pembayaran telah ditolak. Warga akan melihat status ditolak.',
                type: 'info',
                buttons: [{
                    text: 'OK', onPress: () => {
                        setAlertVisible(false);
                        router.back();
                    }
                }],
            });
            setAlertVisible(true);
        } catch (error: any) {
            setAlertConfig({
                title: 'Gagal',
                message: error?.userMessage || 'Gagal menolak pembayaran.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            });
            setAlertVisible(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return colors.status.pending.text;
            case 'paid': return colors.status.selesai.text;
            case 'rejected': return colors.status.ditolak.text;
            default: return colors.textSecondary;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Menunggu Konfirmasi';
            case 'paid': return 'Lunas';
            case 'rejected': return 'Ditolak';
            default: return status;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'pending': return colors.status.pending.bg;
            case 'paid': return colors.status.selesai.bg;
            case 'rejected': return colors.status.ditolak.bg;
            default: return colors.surfaceSubtle;
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
                <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />
                <CustomHeader title="Detail Pembayaran" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!payment) {
        return (
            <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
                <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />
                <CustomHeader title="Detail Pembayaran" showBack={true} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: colors.textSecondary }}>Pembayaran tidak ditemukan.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />
            <CustomHeader title="Detail Pembayaran" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Status Badge */}
                <View style={[styles.statusCard, { backgroundColor: getStatusBg(payment.status) }]}>
                    <Ionicons
                        name={payment.status === 'paid' ? 'checkmark-circle' : (payment.status === 'rejected' ? 'close-circle' : 'time')}
                        size={24}
                        color={getStatusColor(payment.status)}
                    />
                    <Text style={[styles.statusLabel, { color: getStatusColor(payment.status) }]}>
                        {getStatusLabel(payment.status)}
                    </Text>
                </View>

                {/* User Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informasi Warga</Text>
                    <View style={styles.card}>
                        <View style={styles.userRow}>
                            {payment.profiles?.avatar_url ? (
                                <Image source={{ uri: payment.profiles.avatar_url }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <Ionicons name="person" size={24} color={colors.primary} />
                                </View>
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.userName}>{payment.profiles?.full_name || 'Warga'}</Text>
                                <Text style={styles.userAddress}>{payment.profiles?.address || '-'}</Text>
                                {payment.profiles?.wa_phone && (
                                    <Text style={styles.userPhone}>📱 {payment.profiles.wa_phone}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Payment Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detail Pembayaran</Text>
                    <View style={styles.card}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Iuran</Text>
                            <Text style={styles.detailValue}>{payment.fees?.name || '-'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Jumlah</Text>
                            <Text style={[styles.detailValue, { color: colors.primary, fontWeight: 'bold' }]}>
                                {formatCurrency(payment.amount)}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Periode</Text>
                            <Text style={styles.detailValue}>
                                {new Date(payment.period).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Metode</Text>
                            <Text style={styles.detailValue}>{payment.payment_method || '-'}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tanggal Kirim</Text>
                            <Text style={styles.detailValue}>{formatDateTime(payment.created_at)}</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Proof */}
                {payment.proof_url && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Bukti Pembayaran</Text>
                        <TouchableOpacity
                            style={styles.proofContainer}
                            onPress={() => setImageZoomed(!imageZoomed)}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={{ uri: payment.proof_url }}
                                style={[styles.proofImage, imageZoomed && styles.proofImageZoomed]}
                                resizeMode="contain"
                            />
                            <View style={styles.zoomIndicator}>
                                <Ionicons
                                    name={imageZoomed ? 'contract-outline' : 'expand-outline'}
                                    size={16}
                                    color={colors.primary}
                                />
                                <Text style={styles.zoomText}>
                                    {imageZoomed ? 'Kecilkan' : 'Perbesar'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Rejection Reason (if rejected) */}
                {payment.status === 'rejected' && payment.rejection_reason && (
                    <View style={[styles.rejectionBox, { backgroundColor: colors.status.ditolak.bg }]}>
                        <Ionicons name="alert-circle-outline" size={20} color={colors.status.ditolak.text} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.rejectionTitle, { color: colors.status.ditolak.text }]}>Alasan Penolakan</Text>
                            <Text style={[styles.rejectionText, { color: colors.status.ditolak.text }]}>{payment.rejection_reason}</Text>
                        </View>
                    </View>
                )}

                {/* Admin Notes (if confirmed) */}
                {payment.status === 'paid' && payment.admin_notes && (
                    <View style={[styles.notesBox, { backgroundColor: colors.status.selesai.bg }]}>
                        <Ionicons name="chatbubble-outline" size={18} color={colors.status.selesai.text} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.notesTitle, { color: colors.status.selesai.text }]}>Catatan Admin</Text>
                            <Text style={[styles.notesText, { color: colors.textPrimary }]}>{payment.admin_notes}</Text>
                        </View>
                    </View>
                )}

                {/* Action Section (only for pending) */}
                {payment.status === 'pending' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tindakan</Text>

                        {/* Admin Notes Input */}
                        <Text style={styles.inputLabel}>Catatan Admin (opsional)</Text>
                        <TextInput
                            style={styles.input}
                            value={adminNotes}
                            onChangeText={setAdminNotes}
                            placeholder="Tambahkan catatan..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                        />

                        {/* Reject Form */}
                        {showRejectForm && (
                            <View style={styles.rejectForm}>
                                <Text style={[styles.inputLabel, { color: colors.danger }]}>
                                    Alasan Penolakan *
                                </Text>
                                <TextInput
                                    style={[styles.input, { borderColor: colors.danger }]}
                                    value={rejectReason}
                                    onChangeText={setRejectReason}
                                    placeholder="Jelaskan alasan penolakan..."
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                />
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                    <CustomButton
                                        title="Batal"
                                        onPress={() => { setShowRejectForm(false); setRejectReason(''); }}
                                        variant="outline"
                                        style={{ flex: 1 }}
                                    />
                                    <CustomButton
                                        title="Tolak Pembayaran"
                                        onPress={handleReject}
                                        loading={isProcessing}
                                        style={{ flex: 1, backgroundColor: colors.danger }}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>

            {/* Bottom Actions (only for pending) */}
            {payment.status === 'pending' && !showRejectForm && (
                <View style={styles.footer}>
                    <CustomButton
                        title="Tolak"
                        onPress={() => setShowRejectForm(true)}
                        style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.danger }}
                        textStyle={{ color: colors.danger }}
                        icon={<Ionicons name="close-circle-outline" size={18} color={colors.danger} />}
                        iconPosition="left"
                    />
                    <CustomButton
                        title="Konfirmasi Lunas"
                        onPress={handleApprove}
                        loading={isProcessing}
                        style={{ flex: 1, marginLeft: 10 }}
                        icon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />}
                        iconPosition="left"
                    />
                </View>
            )}

            <CustomAlertModal
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                buttons={alertConfig.buttons}
                onClose={() => setAlertVisible(false)}
            />
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingBottom: 15,
        backgroundColor: colors.surface,
    },
    backButton: { padding: 5, marginRight: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
    content: { padding: 20, paddingBottom: 120 },
    statusCard: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        padding: 16, borderRadius: 16, marginBottom: 20,
    },
    statusLabel: { fontSize: 16, fontWeight: 'bold' },
    section: { marginBottom: 20 },
    sectionTitle: {
        fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 12,
    },
    card: {
        backgroundColor: colors.surface, borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: colors.border,
    },
    userRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 14 },
    avatarPlaceholder: {
        backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center',
    },
    userName: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
    userAddress: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
    userPhone: { fontSize: 13, color: colors.primary, marginTop: 3 },
    detailRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 6,
    },
    detailLabel: { fontSize: 14, color: colors.textSecondary },
    detailValue: { fontSize: 14, fontWeight: '500', color: colors.primary },
    proofContainer: {
        backgroundColor: colors.surface, borderRadius: 16,
        overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
    },
    proofImage: { width: '100%', height: 280 },
    proofImageZoomed: { height: 500 },
    zoomIndicator: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 10,
        borderTopWidth: 1, borderTopColor: colors.border,
    },
    zoomText: { fontSize: 12, fontWeight: '600', color: colors.primary },
    rejectionBox: {
        flexDirection: 'row', gap: 10, backgroundColor: colors.dangerBg,
        padding: 14, borderRadius: 12, marginBottom: 20,
    },
    rejectionTitle: { fontSize: 13, fontWeight: 'bold', color: colors.danger },
    rejectionText: { fontSize: 13, color: colors.danger, marginTop: 4, lineHeight: 18 },
    notesBox: {
        flexDirection: 'row', gap: 10, backgroundColor: colors.primarySubtle,
        padding: 14, borderRadius: 12, marginBottom: 20,
    },
    notesTitle: { fontSize: 13, fontWeight: 'bold', color: colors.primary },
    notesText: { fontSize: 13, color: colors.textPrimary, marginTop: 4 },
    inputLabel: {
        fontSize: 14, fontWeight: '600', color: colors.primary,
        marginBottom: 8, marginTop: 8,
    },
    input: {
        backgroundColor: colors.surface, borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        fontSize: 14, color: colors.textPrimary,
        borderWidth: 1, borderColor: colors.border,
        minHeight: 60, textAlignVertical: 'top',
    },
    rejectForm: {
        marginTop: 16, padding: 16, backgroundColor: colors.dangerBg,
        borderRadius: 12, borderWidth: 1, borderColor: colors.danger,
    },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: colors.surface, padding: 20,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        flexDirection: 'row',
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05, shadowRadius: 12, elevation: 10,
    },
});
