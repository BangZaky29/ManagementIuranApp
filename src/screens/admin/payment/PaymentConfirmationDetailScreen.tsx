import React, { useState, useEffect } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, TouchableOpacity,
    StatusBar, ActivityIndicator, StyleSheet, Image, TextInput, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomButton } from '../../../components/CustomButton';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';
import {
    PendingPaymentItem,
    fetchPaymentDetail,
    confirmPayment,
    rejectPayment,
} from '../../../services/paymentConfirmationService';

const { width } = Dimensions.get('window');

export default function PaymentConfirmationDetailScreen() {
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
            case 'pending': return Colors.warning;
            case 'paid': return '#2E7D32';
            case 'rejected': return Colors.danger;
            default: return Colors.textSecondary;
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
            case 'pending': return '#FFF8E1';
            case 'paid': return '#E8F5E9';
            case 'rejected': return '#FFEBEE';
            default: return '#F5F5F5';
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detail Pembayaran</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.green3} />
                </View>
            </SafeAreaView>
        );
    }

    if (!payment) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detail Pembayaran</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: Colors.textSecondary }}>Pembayaran tidak ditemukan.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Pembayaran</Text>
            </View>

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
                                    <Ionicons name="person" size={24} color={Colors.green4} />
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
                            <Text style={[styles.detailValue, { color: Colors.green3, fontWeight: 'bold' }]}>
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
                                    color={Colors.green5}
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
                    <View style={styles.rejectionBox}>
                        <Ionicons name="alert-circle-outline" size={20} color={Colors.danger} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rejectionTitle}>Alasan Penolakan</Text>
                            <Text style={styles.rejectionText}>{payment.rejection_reason}</Text>
                        </View>
                    </View>
                )}

                {/* Admin Notes (if confirmed) */}
                {payment.status === 'paid' && payment.admin_notes && (
                    <View style={styles.notesBox}>
                        <Ionicons name="chatbubble-outline" size={18} color={Colors.green4} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.notesTitle}>Catatan Admin</Text>
                            <Text style={styles.notesText}>{payment.admin_notes}</Text>
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
                            placeholderTextColor="#999"
                            multiline
                        />

                        {/* Reject Form */}
                        {showRejectForm && (
                            <View style={styles.rejectForm}>
                                <Text style={[styles.inputLabel, { color: Colors.danger }]}>
                                    Alasan Penolakan *
                                </Text>
                                <TextInput
                                    style={[styles.input, { borderColor: Colors.danger }]}
                                    value={rejectReason}
                                    onChangeText={setRejectReason}
                                    placeholder="Jelaskan alasan penolakan..."
                                    placeholderTextColor="#999"
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
                                        style={{ flex: 1, backgroundColor: Colors.danger }}
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
                        style={{ flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.danger }}
                        textStyle={{ color: Colors.danger }}
                        icon={<Ionicons name="close-circle-outline" size={18} color={Colors.danger} />}
                        iconPosition="left"
                    />
                    <CustomButton
                        title="Konfirmasi Lunas"
                        onPress={handleApprove}
                        loading={isProcessing}
                        style={{ flex: 1, marginLeft: 10 }}
                        icon={<Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />}
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.green1 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15,
    },
    backButton: { padding: 5, marginRight: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.green5 },
    content: { padding: 20, paddingBottom: 120 },
    statusCard: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        padding: 16, borderRadius: 16, marginBottom: 20,
    },
    statusLabel: { fontSize: 16, fontWeight: 'bold' },
    section: { marginBottom: 20 },
    sectionTitle: {
        fontSize: 16, fontWeight: 'bold', color: Colors.green5, marginBottom: 12,
    },
    card: {
        backgroundColor: Colors.white, borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    },
    userRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 14 },
    avatarPlaceholder: {
        backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center',
    },
    userName: { fontSize: 16, fontWeight: 'bold', color: Colors.green5 },
    userAddress: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
    userPhone: { fontSize: 13, color: Colors.green4, marginTop: 3 },
    detailRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 6,
    },
    detailLabel: { fontSize: 14, color: Colors.textSecondary },
    detailValue: { fontSize: 14, fontWeight: '500', color: Colors.green5 },
    proofContainer: {
        backgroundColor: Colors.white, borderRadius: 16,
        overflow: 'hidden', borderWidth: 1, borderColor: Colors.green2,
    },
    proofImage: { width: '100%', height: 280 },
    proofImageZoomed: { height: 500 },
    zoomIndicator: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 10,
        borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    zoomText: { fontSize: 12, fontWeight: '600', color: Colors.green5 },
    rejectionBox: {
        flexDirection: 'row', gap: 10, backgroundColor: '#FFEBEE',
        padding: 14, borderRadius: 12, marginBottom: 20,
    },
    rejectionTitle: { fontSize: 13, fontWeight: 'bold', color: Colors.danger },
    rejectionText: { fontSize: 13, color: '#B71C1C', marginTop: 4, lineHeight: 18 },
    notesBox: {
        flexDirection: 'row', gap: 10, backgroundColor: '#F1F8E9',
        padding: 14, borderRadius: 12, marginBottom: 20,
    },
    notesTitle: { fontSize: 13, fontWeight: 'bold', color: Colors.green4 },
    notesText: { fontSize: 13, color: Colors.green5, marginTop: 4 },
    inputLabel: {
        fontSize: 14, fontWeight: '600', color: Colors.green5,
        marginBottom: 8, marginTop: 8,
    },
    input: {
        backgroundColor: Colors.white, borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        fontSize: 14, color: Colors.green5,
        borderWidth: 1, borderColor: Colors.green2,
        minHeight: 60, textAlignVertical: 'top',
    },
    rejectForm: {
        marginTop: 16, padding: 16, backgroundColor: '#FFF5F5',
        borderRadius: 12, borderWidth: 1, borderColor: '#FFCDD2',
    },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: Colors.white, padding: 20,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        flexDirection: 'row',
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05, shadowRadius: 12, elevation: 10,
    },
});
