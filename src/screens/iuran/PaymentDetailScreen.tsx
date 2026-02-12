import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { CustomButton } from '../../components/CustomButton';
import { PaymentInstructionModal } from '../../components/PaymentInstructionModal';

// Mock Data for the detail
const PAYMENT_DETAIL = {
    month: 'Februari 2026',
    items: [
        { label: 'Iuran Keamanan', value: 100000 },
        { label: 'Iuran Sampah', value: 50000 },
        { label: 'Biaya Admin', value: 2500 }
    ],
    total: 152500,
    dueDate: '15 Feb 2026'
};

export default function PaymentDetailScreen() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<'transfer' | 'ewallet' | 'qris'>('transfer');
    const [isModalVisible, setModalVisible] = useState(false);

    const handleConfirmPayment = () => {
        setModalVisible(true);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rincian Pembayaran</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Bill Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rincian Tagihan</Text>
                    <Text style={styles.billPeriod}>{PAYMENT_DETAIL.month}</Text>

                    <View style={styles.card}>
                        {PAYMENT_DETAIL.items.map((item, index) => (
                            <View key={index} style={styles.row}>
                                <Text style={styles.rowLabel}>{item.label}</Text>
                                <Text style={styles.rowValue}>{formatCurrency(item.value)}</Text>
                            </View>
                        ))}
                        <View style={styles.divider} />
                        <View style={styles.row}>
                            <Text style={styles.totalLabel}>Total Tagihan</Text>
                            <Text style={styles.totalValue}>{formatCurrency(PAYMENT_DETAIL.total)}</Text>
                        </View>
                    </View>
                </View>

                {/* Due Date */}
                <View style={styles.infoBox}>
                    <Ionicons name="alert-circle-outline" size={20} color={Colors.warning} />
                    <Text style={styles.infoText}>Jatuh tempo pada {PAYMENT_DETAIL.dueDate}</Text>
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
                    <View style={styles.methodContainer}>
                        <TouchableOpacity
                            style={[styles.methodCard, selectedMethod === 'transfer' && styles.methodActive]}
                            onPress={() => setSelectedMethod('transfer')}
                        >
                            <View style={styles.radioOuter}>
                                {selectedMethod === 'transfer' && <View style={styles.radioInner} />}
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.methodName}>Transfer Bank</Text>
                                <Text style={styles.methodDesc}>BCA, Mandiri, BRI, BNI</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.methodCard, selectedMethod === 'ewallet' && styles.methodActive]}
                            onPress={() => setSelectedMethod('ewallet')}
                        >
                            <View style={styles.radioOuter}>
                                {selectedMethod === 'ewallet' && <View style={styles.radioInner} />}
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.methodName}>E-Wallet</Text>
                                <Text style={styles.methodDesc}>GoPay, OVO, Dana, ShopeePay</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.methodCard, selectedMethod === 'qris' && styles.methodActive]}
                            onPress={() => setSelectedMethod('qris')}
                        >
                            <View style={styles.radioOuter}>
                                {selectedMethod === 'qris' && <View style={styles.radioInner} />}
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.methodName}>QRIS</Text>
                                <Text style={styles.methodDesc}>Scan QR untuk pembayaran instan</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.footer}>
                <View style={styles.footerTotal}>
                    <Text style={styles.footerLabel}>Total Bayar</Text>
                    <Text style={styles.footerAmount}>{formatCurrency(PAYMENT_DETAIL.total)}</Text>
                </View>
                <CustomButton
                    title="Konfirmasi Pembayaran"
                    onPress={handleConfirmPayment}
                    style={{ flex: 1, marginLeft: 20 }}
                    icon={<Ionicons name="lock-closed-outline" size={18} color={Colors.white} />}
                    iconPosition="right"
                />
            </View>

            <PaymentInstructionModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                method={selectedMethod}
                amount={formatCurrency(PAYMENT_DETAIL.total)}
                dueDate={PAYMENT_DETAIL.dueDate}
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
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
        marginBottom: 12,
    },
    billPeriod: {
        fontSize: 14,
        color: Colors.green4,
        marginBottom: 8,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    rowLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    rowValue: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.green5,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green3,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoText: {
        marginLeft: 8,
        color: '#E65100',
        fontSize: 13,
    },
    methodContainer: {
        gap: 12,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    methodActive: {
        borderColor: Colors.green3,
        backgroundColor: '#F1F8E9',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.green4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.green3,
    },
    methodName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colors.green5,
    },
    methodDesc: {
        fontSize: 12,
        color: Colors.textSecondary,
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
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
    },
    footerTotal: {
        flex: 1,
    },
    footerLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    footerAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.green5,
    },
});
