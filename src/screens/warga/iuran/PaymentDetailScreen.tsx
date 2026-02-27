import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, SafeAreaView,
    StatusBar, ActivityIndicator, StyleSheet, Platform, Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '../../../components/CustomButton';
import { PaymentInstructionModal } from '../../../components/PaymentInstructionModal';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchPaymentMethodsForUser, PaymentMethod } from '../../../services/paymentMethodService';

interface SelectedFee {
    feeId: number;
    amount: number;
    name: string;
}

export default function PaymentDetailScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const params = useLocalSearchParams<{ selectedFees: string; totalAmount: string }>();

    const selectedFees: SelectedFee[] = params.selectedFees ? JSON.parse(params.selectedFees) : [];
    const totalAmount = Number(params.totalAmount) || selectedFees.reduce((s, f) => s + f.amount, 0);

    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    useEffect(() => { loadMethods(); }, []);

    const loadMethods = async () => {
        setIsLoading(true);
        try {
            const methods = await fetchPaymentMethodsForUser();
            setPaymentMethods(methods);
            if (methods.length > 0) setSelectedMethodId(methods[0].id);
        } catch (error) {
            console.error('Failed to load methods:', error);
        } finally { setIsLoading(false); }
    };

    const handleConfirmPayment = () => {
        if (!selectedMethodId) return;
        setModalVisible(true);
    };

    const handleNavigateToProof = () => {
        const method = paymentMethods.find(m => m.id === selectedMethodId);
        if (!method) return;
        setModalVisible(false);
        router.push({
            pathname: '/iuran/payment-proof',
            params: {
                totalAmount: totalAmount.toString(),
                methodName: method.method_name,
                methodType: method.method_type,
                period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
                unpaidFees: JSON.stringify(selectedFees),
            },
        });
    };

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

    const getMethodIcon = (t: string) => t === 'bank_transfer' ? 'business' : t === 'ewallet' ? 'wallet' : t === 'qris' ? 'qr-code' : 'card';
    const getMethodLabel = (t: string) => t === 'bank_transfer' ? 'Transfer Bank' : t === 'ewallet' ? 'E-Wallet' : t === 'qris' ? 'QRIS' : t;

    const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);
    const currentMonth = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    if (isLoading) {
        return (
            <SafeAreaView style={st.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />
                <View style={st.header}>
                    <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#1B5E20" />
                    </TouchableOpacity>
                    <Text style={st.headerTitle}>Rincian Pembayaran</Text>
                </View>
                <View style={st.center}><ActivityIndicator size="large" color="#1B5E20" /></View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={st.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

            <View style={st.header}>
                <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1B5E20" />
                </TouchableOpacity>
                <Text style={st.headerTitle}>Rincian Pembayaran</Text>
            </View>

            <ScrollView contentContainerStyle={st.content}>

                {/* Bill Summary */}
                <View style={st.section}>
                    <Text style={st.sectionTitle}>Rincian Tagihan</Text>
                    <Text style={st.period}>{currentMonth}</Text>

                    <View style={st.card}>
                        {selectedFees.map((fee, idx) => (
                            <View key={idx} style={st.row}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="receipt-outline" size={14} color="#888" />
                                    <Text style={st.rowLabel}>{fee.name}</Text>
                                </View>
                                <Text style={st.rowValue}>{formatCurrency(fee.amount)}</Text>
                            </View>
                        ))}
                        <View style={st.divider} />
                        <View style={st.row}>
                            <Text style={st.totalLabel}>Total Bayar</Text>
                            <Text style={st.totalValue}>{formatCurrency(totalAmount)}</Text>
                        </View>
                    </View>
                </View>

                {/* Info */}
                <View style={st.infoBox}>
                    <Ionicons name="information-circle-outline" size={18} color="#1B5E20" />
                    <Text style={st.infoText}>Pilih metode pembayaran, lalu lakukan transfer sesuai instruksi.</Text>
                </View>

                {/* Payment Methods */}
                <View style={st.section}>
                    <Text style={st.sectionTitle}>Metode Pembayaran</Text>

                    {paymentMethods.length === 0 ? (
                        <View style={st.emptyMethod}>
                            <Ionicons name="card-outline" size={40} color="#CCC" />
                            <Text style={st.emptyMethodTitle}>Belum Ada Metode</Text>
                            <Text style={st.emptyMethodSub}>Admin belum menambahkan metode pembayaran.</Text>
                        </View>
                    ) : (
                        <View style={{ gap: 10 }}>
                            {paymentMethods.map(method => (
                                <TouchableOpacity
                                    key={method.id}
                                    style={[st.methodCard, selectedMethodId === method.id && st.methodActive]}
                                    onPress={() => setSelectedMethodId(method.id)}
                                >
                                    <View style={[st.radio, selectedMethodId === method.id && st.radioChecked]}>
                                        {selectedMethodId === method.id && <View style={st.radioInner} />}
                                    </View>
                                    <View style={st.methodInfo}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Ionicons name={getMethodIcon(method.method_type) as any} size={16} color="#1B5E20" />
                                            <Text style={st.methodName}>{method.method_name}</Text>
                                        </View>
                                        <Text style={st.methodDesc}>
                                            {getMethodLabel(method.method_type)}
                                            {method.account_number ? ` • ${method.account_number}` : ''}
                                        </Text>
                                        {method.account_holder && (
                                            <Text style={st.methodHolder}>a/n {method.account_holder}</Text>
                                        )}
                                    </View>

                                    {/* QR thumbnail */}
                                    {method.method_type === 'qris' && method.qris_image_url && (
                                        <Image source={{ uri: method.qris_image_url }} style={st.qrThumb} resizeMode="contain" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Footer */}
            {selectedFees.length > 0 && paymentMethods.length > 0 && (
                <View style={st.footer}>
                    <View style={{ flex: 1 }}>
                        <Text style={st.footerLabel}>{selectedFees.length} iuran</Text>
                        <Text style={st.footerAmount}>{formatCurrency(totalAmount)}</Text>
                    </View>
                    <CustomButton
                        title="Konfirmasi"
                        onPress={handleConfirmPayment}
                        style={{ flex: 1, marginLeft: 16 }}
                        icon={<Ionicons name="lock-closed-outline" size={16} color="#FFF" />}
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
                    amount={formatCurrency(totalAmount)}
                    dueDate={currentMonth}
                    onUploadProof={handleNavigateToProof}
                />
            )}
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7F5' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 48 : 16, paddingBottom: 12, backgroundColor: '#FFF',
    },
    backBtn: { padding: 5, marginRight: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20' },
    content: { padding: 16, paddingBottom: 120 },

    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
    period: { fontSize: 13, color: '#1B5E20', fontWeight: '500', marginBottom: 10 },

    card: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    rowLabel: { fontSize: 14, color: '#666' },
    rowValue: { fontSize: 14, fontWeight: '500', color: '#333' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20' },

    infoBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#F1F8E9', padding: 12, borderRadius: 12, marginBottom: 20,
    },
    infoText: { flex: 1, fontSize: 12, color: '#1B5E20', lineHeight: 18 },

    emptyMethod: { alignItems: 'center', padding: 30, backgroundColor: '#FFF', borderRadius: 16 },
    emptyMethodTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 10 },
    emptyMethodSub: { fontSize: 13, color: '#888', marginTop: 4, textAlign: 'center' },

    methodCard: {
        flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14,
        backgroundColor: '#FFF', borderWidth: 1.5, borderColor: 'transparent',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
            android: { elevation: 1 },
        }),
    },
    methodActive: { borderColor: '#1B5E20', backgroundColor: '#F1F8E9' },
    radio: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CCC',
        alignItems: 'center', justifyContent: 'center',
    },
    radioChecked: { borderColor: '#1B5E20' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1B5E20' },
    methodInfo: { flex: 1, marginLeft: 12 },
    methodName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    methodDesc: { fontSize: 11, color: '#888', marginTop: 2 },
    methodHolder: { fontSize: 11, color: '#1B5E20', fontWeight: '500', marginTop: 1 },
    qrThumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F5F5F5', marginLeft: 8 },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', padding: 16,
        backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 8 },
            android: { elevation: 10 },
        }),
    },
    footerLabel: { fontSize: 12, color: '#888' },
    footerAmount: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20' },
});
