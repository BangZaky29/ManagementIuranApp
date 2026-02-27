import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { PaymentDetailStyles as styles } from './PaymentDetailStyles';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { CustomButton } from '../../../components/CustomButton';
import { PaymentInstructionModal } from '../../../components/PaymentInstructionModal';
import { useAuth } from '../../../contexts/AuthContext';
import { calculateBillSummary, BillSummary } from '../../../services/iuranService';
import { fetchPaymentMethodsForUser, PaymentMethod } from '../../../services/paymentMethodService';

export default function PaymentDetailScreen() {
    const router = useRouter();
    const { user, profile } = useAuth();
    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [billSummary, setBillSummary] = useState<BillSummary | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        loadData();
    }, [user?.id]);

    const loadData = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const [bill, methods] = await Promise.all([
                calculateBillSummary(user.id),
                fetchPaymentMethodsForUser(),
            ]);
            setBillSummary(bill);
            setPaymentMethods(methods);
            // Auto-select first method
            if (methods.length > 0) {
                setSelectedMethodId(methods[0].id);
            }
        } catch (error) {
            console.error('Failed to load payment detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmPayment = () => {
        if (!selectedMethodId) return;
        setModalVisible(true);
    };

    const handleNavigateToProof = () => {
        const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);
        if (!selectedMethod || !billSummary) return;

        setModalVisible(false);

        // Navigate to proof upload screen with params
        router.push({
            pathname: '/iuran/payment-proof',
            params: {
                totalAmount: billSummary.totalUnpaid.toString(),
                methodName: selectedMethod.method_name,
                methodType: selectedMethod.method_type,
                period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
                unpaidFees: JSON.stringify(
                    billSummary.items
                        .filter(i => !i.isPaid)
                        .map(i => ({ feeId: i.fee.id, amount: i.amount, name: i.fee.name }))
                ),
            },
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    const getMethodIcon = (type: string): string => {
        switch (type) {
            case 'bank_transfer': return 'business';
            case 'ewallet': return 'wallet';
            case 'qris': return 'qr-code';
            default: return 'card';
        }
    };

    const getMethodTypeLabel = (type: string): string => {
        switch (type) {
            case 'bank_transfer': return 'Transfer Bank';
            case 'ewallet': return 'E-Wallet';
            case 'qris': return 'QRIS';
            default: return type;
        }
    };

    const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Rincian Pembayaran</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.green3} />
                    <Text style={{ marginTop: 12, color: Colors.textSecondary }}>Memuat data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const currentMonth = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    const unpaidItems = billSummary?.items.filter(i => !i.isPaid) || [];
    const totalUnpaid = billSummary?.totalUnpaid || 0;

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
                    <Text style={styles.billPeriod}>{currentMonth}</Text>

                    <View style={styles.card}>
                        {unpaidItems.map((item, index) => (
                            <View key={index} style={styles.row}>
                                <Text style={styles.rowLabel}>{item.fee.name}</Text>
                                <Text style={styles.rowValue}>{formatCurrency(item.amount)}</Text>
                            </View>
                        ))}
                        {unpaidItems.length === 0 && (
                            <Text style={{ color: Colors.textSecondary, textAlign: 'center', paddingVertical: 12 }}>
                                Semua tagihan sudah lunas 🎉
                            </Text>
                        )}
                        {unpaidItems.length > 0 && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.row}>
                                    <Text style={styles.totalLabel}>Total Tagihan</Text>
                                    <Text style={styles.totalValue}>{formatCurrency(totalUnpaid)}</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Due Date */}
                {billSummary && !billSummary.allPaid && (
                    <View style={styles.infoBox}>
                        <Ionicons name="alert-circle-outline" size={20} color={Colors.warning} />
                        <Text style={styles.infoText}>Jatuh tempo pada {billSummary.dueDate}</Text>
                    </View>
                )}

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Metode Pembayaran</Text>

                    {paymentMethods.length === 0 ? (
                        <View style={{
                            backgroundColor: Colors.white,
                            borderRadius: 16,
                            padding: 24,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(0,0,0,0.05)',
                        }}>
                            <Ionicons name="card-outline" size={48} color={Colors.textSecondary} />
                            <Text style={{
                                fontSize: 15,
                                fontWeight: '600',
                                color: Colors.green5,
                                marginTop: 12,
                                textAlign: 'center',
                            }}>
                                Belum Ada Metode Pembayaran
                            </Text>
                            <Text style={{
                                fontSize: 13,
                                color: Colors.textSecondary,
                                marginTop: 6,
                                textAlign: 'center',
                                lineHeight: 18,
                            }}>
                                Admin komplek Anda belum menambahkan metode pembayaran. Silakan hubungi admin.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.methodContainer}>
                            {paymentMethods.map((method) => (
                                <TouchableOpacity
                                    key={method.id}
                                    style={[styles.methodCard, selectedMethodId === method.id && styles.methodActive]}
                                    onPress={() => setSelectedMethodId(method.id)}
                                >
                                    <View style={styles.radioOuter}>
                                        {selectedMethodId === method.id && <View style={styles.radioInner} />}
                                    </View>
                                    <View style={{ marginLeft: 12, flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Ionicons
                                                name={getMethodIcon(method.method_type) as any}
                                                size={18}
                                                color={Colors.green4}
                                            />
                                            <Text style={styles.methodName}>{method.method_name}</Text>
                                        </View>
                                        <Text style={styles.methodDesc}>
                                            {getMethodTypeLabel(method.method_type)}
                                            {method.account_number ? ` • ${method.account_number}` : ''}
                                        </Text>
                                        {method.account_holder && (
                                            <Text style={[styles.methodDesc, { fontSize: 11, marginTop: 2 }]}>
                                                a/n {method.account_holder}
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

            </ScrollView>

            {/* Bottom Button */}
            {unpaidItems.length > 0 && paymentMethods.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.footerTotal}>
                        <Text style={styles.footerLabel}>Total Bayar</Text>
                        <Text style={styles.footerAmount}>{formatCurrency(totalUnpaid)}</Text>
                    </View>
                    <CustomButton
                        title="Konfirmasi Pembayaran"
                        onPress={handleConfirmPayment}
                        style={{ flex: 1, marginLeft: 20 }}
                        icon={<Ionicons name="lock-closed-outline" size={18} color={Colors.white} />}
                        iconPosition="right"
                        disabled={!selectedMethodId}
                    />
                </View>
            )}

            {selectedMethod && (
                <PaymentInstructionModal
                    visible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    method={selectedMethod}
                    amount={formatCurrency(totalUnpaid)}
                    dueDate={billSummary?.dueDate || '-'}
                    onUploadProof={handleNavigateToProof}
                />
            )}
        </SafeAreaView>
    );
}
