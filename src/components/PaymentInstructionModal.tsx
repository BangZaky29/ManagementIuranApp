import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, Animated, PanResponder, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from './CustomButton';
import { useRouter } from 'expo-router';
import { ToastNotification } from './ToastNotification';
import * as Clipboard from 'expo-clipboard';
import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

interface PaymentInstructionModalProps {
    visible: boolean;
    onClose: () => void;
    method: 'transfer' | 'ewallet' | 'qris';
    amount: string;
    dueDate: string;
}

export const PaymentInstructionModal: React.FC<PaymentInstructionModalProps> = ({ visible, onClose, method, amount, dueDate }) => {
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState(24 * 60 * 60); // 24 hours in seconds
    const panY = React.useRef(new Animated.Value(0)).current;
    const [toast, setToast] = useState({ visible: false, message: '' });
    const [isChecking, setIsChecking] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const showToast = (message: string) => {
        setToast({ visible: true, message });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    const handleCopy = async () => {
        await Clipboard.setStringAsync('8801 2345 6789 000');
        showToast('Kode sudah disalin ke clipboard');
    };

    const handleDownloadQR = async () => {
        if (Platform.OS === 'web') {
            showToast('Download QR feature is limited on web');
            return;
        }

        setIsDownloading(true);

        try {
            // Simulate delay for better UX
            await new Promise(resolve => setTimeout(resolve, 2000));

            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                showToast('Izinkan akses galeri untuk menyimpan QR');
                return;
            }

            if (!documentDirectory) {
                showToast('Gagal mengakses penyimpanan');
                return;
            }

            const fileUri = documentDirectory + 'qr-payment.png';
            const { uri } = await downloadAsync(
                'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WargaPintarPayment',
                fileUri
            );

            await MediaLibrary.saveToLibraryAsync(uri);
            showToast('QR Code berhasil disimpan ke Galeri');
        } catch (error) {
            console.error(error);
            showToast('Gagal menyimpan QR Code');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCheckStatus = () => {
        setIsChecking(true);
        // Simulate API call
        setTimeout(() => {
            setIsChecking(false);
            const isSuccess = Math.random() > 0.3; // 70% chance success mock
            if (isSuccess) {
                showToast('Pembayaran Dikonfirmasi Lunas');
                // Automatically close and go to success screen if needed, or just refresh
            } else {
                showToast('Pembayaran Belum Diterima. Coba lagi nanti.');
            }
        }, 2000);
    };

    useEffect(() => {
        if (!visible) return;
        const timer = setInterval(() => {
            setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [visible]);

    // Reset panY when modal opens
    useEffect(() => {
        if (visible) panY.setValue(0);
    }, [visible]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleDone = () => {
        onClose();
        router.replace('/(tabs)/iuran');
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

    const renderContent = () => {
        if (method === 'qris') {
            return (
                <View style={styles.centerContent}>
                    <Text style={styles.instructionTitle}>Scan QRIS</Text>
                    <Text style={styles.instructionSubtitle}>Scan kode di bawah ini untuk membayar</Text>

                    <View style={styles.qrContainer}>
                        <Image
                            source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WargaPintarPayment' }}
                            style={styles.qrImage}
                        />
                        <TouchableOpacity
                            style={[
                                styles.downloadQrButton,
                                isDownloading && { backgroundColor: '#E0E0E0', borderColor: '#BDBDBD' }
                            ]}
                            onPress={handleDownloadQR}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <ActivityIndicator size="small" color={Colors.green5} />
                            ) : (
                                <>
                                    <Ionicons name="download-outline" size={18} color={Colors.green5} />
                                    <Text style={styles.downloadQrText}>Download QR</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Total Pembayaran</Text>
                        <Text style={styles.amountValue}>{amount}</Text>
                    </View>

                    <Text style={styles.expiryText}>Berlaku hingga {dueDate} 23:59</Text>
                </View>
            );
        }

        return (
            <View>
                <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>Selesaikan pembayaran dalam</Text>
                    <Text style={styles.timerValue}>{formatTime(secondsLeft)}</Text>
                </View>

                <View style={styles.vaContainer}>
                    <Text style={styles.vaLabel}>Nomor Virtual Account</Text>
                    <View style={styles.vaRow}>
                        <Text style={styles.vaNumber}>8801 2345 6789 000</Text>
                        <TouchableOpacity onPress={handleCopy}>
                            <Text style={styles.copyText}>SALIN</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bankInfo}>
                        <Ionicons name={method === 'transfer' ? 'business' : 'wallet'} size={20} color={Colors.green5} />
                        <Text style={styles.bankName}>{method === 'transfer' ? 'Bank Mandiri' : 'GoPay'}</Text>
                    </View>
                </View>

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

                        <View style={styles.instructionList}>
                            <Text style={styles.instructionHeader}>Cara Pembayaran</Text>
                            <Text style={styles.stepText}>1. Buka aplikasi {method === 'qris' ? 'pembayaran / e-wallet' : (method === 'transfer' ? 'Mobile Banking' : 'E-Wallet')}</Text>
                            <Text style={styles.stepText}>2. Pilih menu {method === 'qris' ? 'Scan / Bayar' : 'Transfer / Bayar'}</Text>
                            <Text style={styles.stepText}>3. {method === 'qris' ? 'Scan QR code di atas' : 'Masukkan nomor Virtual Account'}</Text>
                            <Text style={styles.stepText}>4. Periksa detail dan konfirmasi pembayaran</Text>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <CustomButton
                                title="Cek Status"
                                onPress={handleCheckStatus}
                                style={{ flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.green5 }}
                                textStyle={{ color: Colors.green5 }}
                                loading={isChecking}
                            />
                            <CustomButton
                                title="Sudah Bayar"
                                onPress={handleDone}
                                style={{ flex: 1 }}
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
    },
    qrImage: {
        width: 200,
        height: 200,
    },
    downloadQrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#F1F8E9',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.green2,
    },
    downloadQrText: {
        marginLeft: 8,
        color: Colors.green5,
        fontWeight: 'bold',
        fontSize: 14,
    },
    expiryText: {
        color: Colors.danger,
        fontSize: 12,
        fontWeight: '500',
        marginTop: 10,
    },

    // Timer & VA Styles
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

    // Amount Styles
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

    // Instruction List
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
