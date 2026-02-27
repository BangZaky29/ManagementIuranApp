import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, SafeAreaView,
    StatusBar, Image, ActivityIndicator, StyleSheet
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { CustomButton } from '../../../components/CustomButton';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import {
    uploadPaymentProof,
    submitBulkPaymentWithProof,
} from '../../../services/paymentConfirmationService';

// Helper to convert "Maret 2026" to "2026-03-01" for Supabase Date column
const formatPeriodToDate = (periodStr: string): string => {
    if (!periodStr) return new Date().toISOString().split('T')[0];

    // Check if it's already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(periodStr)) return periodStr;

    const parts = periodStr.split(' ');
    if (parts.length !== 2) return new Date().toISOString().split('T')[0];

    const months: Record<string, string> = {
        'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
        'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
        'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
    };

    const monthStr = parts[0].toLowerCase();
    const monthNum = months[monthStr] || '01';
    const yearStr = parts[1];

    return `${yearStr}-${monthNum}-01`;
};

export default function PaymentProofScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams<{
        totalAmount: string;
        methodName: string;
        methodType: string;
        period: string;
        unpaidFees: string;
    }>();

    const [proofImage, setProofImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'info' as 'success' | 'info' | 'warning' | 'error',
        buttons: [] as any[],
    });

    const unpaidFees: { feeId: number; amount: number; name: string }[] =
        params.unpaidFees ? JSON.parse(params.unpaidFees) : [];
    const totalAmount = Number(params.totalAmount) || 0;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setAlertConfig({
                title: 'Izin Diperlukan',
                message: 'Izinkan akses galeri untuk memilih bukti pembayaran.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            });
            setAlertVisible(true);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets.length > 0) {
            setProofImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            setAlertConfig({
                title: 'Izin Diperlukan',
                message: 'Izinkan akses kamera untuk mengambil foto bukti pembayaran.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            });
            setAlertVisible(true);
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets.length > 0) {
            setProofImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!proofImage || !user?.id) return;

        setIsSubmitting(true);
        try {
            // 1. Upload proof image
            const paymentId = `${Date.now()}`;
            const proofUrl = await uploadPaymentProof(user.id, paymentId, proofImage);

            // 2. Create payment records for all unpaid fees
            const dbPeriodDate = formatPeriodToDate(params.period || '');

            await submitBulkPaymentWithProof({
                userId: user.id,
                fees: unpaidFees.map(f => ({ feeId: f.feeId, amount: f.amount })),
                period: dbPeriodDate,
                paymentMethodName: params.methodName || '',
                proofUrl,
            });

            // 3. Show success
            setAlertConfig({
                title: 'Berhasil! 🎉',
                message: 'Bukti pembayaran berhasil dikirim. Silakan tunggu konfirmasi dari admin komplek Anda.',
                type: 'success',
                buttons: [{
                    text: 'OK',
                    onPress: () => {
                        setAlertVisible(false);
                        router.replace('/(tabs)/iuran');
                    }
                }],
            });
            setAlertVisible(true);
        } catch (error: any) {
            console.error('Payment submission error:', error);
            setAlertConfig({
                title: 'Gagal',
                message: error?.userMessage || 'Gagal mengirim bukti pembayaran. Silakan coba lagi.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            });
            setAlertVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Bukti Pembayaran</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Payment Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Pembayaran</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Metode</Text>
                        <Text style={styles.summaryMethodValue}>{params.methodName || '-'}</Text>
                    </View>
                    <View style={styles.divider} />
                    {unpaidFees.map((fee, idx) => (
                        <View key={idx} style={styles.summaryRow}>
                            <Text style={styles.feeLabel}>{fee.name}</Text>
                            <Text style={styles.feeValue}>{formatCurrency(fee.amount)}</Text>
                        </View>
                    ))}
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={Colors.green4} />
                    <Text style={styles.infoText}>
                        Upload screenshot bukti pembayaran yang sudah berhasil. Admin akan memverifikasi pembayaran Anda.
                    </Text>
                </View>

                {/* Image Upload Area */}
                <Text style={styles.sectionTitle}>Bukti Pembayaran</Text>

                {proofImage ? (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: proofImage }} style={styles.imagePreview} resizeMode="contain" />
                        <TouchableOpacity
                            style={styles.removeImageBtn}
                            onPress={() => setProofImage(null)}
                        >
                            <Ionicons name="close-circle" size={28} color={Colors.danger} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.uploadArea}>
                        <Ionicons name="cloud-upload-outline" size={48} color={Colors.green3} />
                        <Text style={styles.uploadTitle}>Upload Bukti Pembayaran</Text>
                        <Text style={styles.uploadSubtitle}>Pilih dari galeri atau ambil foto baru</Text>

                        <View style={styles.uploadActions}>
                            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                                <Ionicons name="images-outline" size={22} color={Colors.green5} />
                                <Text style={styles.uploadBtnText}>Galeri</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.uploadBtn} onPress={takePhoto}>
                                <Ionicons name="camera-outline" size={22} color={Colors.green5} />
                                <Text style={styles.uploadBtnText}>Kamera</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {proofImage && (
                    <View style={styles.changeImageRow}>
                        <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
                            <Ionicons name="images-outline" size={16} color={Colors.green5} />
                            <Text style={styles.changeBtnText}>Ganti dari Galeri</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.changeBtn} onPress={takePhoto}>
                            <Ionicons name="camera-outline" size={16} color={Colors.green5} />
                            <Text style={styles.changeBtnText}>Ambil Foto Baru</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.footer}>
                <CustomButton
                    title={isSubmitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={!proofImage || isSubmitting}
                    icon={<Ionicons name="send-outline" size={18} color={Colors.white} />}
                    iconPosition="right"
                />
            </View>

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
    container: {
        flex: 1,
        backgroundColor: Colors.green1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: Colors.green1,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    content: {
        padding: 20,
        paddingBottom: 120,
    },
    summaryCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    summaryLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green3,
    },
    summaryMethodValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.green5,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 8,
    },
    feeLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    feeValue: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.green5,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F1F8E9',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: Colors.green4,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 12,
    },
    uploadArea: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: Colors.green2,
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.green5,
        marginTop: 12,
    },
    uploadSubtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 4,
        marginBottom: 20,
    },
    uploadActions: {
        flexDirection: 'row',
        gap: 16,
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.green1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    uploadBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.green5,
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    imagePreview: {
        width: '100%',
        height: 350,
    },
    removeImageBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: Colors.white,
        borderRadius: 14,
    },
    changeImageRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    changeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: Colors.white,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    changeBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.green5,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
    },
});
