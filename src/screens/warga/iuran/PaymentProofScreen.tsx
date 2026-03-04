import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StatusBar, Image, ActivityIndicator, StyleSheet, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '../../../components/common/CustomButton';
import { CustomAlertModal } from '../../../components/common/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import {
    uploadPaymentProof,
} from '../../../services/payment';
import { submitBulkPayments, updateRejectedPayment, BillingPeriod } from '../../../services/iuran';
import { useTheme } from '../../../contexts/ThemeContext';
import { ThemeColors } from '../../../theme/AppTheme';

export default function PaymentProofScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { colors } = useTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

    const params = useLocalSearchParams<{
        totalAmount: string;
        methodName: string;
        methodType: string;
        selectedPeriods: string;
        isRepayment?: string;
        paymentIdToUpdate?: string;
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

    const selectedPeriods: BillingPeriod[] = params.selectedPeriods
        ? JSON.parse(params.selectedPeriods)
        : [];
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

            if (params.isRepayment === 'true' && params.paymentIdToUpdate) {
                // Update existing record
                await updateRejectedPayment(params.paymentIdToUpdate, proofUrl, params.methodName || '');
            } else {
                // Insert new records
                await submitBulkPayments(
                    user.id,
                    selectedPeriods,
                    totalAmount,
                    proofUrl,
                    params.methodName || ''
                );
            }

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
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.surface} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload Bukti Pembayaran</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {params.isRepayment === 'true' && (
                    <View style={{ backgroundColor: colors.danger + '20', padding: 12, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.danger + '40' }}>
                        <Ionicons name="refresh-circle" size={20} color={colors.danger} />
                        <Text style={{ flex: 1, color: colors.danger, fontSize: 13, fontWeight: '500' }}>
                            Bukti pembayaran baru untuk iuran yang ditolak.
                        </Text>
                    </View>
                )}

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
                    {selectedPeriods.map((period, idx) => (
                        <View key={idx} style={styles.summaryRow}>
                            <Text style={styles.feeLabel}>{period.monthName}</Text>
                            <Text style={styles.feeValue}>{formatCurrency(period.totalAmount)}</Text>
                        </View>
                    ))}
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
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
                            <Ionicons name="close-circle" size={28} color={colors.danger} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.uploadArea}>
                        <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
                        <Text style={styles.uploadTitle}>Upload Bukti Pembayaran</Text>
                        <Text style={styles.uploadSubtitle}>Pilih dari galeri atau ambil foto baru</Text>

                        <div style={styles.uploadActions as any}>
                            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                                <Ionicons name="images-outline" size={18} color={colors.primary} />
                                <Text style={styles.uploadBtnText}>Galeri</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.uploadBtn} onPress={takePhoto}>
                                <Ionicons name="camera-outline" size={18} color={colors.primary} />
                                <Text style={styles.uploadBtnText}>Kamera</Text>
                            </TouchableOpacity>
                        </div>
                    </View>
                )}

                {proofImage && (
                    <View style={styles.changeImageRow}>
                        <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
                            <Ionicons name="images-outline" size={16} color={colors.primary} />
                            <Text style={styles.changeBtnText}>Ganti dari Galeri</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.changeBtn} onPress={takePhoto}>
                            <Ionicons name="camera-outline" size={16} color={colors.primary} />
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
                    icon={<Ionicons name="send-outline" size={18} color={colors.textWhite} />}
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

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 16,
        paddingBottom: 15,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    content: {
        padding: 20,
        paddingBottom: 120,
    },
    summaryCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    summaryMethodValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 8,
    },
    feeLabel: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    feeValue: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.primarySubtle,
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        gap: 10,
        borderWidth: 1,
        borderColor: colors.primary + '20',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: colors.primary,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    uploadArea: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.primary + '40',
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: 12,
    },
    uploadSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
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
        backgroundColor: colors.primarySubtle,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.primary + '40',
    },
    uploadBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    imagePreview: {
        width: '100%',
        height: 350,
    },
    removeImageBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: colors.surface,
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
        backgroundColor: colors.surface,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    changeBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
