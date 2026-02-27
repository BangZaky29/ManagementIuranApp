import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, Animated, PanResponder, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from './CustomButton';
import { ToastNotification } from './ToastNotification';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { PaymentMethod, fetchEwalletVaCodes, EwalletVaCode } from '../services/paymentMethodService';

interface PaymentInstructionModalProps {
    visible: boolean;
    onClose: () => void;
    method: PaymentMethod;
    amount: string;
    dueDate: string;
    onUploadProof: () => void;
}

export const PaymentInstructionModal: React.FC<PaymentInstructionModalProps> = ({
    visible, onClose, method, amount, dueDate, onUploadProof
}) => {
    const [secondsLeft, setSecondsLeft] = useState(24 * 60 * 60);
    const panY = React.useRef(new Animated.Value(0)).current;
    const [toast, setToast] = useState({ visible: false, message: '' });
    const [vaCodes, setVaCodes] = useState<EwalletVaCode[]>([]);
    const [vaLoading, setVaLoading] = useState(false);

    const showToast = (message: string) => {
        setToast({ visible: true, message });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    const handleCopy = async () => {
        if (method.account_number) {
            await Clipboard.setStringAsync(method.account_number);
            showToast('Nomor berhasil disalin');
        }
    };

    const handleDownloadQR = async () => {
        if (!method.qris_image_url) return;
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin Diperlukan', 'Izinkan akses penyimpanan untuk download QR.');
                return;
            }
            const fileUri = FileSystem.documentDirectory + `qr_${Date.now()}.jpg`;
            const download = await FileSystem.downloadAsync(method.qris_image_url, fileUri);
            await MediaLibrary.saveToLibraryAsync(download.uri);
            showToast('QR Code berhasil disimpan ke galeri');
        } catch (e) {
            console.error('Download QR error:', e);
            showToast('Gagal menyimpan QR Code');
        }
    };

    useEffect(() => {
        if (!visible) return;
        setSecondsLeft(24 * 60 * 60);
        const timer = setInterval(() => {
            setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [visible]);

    // Fetch VA codes when modal opens for e-wallet
    useEffect(() => {
        if (visible && method.method_type === 'ewallet') {
            setVaLoading(true);
            fetchEwalletVaCodes(method.method_name)
                .then(codes => setVaCodes(codes))
                .finally(() => setVaLoading(false));
        }
    }, [visible, method.method_name, method.method_type]);

    useEffect(() => {
        if (visible) panY.setValue(0);
    }, [visible]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const resetPosition = () => {
        Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
        }).start();
    };

    const closeWithAnimation = () => {
        Animated.timing(panY, {
            toValue: 1000,
            duration: 300,
            useNativeDriver: false,
        }).start(() => onClose());
    };

    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    panY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 150) {
                    closeWithAnimation();
                } else {
                    resetPosition();
                }
            },
        })
    ).current;

    const getInstructions = () => {
        if (method.method_type === 'qris') {
            return [
                '1. Buka aplikasi pembayaran / e-wallet',
                '2. Pilih menu Scan / Bayar',
                '3. Scan QR code di atas',
                '4. Periksa detail dan konfirmasi pembayaran',
                '5. Screenshot bukti pembayaran',
            ];
        }
        if (method.method_type === 'ewallet') {
            return [
                `1. Buka aplikasi ${method.method_name}`,
                '2. Pilih menu Transfer / Bayar',
                `3. Masukkan nomor: ${method.account_number || '-'}`,
                `4. Masukkan jumlah: ${amount}`,
                '5. Periksa detail dan konfirmasi pembayaran',
                '6. Screenshot bukti pembayaran',
            ];
        }
        return [
            '1. Buka aplikasi Mobile Banking / Internet Banking',
            '2. Pilih menu Transfer',
            `3. Pilih bank tujuan: ${method.method_name}`,
            `4. Masukkan nomor rekening: ${method.account_number || '-'}`,
            `5. Masukkan jumlah: ${amount}`,
            '6. Periksa detail dan konfirmasi pembayaran',
            '7. Screenshot bukti pembayaran',
        ];
    };

    const renderContent = () => {
        if (method.method_type === 'qris') {
            return (
                <View style={styles.centerContent}>
                    <Text style={styles.instructionTitle}>Scan QRIS</Text>
                    <Text style={styles.instructionSubtitle}>Scan kode di bawah ini untuk membayar</Text>

                    <View style={styles.qrContainer}>
                        {method.qris_image_url ? (
                            <Image
                                source={{ uri: method.qris_image_url }}
                                style={styles.qrImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={[styles.qrImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }]}>
                                <Ionicons name="qr-code-outline" size={80} color={Colors.textSecondary} />
                                <Text style={{ color: Colors.textSecondary, marginTop: 8, fontSize: 12 }}>
                                    QRIS belum tersedia
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Download QR Button */}
                    {method.qris_image_url && (
                        <TouchableOpacity style={styles.downloadQrBtn} onPress={handleDownloadQR}>
                            <Ionicons name="download-outline" size={18} color={Colors.green5} />
                            <Text style={styles.downloadQrText}>Simpan QR ke Galeri</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Total Pembayaran</Text>
                        <Text style={styles.amountValue}>{amount}</Text>
                    </View>

                    <Text style={styles.expiryText}>Berlaku hingga {dueDate} 23:59</Text>
                </View>
            );
        }

        // Bank Transfer or E-Wallet
        const isEwallet = method.method_type === 'ewallet';

        return (
            <View>
                <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>Selesaikan pembayaran dalam</Text>
                    <Text style={styles.timerValue}>{formatTime(secondsLeft)}</Text>
                </View>

                <View style={styles.vaContainer}>
                    <Text style={styles.vaLabel}>
                        {isEwallet ? 'Nomor E-Wallet Tujuan' : 'Nomor Rekening'}
                    </Text>

                    <View style={styles.vaRow}>
                        <Text style={styles.vaNumber}>{method.account_number || '-'}</Text>
                        {method.account_number && (
                            <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
                                <Ionicons name="copy-outline" size={14} color="#FFF" />
                                <Text style={styles.copyBtnText}>SALIN</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.bankInfo}>
                        <Ionicons
                            name={isEwallet ? 'wallet' : 'business'}
                            size={20}
                            color={Colors.green5}
                        />
                        <Text style={styles.bankName}>{method.method_name}</Text>
                    </View>
                    {method.account_holder && (
                        <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 8 }}>
                            a/n {method.account_holder}
                        </Text>
                    )}
                </View>

                {/* E-Wallet VA Code Info — from database */}
                {isEwallet && (
                    <View style={styles.vaInfoCard}>
                        <View style={styles.vaInfoHeader}>
                            <Ionicons name="information-circle" size={18} color={Colors.green4} />
                            <Text style={styles.vaInfoTitle}>Kode VA per Bank</Text>
                        </View>
                        <Text style={styles.vaInfoDesc}>
                            Kode depan (kode VA) {method.method_name} berbeda tergantung bank Anda. Format: [Kode Bank] + [Nomor HP]
                        </Text>

                        {vaLoading ? (
                            <ActivityIndicator size="small" color={Colors.green3} style={{ marginVertical: 12 }} />
                        ) : vaCodes.length > 0 ? (
                            <View style={styles.vaCodeList}>
                                {vaCodes.map(item => (
                                    <View key={item.id} style={styles.vaCodeRow}>
                                        <Text style={styles.vaCodeBank}>{item.bank_name}</Text>
                                        <Text style={styles.vaCodeValue}>{item.va_code} + No. HP</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={{ fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 10 }}>
                                Data kode VA belum tersedia
                            </Text>
                        )}

                        {vaCodes.length > 0 && (() => {
                            const exampleCode = `${vaCodes[0].va_code}${method.account_number || '08xxxxxxxxxx'}`;
                            return (
                                <View style={styles.vaExampleBox}>
                                    <Text style={styles.vaExampleLabel}>Contoh ({vaCodes[0].bank_name}):</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={styles.vaExampleValue}>{exampleCode}</Text>
                                        <TouchableOpacity
                                            onPress={async () => {
                                                await Clipboard.setStringAsync(exampleCode);
                                                showToast('Kode VA berhasil disalin');
                                            }}
                                            style={styles.copyBtn}
                                        >
                                            <Ionicons name="copy-outline" size={14} color="#FFF" />
                                            <Text style={styles.copyBtnText}>SALIN</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })()}
                    </View>
                )}

                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Total Pembayaran</Text>
                    <Text style={styles.amountValue}>{amount}</Text>
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        { transform: [{ translateY: panY }] }
                    ]}
                >
                    <View {...panResponder.panHandlers} style={styles.draggableArea}>
                        <View style={styles.handleBar} />
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {renderContent()}

                        {/* Description from admin */}
                        {method.description && (
                            <View style={styles.descriptionBox}>
                                <Ionicons name="information-circle-outline" size={18} color={Colors.green4} />
                                <Text style={styles.descriptionText}>{method.description}</Text>
                            </View>
                        )}

                        <View style={styles.instructionList}>
                            <Text style={styles.instructionHeader}>Cara Pembayaran</Text>
                            {getInstructions().map((step, idx) => (
                                <Text key={idx} style={styles.stepText}>{step}</Text>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <CustomButton
                                title="Batal"
                                onPress={onClose}
                                style={{ flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.green5 }}
                                textStyle={{ color: Colors.green5 }}
                            />
                            <CustomButton
                                title="Upload Bukti"
                                onPress={onUploadProof}
                                style={{ flex: 1 }}
                                icon={<Ionicons name="camera-outline" size={18} color={Colors.white} />}
                                iconPosition="left"
                            />
                        </View>
                    </View>
                </Animated.View>
            </View>
            <ToastNotification
                visible={toast.visible}
                message={toast.message}
                onHide={hideToast}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: Colors.green1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '85%',
        paddingTop: 10,
    },
    handleBar: {
        width: 40,
        height: 5,
        backgroundColor: '#CCC',
        borderRadius: 2.5,
        alignSelf: 'center',
    },
    draggableArea: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    centerContent: {
        alignItems: 'center',
        marginBottom: 20,
    },
    instructionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 8,
    },
    instructionSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    qrContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    qrImage: {
        width: 200,
        height: 200,
    },
    expiryText: {
        color: Colors.danger,
        fontSize: 12,
        fontWeight: '500',
        marginTop: 10,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    timerLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    timerValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.warning,
    },
    vaContainer: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    vaLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    vaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    vaNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
        letterSpacing: 1,
    },
    copyText: {
        color: Colors.green3,
        fontWeight: 'bold',
        fontSize: 13,
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.green3,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    copyBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // VA Info Card styles
    vaInfoCard: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    vaInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    vaInfoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.green5,
    },
    vaInfoDesc: {
        fontSize: 12,
        color: Colors.textSecondary,
        lineHeight: 17,
        marginBottom: 10,
    },
    vaCodeList: {
        backgroundColor: '#F9FBF7',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    vaCodeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    vaCodeBank: {
        fontSize: 12,
        color: '#555',
        fontWeight: '500',
    },
    vaCodeValue: {
        fontSize: 12,
        color: Colors.green5,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    vaExampleBox: {
        backgroundColor: '#F1F8E9',
        borderRadius: 8,
        padding: 10,
    },
    vaExampleLabel: {
        fontSize: 11,
        color: Colors.green4,
        fontWeight: '500',
        marginBottom: 3,
    },
    vaExampleValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.green5,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        letterSpacing: 0.5,
    },
    downloadQrBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F1F8E9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    downloadQrText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.green5,
    },
    bankInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    bankName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.green5,
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    amountLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    amountValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    descriptionBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F1F8E9',
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        gap: 10,
    },
    descriptionText: {
        flex: 1,
        fontSize: 13,
        color: Colors.green4,
        lineHeight: 18,
    },
    instructionList: {
        marginTop: 10,
    },
    instructionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 12,
    },
    stepText: {
        fontSize: 14,
        color: Colors.green4,
        marginBottom: 8,
        lineHeight: 20,
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
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
});
