import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, TouchableOpacity,
    StatusBar, ActivityIndicator, StyleSheet, TextInput, Modal, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomButton } from '../../../components/CustomButton';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';
import {
    PaymentMethod,
    fetchAdminPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
} from '../../../services/paymentMethodService';

type MethodType = 'bank_transfer' | 'ewallet' | 'qris';

interface FormData {
    method_type: MethodType;
    method_name: string;
    account_number: string;
    account_holder: string;
    description: string;
}

const EMPTY_FORM: FormData = {
    method_type: 'bank_transfer',
    method_name: '',
    account_number: '',
    account_holder: '',
    description: '',
};

const METHOD_TYPES: { value: MethodType; label: string; icon: string }[] = [
    { value: 'bank_transfer', label: 'Transfer Bank', icon: 'business' },
    { value: 'ewallet', label: 'E-Wallet', icon: 'wallet' },
    { value: 'qris', label: 'QRIS', icon: 'qr-code' },
];

export default function ManagePaymentMethodsScreen() {
    const router = useRouter();
    const { user, profile } = useAuth();

    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setFormVisible] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[],
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminPaymentMethods();
            setMethods(data);
        } catch (error) {
            console.error('Failed to load methods:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const openAddForm = () => {
        setEditingMethod(null);
        setForm(EMPTY_FORM);
        setFormVisible(true);
    };

    const openEditForm = (method: PaymentMethod) => {
        setEditingMethod(method);
        setForm({
            method_type: method.method_type,
            method_name: method.method_name,
            account_number: method.account_number || '',
            account_holder: method.account_holder || '',
            description: method.description || '',
        });
        setFormVisible(true);
    };

    const handleSave = async () => {
        if (!form.method_name.trim()) {
            setAlertConfig({
                title: 'Perhatian',
                message: 'Nama metode pembayaran wajib diisi.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            });
            setAlertVisible(true);
            return;
        }

        setIsSaving(true);
        try {
            if (editingMethod) {
                await updatePaymentMethod(editingMethod.id, {
                    method_type: form.method_type,
                    method_name: form.method_name.trim(),
                    account_number: form.account_number.trim() || undefined,
                    account_holder: form.account_holder.trim() || undefined,
                    description: form.description.trim() || undefined,
                });
            } else {
                await createPaymentMethod({
                    housing_complex_id: profile?.housing_complex_id!,
                    method_type: form.method_type,
                    method_name: form.method_name.trim(),
                    account_number: form.account_number.trim() || undefined,
                    account_holder: form.account_holder.trim() || undefined,
                    description: form.description.trim() || undefined,
                }, user!.id);
            }
            setFormVisible(false);
            loadData();
        } catch (error: any) {
            setAlertConfig({
                title: 'Gagal',
                message: error?.userMessage || 'Gagal menyimpan metode pembayaran.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            });
            setAlertVisible(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (method: PaymentMethod) => {
        try {
            await updatePaymentMethod(method.id, { is_active: !method.is_active });
            loadData();
        } catch (error) {
            console.error('Toggle failed:', error);
        }
    };

    const handleDelete = (method: PaymentMethod) => {
        setAlertConfig({
            title: 'Hapus Metode?',
            message: `Yakin ingin menghapus "${method.method_name}"? Tindakan ini tidak dapat dibatalkan.`,
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: () => setAlertVisible(false) },
                {
                    text: 'Hapus', style: 'destructive', onPress: async () => {
                        setAlertVisible(false);
                        try {
                            await deletePaymentMethod(method.id);
                            loadData();
                        } catch (error) {
                            console.error('Delete failed:', error);
                        }
                    },
                },
            ],
        });
        setAlertVisible(true);
    };

    const getMethodIcon = (type: string) => {
        return METHOD_TYPES.find(t => t.value === type)?.icon || 'card';
    };

    const getMethodLabel = (type: string) => {
        return METHOD_TYPES.find(t => t.value === type)?.label || type;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.green1} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.green5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Metode Pembayaran</Text>
                <TouchableOpacity onPress={openAddForm} style={styles.addButton}>
                    <Ionicons name="add-circle" size={28} color={Colors.green3} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.green3} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={false} onRefresh={loadData} colors={[Colors.green3]} />}
                >
                    {methods.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="card-outline" size={64} color={Colors.textSecondary} />
                            <Text style={styles.emptyTitle}>Belum Ada Metode</Text>
                            <Text style={styles.emptySubtitle}>
                                Tambahkan metode pembayaran agar warga bisa melakukan pembayaran iuran.
                            </Text>
                            <CustomButton title="Tambah Metode" onPress={openAddForm} style={{ marginTop: 16 }} />
                        </View>
                    ) : (
                        methods.map((method) => (
                            <View key={method.id} style={[styles.methodCard, !method.is_active && styles.methodInactive]}>
                                <View style={styles.methodHeader}>
                                    <View style={styles.methodIconContainer}>
                                        <Ionicons name={getMethodIcon(method.method_type) as any} size={24} color={Colors.green5} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.methodName}>{method.method_name}</Text>
                                        <Text style={styles.methodType}>{getMethodLabel(method.method_type)}</Text>
                                    </View>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: method.is_active ? '#E8F5E9' : '#FFEBEE' }
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            { color: method.is_active ? '#2E7D32' : '#C62828' }
                                        ]}>
                                            {method.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Text>
                                    </View>
                                </View>

                                {method.account_number && (
                                    <View style={styles.methodDetail}>
                                        <Text style={styles.detailLabel}>Nomor:</Text>
                                        <Text style={styles.detailValue}>{method.account_number}</Text>
                                    </View>
                                )}
                                {method.account_holder && (
                                    <View style={styles.methodDetail}>
                                        <Text style={styles.detailLabel}>Atas Nama:</Text>
                                        <Text style={styles.detailValue}>{method.account_holder}</Text>
                                    </View>
                                )}
                                {method.description && (
                                    <Text style={styles.methodDescription}>{method.description}</Text>
                                )}

                                <View style={styles.methodActions}>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleToggleActive(method)}
                                    >
                                        <Ionicons
                                            name={method.is_active ? 'eye-off-outline' : 'eye-outline'}
                                            size={18}
                                            color={Colors.green4}
                                        />
                                        <Text style={styles.actionText}>
                                            {method.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => openEditForm(method)}
                                    >
                                        <Ionicons name="create-outline" size={18} color={Colors.green4} />
                                        <Text style={styles.actionText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleDelete(method)}
                                    >
                                        <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                                        <Text style={[styles.actionText, { color: Colors.danger }]}>Hapus</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {/* Add/Edit Modal */}
            <Modal visible={isFormVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingMethod ? 'Edit Metode' : 'Tambah Metode Baru'}
                            </Text>
                            <TouchableOpacity onPress={() => setFormVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.green5} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Method Type Selector */}
                            <Text style={styles.formLabel}>Tipe Metode</Text>
                            <View style={styles.typeSelector}>
                                {METHOD_TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={[
                                            styles.typeOption,
                                            form.method_type === type.value && styles.typeOptionActive,
                                        ]}
                                        onPress={() => setForm({ ...form, method_type: type.value })}
                                    >
                                        <Ionicons
                                            name={type.icon as any}
                                            size={20}
                                            color={form.method_type === type.value ? Colors.green5 : Colors.textSecondary}
                                        />
                                        <Text style={[
                                            styles.typeLabel,
                                            form.method_type === type.value && styles.typeLabelActive,
                                        ]}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Method Name */}
                            <Text style={styles.formLabel}>Nama Metode *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.method_name}
                                onChangeText={t => setForm({ ...form, method_name: t })}
                                placeholder="Contoh: BCA, GoPay, QRIS Mandiri"
                                placeholderTextColor="#999"
                            />

                            {/* Account Number */}
                            <Text style={styles.formLabel}>
                                {form.method_type === 'bank_transfer' ? 'Nomor Rekening' : 'Nomor Tujuan'}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={form.account_number}
                                onChangeText={t => setForm({ ...form, account_number: t })}
                                placeholder={form.method_type === 'bank_transfer' ? '1234567890' : '08123456789'}
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />

                            {/* Account Holder */}
                            <Text style={styles.formLabel}>Nama Pemegang</Text>
                            <TextInput
                                style={styles.input}
                                value={form.account_holder}
                                onChangeText={t => setForm({ ...form, account_holder: t })}
                                placeholder="Nama pemilik rekening/akun"
                                placeholderTextColor="#999"
                            />

                            {/* Description */}
                            <Text style={styles.formLabel}>Instruksi Tambahan</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={form.description}
                                onChangeText={t => setForm({ ...form, description: t })}
                                placeholder="Catatan khusus untuk warga (opsional)"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <CustomButton
                                title="Batal"
                                onPress={() => setFormVisible(false)}
                                variant="outline"
                                style={{ flex: 1 }}
                            />
                            <CustomButton
                                title={editingMethod ? 'Simpan' : 'Tambah'}
                                onPress={handleSave}
                                loading={isSaving}
                                style={{ flex: 1, marginLeft: 10 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

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
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15,
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.green5, flex: 1, marginLeft: 10 },
    addButton: { padding: 5 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20, paddingBottom: 40 },
    emptyContainer: {
        alignItems: 'center', paddingVertical: 60,
        backgroundColor: Colors.white, borderRadius: 20, padding: 30,
    },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.green5, marginTop: 16 },
    emptySubtitle: {
        fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
        marginTop: 8, lineHeight: 20,
    },
    methodCard: {
        backgroundColor: Colors.white, borderRadius: 16, padding: 16,
        marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    },
    methodInactive: { opacity: 0.6 },
    methodHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    methodIconContainer: {
        width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F8E9',
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    methodName: { fontSize: 16, fontWeight: 'bold', color: Colors.green5 },
    methodType: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '600' },
    methodDetail: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 4,
    },
    detailLabel: { fontSize: 13, color: Colors.textSecondary },
    detailValue: { fontSize: 13, fontWeight: '600', color: Colors.green5 },
    methodDescription: {
        fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic',
        marginTop: 4, lineHeight: 18,
    },
    methodActions: {
        flexDirection: 'row', justifyContent: 'flex-end', gap: 16,
        marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { fontSize: 12, fontWeight: '600', color: Colors.green4 },

    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: Colors.green1, borderTopLeftRadius: 24,
        borderTopRightRadius: 24, maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.green2,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.green5 },
    modalContent: { padding: 20 },
    modalFooter: { flexDirection: 'row', padding: 20, gap: 10 },
    formLabel: {
        fontSize: 14, fontWeight: '600', color: Colors.green5,
        marginBottom: 8, marginTop: 16,
    },
    input: {
        backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 16,
        paddingVertical: 12, fontSize: 14, color: Colors.green5,
        borderWidth: 1, borderColor: Colors.green2,
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    typeSelector: { flexDirection: 'row', gap: 8 },
    typeOption: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 10, borderRadius: 12,
        backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.green2,
    },
    typeOptionActive: { backgroundColor: '#F1F8E9', borderColor: Colors.green3 },
    typeLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
    typeLabelActive: { color: Colors.green5 },
});
