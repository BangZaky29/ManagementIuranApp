import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { PaymentDetailStyles as styles } from './PaymentDetailStyles';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { CustomButton } from '../../../components/CustomButton';
import { PaymentInstructionModal } from '../../../components/PaymentInstructionModal';

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

