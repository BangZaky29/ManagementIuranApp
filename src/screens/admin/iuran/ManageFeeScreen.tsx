import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, TouchableOpacity,
    StatusBar, ActivityIndicator, StyleSheet, TextInput, Modal,
    RefreshControl, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { CustomButton } from '../../../components/CustomButton';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { useAuth } from '../../../contexts/AuthContext';
import {
    AdminFee,
    fetchAdminFees,
    createFee,
    updateFee,
    deleteFee,
    toggleFeeActive,
} from '../../../services/feeService';

interface FormData {
    name: string;
    amount: string;
    due_date_day: string;
}

const EMPTY_FORM: FormData = { name: '', amount: '', due_date_day: '10' };

export default function ManageFeeScreen() {
    const router = useRouter();
    const { profile } = useAuth();

    const [fees, setFees] = useState<AdminFee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setFormVisible] = useState(false);
    const [editingFee, setEditingFee] = useState<AdminFee | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[],
    });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminFees();
            setFees(data);
        } catch (error) {
            console.error('Failed to load fees:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const openAddForm = () => {
        setEditingFee(null);
        setForm(EMPTY_FORM);
        setFormVisible(true);
    };

    const openEditForm = (fee: AdminFee) => {
        setEditingFee(fee);
        setForm({
            name: fee.name,
            amount: fee.amount.toString(),
            due_date_day: fee.due_date_day.toString(),
        });
        setFormVisible(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            setAlertConfig({
                title: 'Perhatian',
                message: 'Nama iuran wajib diisi.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            });
            setAlertVisible(true);
            return;
        }

        const amount = Number(form.amount);
        if (!amount || amount <= 0) {
            setAlertConfig({
                title: 'Perhatian',
                message: 'Jumlah iuran harus lebih dari 0.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            });
            setAlertVisible(true);
            return;
        }

        const dueDay = Number(form.due_date_day) || 10;

        setIsSaving(true);
        try {
            if (editingFee) {
                await updateFee(editingFee.id, {
                    name: form.name.trim(),
                    amount,
                    due_date_day: dueDay,
                });
            } else {
                await createFee({
                    name: form.name.trim(),
                    amount,
                    due_date_day: dueDay,
                    housing_complex_id: profile?.housing_complex_id!,
                });
            }
            setFormVisible(false);
            loadData();
        } catch (error: any) {
            setAlertConfig({
                title: 'Gagal',
                message: error?.userMessage || 'Gagal menyimpan iuran.',
                type: 'error',
                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
            });
            setAlertVisible(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggle = async (fee: AdminFee) => {
        try {
            await toggleFeeActive(fee.id, fee.is_active);
            loadData();
        } catch (error) {
            console.error('Toggle failed:', error);
        }
    };

    const handleDelete = (fee: AdminFee) => {
        setAlertConfig({
            title: 'Hapus Iuran?',
            message: `Yakin ingin menghapus "${fee.name}"?\n\n⚠️ Semua data pembayaran terkait iuran ini akan terpengaruh.`,
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: () => setAlertVisible(false) },
                {
                    text: 'Hapus', style: 'destructive', onPress: async () => {
                        setAlertVisible(false);
                        try {
                            await deleteFee(fee.id);
                            loadData();
                        } catch (error: any) {
                            setAlertConfig({
                                title: 'Gagal Hapus',
                                message: error?.userMessage || 'Iuran ini mungkin masih memiliki data pembayaran terkait.',
                                type: 'error',
                                buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }],
                            });
                            setAlertVisible(true);
                        }
                    },
                },
            ],
        });
        setAlertVisible(true);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
    };

    const activeFees = fees.filter(f => f.is_active);
    const inactiveFees = fees.filter(f => !f.is_active);
    const totalPerMonth = activeFees.reduce((sum, f) => sum + f.amount, 0);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1B5E20" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kelola Iuran</Text>
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
                    {/* Summary Card */}
                    {activeFees.length > 0 && (
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <View>
                                    <Text style={styles.summaryLabel}>Total Iuran/Bulan</Text>
                                    <Text style={styles.summaryValue}>{formatCurrency(totalPerMonth)}</Text>
                                </View>
                                <View style={styles.summaryBadge}>
                                    <Text style={styles.summaryBadgeText}>{activeFees.length} aktif</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {fees.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color="#CCC" />
                            <Text style={styles.emptyTitle}>Belum Ada Iuran</Text>
                            <Text style={styles.emptySubtitle}>
                                Buat iuran pertama untuk warga komplek Anda. Contoh: Iuran Bulanan, Sampah, Keamanan.
                            </Text>
                            <CustomButton title="Tambah Iuran" onPress={openAddForm} style={{ marginTop: 16 }} />
                        </View>
                    ) : (
                        <>
                            {/* Active Fees */}
                            {activeFees.length > 0 && (
                                <View style={styles.sectionHeaderRow}>
                                    <Text style={styles.sectionTitle}>Iuran Aktif</Text>
                                </View>
                            )}
                            {activeFees.map((fee) => renderFeeCard(fee))}

                            {/* Inactive Fees */}
                            {inactiveFees.length > 0 && (
                                <>
                                    <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
                                        <Text style={[styles.sectionTitle, { color: '#999' }]}>Nonaktif</Text>
                                    </View>
                                    {inactiveFees.map((fee) => renderFeeCard(fee))}
                                </>
                            )}
                        </>
                    )}
                </ScrollView>
            )}

            {/* Add/Edit Modal */}
            <Modal visible={isFormVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingFee ? 'Edit Iuran' : 'Tambah Iuran Baru'}
                            </Text>
                            <TouchableOpacity onPress={() => setFormVisible(false)}>
                                <Ionicons name="close" size={24} color="#1B5E20" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Name */}
                            <Text style={styles.formLabel}>Nama Iuran *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.name}
                                onChangeText={t => setForm({ ...form, name: t })}
                                placeholder="Contoh: Iuran Bulanan, Sampah, Keamanan"
                                placeholderTextColor="#999"
                            />

                            {/* Amount */}
                            <Text style={styles.formLabel}>Jumlah (Rp) *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.amount}
                                onChangeText={t => setForm({ ...form, amount: t.replace(/[^0-9]/g, '') })}
                                placeholder="100000"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                            {form.amount && Number(form.amount) > 0 && (
                                <Text style={styles.amountPreview}>
                                    {formatCurrency(Number(form.amount))}
                                </Text>
                            )}

                            {/* Due Date Day */}
                            <Text style={styles.formLabel}>Tanggal Jatuh Tempo (per bulan)</Text>
                            <TextInput
                                style={styles.input}
                                value={form.due_date_day}
                                onChangeText={t => {
                                    const num = t.replace(/[^0-9]/g, '');
                                    if (Number(num) <= 31) setForm({ ...form, due_date_day: num });
                                }}
                                placeholder="10"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                            <Text style={styles.helperText}>
                                Warga akan melihat jatuh tempo pada tanggal ini setiap bulan.
                            </Text>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <CustomButton
                                title="Batal"
                                onPress={() => setFormVisible(false)}
                                variant="outline"
                                style={{ flex: 1 }}
                            />
                            <CustomButton
                                title={editingFee ? 'Simpan' : 'Tambah'}
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

    function renderFeeCard(fee: AdminFee) {
        return (
            <View key={fee.id} style={[styles.feeCard, !fee.is_active && styles.feeInactive]}>
                <View style={styles.feeHeader}>
                    <View style={styles.feeIconContainer}>
                        <Ionicons name="receipt" size={22} color={fee.is_active ? '#1B5E20' : '#999'} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.feeName}>{fee.name}</Text>
                        <Text style={styles.feeAmount}>{formatCurrency(fee.amount)}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: fee.is_active ? '#E8F5E9' : '#F5F5F5' },
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: fee.is_active ? '#2E7D32' : '#999' },
                        ]}>
                            {fee.is_active ? 'Aktif' : 'Nonaktif'}
                        </Text>
                    </View>
                </View>

                <View style={styles.feeDetail}>
                    <View style={styles.feeDetailItem}>
                        <Ionicons name="calendar-outline" size={14} color="#888" />
                        <Text style={styles.feeDetailText}>Jatuh tempo tgl {fee.due_date_day} setiap bulan</Text>
                    </View>
                </View>

                <View style={styles.feeActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggle(fee)}>
                        <Ionicons
                            name={fee.is_active ? 'pause-circle-outline' : 'play-circle-outline'}
                            size={18}
                            color={Colors.green4}
                        />
                        <Text style={styles.actionText}>{fee.is_active ? 'Nonaktifkan' : 'Aktifkan'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openEditForm(fee)}>
                        <Ionicons name="create-outline" size={18} color={Colors.green4} />
                        <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(fee)}>
                        <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                        <Text style={[styles.actionText, { color: Colors.danger }]}>Hapus</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7F5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 48 : 16,
        paddingBottom: 15,
        backgroundColor: '#FFF',
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20', flex: 1, marginLeft: 10 },
    addButton: { padding: 5 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 16, paddingBottom: 40 },

    // Summary
    summaryCard: {
        backgroundColor: '#1B5E20', borderRadius: 16, padding: 18, marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    summaryLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
    summaryValue: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginTop: 4 },
    summaryBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12,
        paddingVertical: 6, borderRadius: 12,
    },
    summaryBadgeText: { fontSize: 12, fontWeight: '600', color: '#FFF' },

    // Section
    sectionHeaderRow: { marginBottom: 8 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333' },

    // Empty
    emptyContainer: {
        alignItems: 'center', paddingVertical: 60,
        backgroundColor: '#FFF', borderRadius: 20, padding: 30,
    },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 16 },
    emptySubtitle: {
        fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8, lineHeight: 20,
    },

    // Fee Card
    feeCard: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 16,
        marginBottom: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    feeInactive: { opacity: 0.6 },
    feeHeader: { flexDirection: 'row', alignItems: 'center' },
    feeIconContainer: {
        width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F8E9',
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    feeName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    feeAmount: { fontSize: 14, fontWeight: '600', color: Colors.green3, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '600' },
    feeDetail: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
    feeDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    feeDetailText: { fontSize: 12, color: '#888' },
    feeActions: {
        flexDirection: 'row', justifyContent: 'flex-end', gap: 16,
        marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5',
    },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { fontSize: 12, fontWeight: '600', color: Colors.green4 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: {
        backgroundColor: '#F5F7F5', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20' },
    modalContent: { padding: 20 },
    modalFooter: { flexDirection: 'row', padding: 20, gap: 10 },
    formLabel: {
        fontSize: 14, fontWeight: '600', color: '#333',
        marginBottom: 8, marginTop: 16,
    },
    input: {
        backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16,
        paddingVertical: 12, fontSize: 14, color: '#333',
        borderWidth: 1, borderColor: '#E0E0E0',
    },
    amountPreview: {
        fontSize: 13, fontWeight: '600', color: Colors.green3, marginTop: 6,
    },
    helperText: {
        fontSize: 12, color: '#888', marginTop: 6, fontStyle: 'italic',
    },
});
