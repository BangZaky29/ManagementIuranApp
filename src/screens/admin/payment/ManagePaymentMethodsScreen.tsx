import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, TouchableOpacity,
    StatusBar, ActivityIndicator, StyleSheet, TextInput, Modal, RefreshControl,
    Image, Platform, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
    uploadQrisImage,
} from '../../../services/paymentMethodService';

// ====== CONSTANTS ======

type MethodType = 'bank_transfer' | 'ewallet' | 'qris';

const METHOD_TYPES: { value: MethodType; label: string; icon: string }[] = [
    { value: 'bank_transfer', label: 'Transfer Bank', icon: 'business' },
    { value: 'ewallet', label: 'E-Wallet', icon: 'wallet' },
    { value: 'qris', label: 'QRIS', icon: 'qr-code' },
];

// E-Wallet options with merchant prefixes
const EWALLET_OPTIONS: { name: string; prefix: string; color: string }[] = [
    { name: 'GoPay', prefix: '', color: '#00AED6' },
    { name: 'OVO', prefix: '', color: '#4C3494' },
    { name: 'DANA', prefix: '', color: '#108EE9' },
    { name: 'ShopeePay', prefix: '', color: '#EE4D2D' },
    { name: 'LinkAja', prefix: '', color: '#E2231A' },
];

// Bank options
const BANK_OPTIONS = ['BCA', 'BNI', 'BRI', 'Mandiri', 'BSI', 'CIMB', 'Permata', 'BTN', 'Lainnya'];

interface FormData {
    method_type: MethodType;
    method_name: string;
    account_number: string;
    account_holder: string;
    description: string;
    qris_image_uri: string | null; // local URI for new upload
    qris_image_url: string | null; // existing URL
}

const EMPTY_FORM: FormData = {
    method_type: 'bank_transfer',
    method_name: '',
    account_number: '',
    account_holder: '',
    description: '',
    qris_image_uri: null,
    qris_image_url: null,
};

export default function ManagePaymentMethodsScreen() {
    const router = useRouter();
    const { user, profile } = useAuth();

    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setFormVisible] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [showEwalletPicker, setShowEwalletPicker] = useState(false);
    const [showBankPicker, setShowBankPicker] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[],
    });

    // ====== LOAD ======

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminPaymentMethods();
            setMethods(data);
        } catch (error) {
            console.error('Failed to load methods:', error);
        } finally { setIsLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ====== FORM ======

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
            qris_image_uri: null,
            qris_image_url: method.qris_image_url || null,
        });
        setFormVisible(true);
    };

    const handleSave = async () => {
        if (!form.method_name.trim()) {
            showAlert('Perhatian', 'Nama metode wajib diisi.', 'warning');
            return;
        }

        if (form.method_type === 'qris' && !form.qris_image_uri && !form.qris_image_url) {
            showAlert('Perhatian', 'Upload gambar QR Code terlebih dahulu.', 'warning');
            return;
        }

        if (form.method_type !== 'qris' && !form.account_number.trim()) {
            showAlert('Perhatian', 'Nomor rekening/tujuan wajib diisi.', 'warning');
            return;
        }

        setIsSaving(true);
        try {
            let qrisUrl = form.qris_image_url;

            // Upload QR image if new one selected
            if (form.method_type === 'qris' && form.qris_image_uri) {
                const fileName = `qr_${Date.now()}.jpg`;
                qrisUrl = await uploadQrisImage(user!.id, form.qris_image_uri, fileName);
            }

            const payload: any = {
                method_type: form.method_type,
                method_name: form.method_name.trim(),
                account_number: form.method_type === 'qris' ? null : form.account_number.trim() || null,
                account_holder: form.account_holder.trim() || null,
                description: form.description.trim() || null,
                qris_image_url: form.method_type === 'qris' ? qrisUrl : null,
            };

            if (editingMethod) {
                await updatePaymentMethod(editingMethod.id, payload);
            } else {
                await createPaymentMethod(
                    { ...payload, housing_complex_id: profile?.housing_complex_id! },
                    user!.id
                );
            }
            setFormVisible(false);
            loadData();
        } catch (error: any) {
            showAlert('Gagal', error?.userMessage || 'Gagal menyimpan.', 'error');
        } finally { setIsSaving(false); }
    };

    const handleToggle = async (method: PaymentMethod) => {
        try { await updatePaymentMethod(method.id, { is_active: !method.is_active }); loadData(); }
        catch (e) { console.error(e); }
    };

    const handleDelete = (method: PaymentMethod) => {
        setAlertConfig({
            title: 'Hapus Metode?',
            message: `Yakin hapus "${method.method_name}"?`,
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: () => setAlertVisible(false) },
                { text: 'Hapus', style: 'destructive', onPress: async () => { setAlertVisible(false); await deletePaymentMethod(method.id); loadData(); } },
            ],
        });
        setAlertVisible(true);
    };

    const showAlert = (title: string, message: string, type: string) => {
        setAlertConfig({ title, message, type, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
        setAlertVisible(true);
    };

    // ====== QR IMAGE PICKER ======

    const pickQrisImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert('Izin Diperlukan', 'Izinkan akses galeri untuk upload QR.', 'warning');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
            aspect: [1, 1],
        });
        if (!result.canceled && result.assets[0]) {
            setForm({ ...form, qris_image_uri: result.assets[0].uri });
        }
    };

    // ====== HELPERS ======

    const getMethodIcon = (type: string) => METHOD_TYPES.find(t => t.value === type)?.icon || 'card';
    const getMethodLabel = (type: string) => METHOD_TYPES.find(t => t.value === type)?.label || type;
    const getEwalletColor = (name: string) => EWALLET_OPTIONS.find(e => e.name === name)?.color || '#666';

    // ====== RENDER ======

    return (
        <SafeAreaView style={st.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7F5" />

            {/* Header */}
            <View style={st.header}>
                <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1B5E20" />
                </TouchableOpacity>
                <Text style={st.headerTitle}>Metode Pembayaran</Text>
                <TouchableOpacity onPress={openAddForm} style={st.addBtn}>
                    <Ionicons name="add-circle" size={28} color="#1B5E20" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={st.center}><ActivityIndicator size="large" color="#1B5E20" /></View>
            ) : (
                <ScrollView
                    contentContainerStyle={st.content}
                    refreshControl={<RefreshControl refreshing={false} onRefresh={loadData} colors={['#1B5E20']} />}
                >
                    {methods.length === 0 ? (
                        <View style={st.emptyBox}>
                            <Ionicons name="card-outline" size={64} color="#CCC" />
                            <Text style={st.emptyTitle}>Belum Ada Metode</Text>
                            <Text style={st.emptySubtext}>Tambahkan metode pembayaran untuk warga.</Text>
                            <CustomButton title="Tambah Metode" onPress={openAddForm} style={{ marginTop: 16 }} />
                        </View>
                    ) : (
                        methods.map(m => renderMethodCard(m))
                    )}
                </ScrollView>
            )}

            {/* Form Modal */}
            {renderFormModal()}

            {/* E-Wallet Picker */}
            {renderEwalletPicker()}

            {/* Bank Picker */}
            {renderBankPicker()}

            <CustomAlertModal visible={alertVisible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} buttons={alertConfig.buttons} onClose={() => setAlertVisible(false)} />
        </SafeAreaView>
    );

    // ====== METHOD CARD ======

    function renderMethodCard(method: PaymentMethod) {
        return (
            <View key={method.id} style={[st.card, !method.is_active && { opacity: 0.55 }]}>
                <View style={st.cardHeader}>
                    <View style={st.cardIconBox}>
                        <Ionicons name={getMethodIcon(method.method_type) as any} size={22} color="#1B5E20" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={st.cardName}>{method.method_name}</Text>
                        <Text style={st.cardType}>{getMethodLabel(method.method_type)}</Text>
                    </View>
                    <View style={[st.badge, { backgroundColor: method.is_active ? '#E8F5E9' : '#FFEBEE' }]}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: method.is_active ? '#2E7D32' : '#C62828' }}>
                            {method.is_active ? 'Aktif' : 'Nonaktif'}
                        </Text>
                    </View>
                </View>

                {/* Info rows */}
                {method.account_number && (
                    <View style={st.infoRow}>
                        <Ionicons name="call-outline" size={14} color="#888" />
                        <Text style={st.infoLabel}>Nomor:</Text>
                        <Text style={st.infoValue}>{method.account_number}</Text>
                    </View>
                )}
                {method.account_holder && (
                    <View style={st.infoRow}>
                        <Ionicons name="person-outline" size={14} color="#888" />
                        <Text style={st.infoLabel}>A/N:</Text>
                        <Text style={st.infoValue}>{method.account_holder}</Text>
                    </View>
                )}

                {/* QR Preview */}
                {method.method_type === 'qris' && method.qris_image_url && (
                    <View style={st.qrPreviewRow}>
                        <Image source={{ uri: method.qris_image_url }} style={st.qrPreviewThumb} resizeMode="contain" />
                        <Text style={st.qrPreviewLabel}>QR Code tersimpan</Text>
                    </View>
                )}

                {method.description && (
                    <Text style={st.cardDesc}>{method.description}</Text>
                )}

                {/* Actions */}
                <View style={st.cardActions}>
                    <TouchableOpacity style={st.actionBtn} onPress={() => handleToggle(method)}>
                        <Ionicons name={method.is_active ? 'eye-off-outline' : 'eye-outline'} size={17} color="#1B5E20" />
                        <Text style={st.actionText}>{method.is_active ? 'Nonaktifkan' : 'Aktifkan'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={st.actionBtn} onPress={() => openEditForm(method)}>
                        <Ionicons name="create-outline" size={17} color="#1B5E20" />
                        <Text style={st.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={st.actionBtn} onPress={() => handleDelete(method)}>
                        <Ionicons name="trash-outline" size={17} color="#C62828" />
                        <Text style={[st.actionText, { color: '#C62828' }]}>Hapus</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ====== FORM MODAL ======

    function renderFormModal() {
        return (
            <Modal visible={isFormVisible} transparent animationType="slide">
                <View style={st.modalOverlay}>
                    <View style={st.modalSheet}>
                        <View style={st.modalHeader}>
                            <Text style={st.modalTitle}>{editingMethod ? 'Edit Metode' : 'Tambah Metode Baru'}</Text>
                            <TouchableOpacity onPress={() => setFormVisible(false)}>
                                <Ionicons name="close" size={24} color="#1B5E20" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                            {/* Type selector */}
                            <Text style={st.formLabel}>Tipe Metode</Text>
                            <View style={st.typeRow}>
                                {METHOD_TYPES.map(t => (
                                    <TouchableOpacity
                                        key={t.value}
                                        style={[st.typeChip, form.method_type === t.value && st.typeChipActive]}
                                        onPress={() => setForm({ ...form, method_type: t.value, method_name: '', account_number: '', qris_image_uri: null })}
                                    >
                                        <Ionicons name={t.icon as any} size={18} color={form.method_type === t.value ? '#FFF' : '#1B5E20'} />
                                        <Text style={[st.typeChipText, form.method_type === t.value && { color: '#FFF' }]}>{t.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* ====== QRIS FORM ====== */}
                            {form.method_type === 'qris' && (
                                <>
                                    <Text style={st.formLabel}>Nama QRIS</Text>
                                    <TextInput
                                        style={st.input}
                                        value={form.method_name}
                                        onChangeText={t => setForm({ ...form, method_name: t })}
                                        placeholder="Contoh: QRIS Mandiri, QRIS BCA"
                                        placeholderTextColor="#999"
                                    />

                                    <Text style={st.formLabel}>Gambar QR Code *</Text>
                                    <TouchableOpacity style={st.qrUploadBox} onPress={pickQrisImage} activeOpacity={0.7}>
                                        {(form.qris_image_uri || form.qris_image_url) ? (
                                            <Image
                                                source={{ uri: form.qris_image_uri || form.qris_image_url! }}
                                                style={st.qrUploadImage}
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <View style={st.qrUploadPlaceholder}>
                                                <Ionicons name="cloud-upload-outline" size={40} color="#1B5E20" />
                                                <Text style={st.qrUploadText}>Tap untuk upload QR Code</Text>
                                                <Text style={st.qrUploadHint}>Format: JPG, PNG</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    {(form.qris_image_uri || form.qris_image_url) && (
                                        <TouchableOpacity style={st.qrChangeBtn} onPress={pickQrisImage}>
                                            <Ionicons name="camera-outline" size={16} color="#1B5E20" />
                                            <Text style={st.qrChangeBtnText}>Ganti Gambar</Text>
                                        </TouchableOpacity>
                                    )}

                                    <Text style={st.formLabel}>Nama Pemegang</Text>
                                    <TextInput
                                        style={st.input}
                                        value={form.account_holder}
                                        onChangeText={t => setForm({ ...form, account_holder: t })}
                                        placeholder="Nama pemilik QRIS"
                                        placeholderTextColor="#999"
                                    />
                                </>
                            )}

                            {/* ====== E-WALLET FORM ====== */}
                            {form.method_type === 'ewallet' && (
                                <>
                                    <Text style={st.formLabel}>Nama E-Wallet *</Text>
                                    <TouchableOpacity style={st.pickerBtn} onPress={() => setShowEwalletPicker(true)}>
                                        {form.method_name ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <View style={[st.ewalletDot, { backgroundColor: getEwalletColor(form.method_name) }]} />
                                                <Text style={st.pickerBtnText}>{form.method_name}</Text>
                                            </View>
                                        ) : (
                                            <Text style={st.pickerBtnPlaceholder}>Pilih E-Wallet...</Text>
                                        )}
                                        <Ionicons name="chevron-down" size={18} color="#888" />
                                    </TouchableOpacity>

                                    <Text style={st.formLabel}>Nomor HP Tujuan *</Text>
                                    <TextInput
                                        style={st.input}
                                        value={form.account_number}
                                        onChangeText={t => setForm({ ...form, account_number: t.replace(/[^0-9]/g, '') })}
                                        placeholder="08123456789"
                                        placeholderTextColor="#999"
                                        keyboardType="phone-pad"
                                    />
                                    {form.account_number.length > 3 && (
                                        <Text style={st.helperPreview}>
                                            Warga akan melihat: {form.account_number}
                                        </Text>
                                    )}

                                    <Text style={st.formLabel}>Nama Pemegang *</Text>
                                    <TextInput
                                        style={st.input}
                                        value={form.account_holder}
                                        onChangeText={t => setForm({ ...form, account_holder: t })}
                                        placeholder="Nama pemilik akun e-wallet"
                                        placeholderTextColor="#999"
                                    />
                                </>
                            )}

                            {/* ====== BANK FORM ====== */}
                            {form.method_type === 'bank_transfer' && (
                                <>
                                    <Text style={st.formLabel}>Nama Bank *</Text>
                                    <TouchableOpacity style={st.pickerBtn} onPress={() => setShowBankPicker(true)}>
                                        {form.method_name ? (
                                            <Text style={st.pickerBtnText}>{form.method_name}</Text>
                                        ) : (
                                            <Text style={st.pickerBtnPlaceholder}>Pilih Bank...</Text>
                                        )}
                                        <Ionicons name="chevron-down" size={18} color="#888" />
                                    </TouchableOpacity>

                                    <Text style={st.formLabel}>Nomor Rekening *</Text>
                                    <TextInput
                                        style={st.input}
                                        value={form.account_number}
                                        onChangeText={t => setForm({ ...form, account_number: t.replace(/[^0-9]/g, '') })}
                                        placeholder="1234567890"
                                        placeholderTextColor="#999"
                                        keyboardType="numeric"
                                    />

                                    <Text style={st.formLabel}>Nama Pemegang Rekening *</Text>
                                    <TextInput
                                        style={st.input}
                                        value={form.account_holder}
                                        onChangeText={t => setForm({ ...form, account_holder: t })}
                                        placeholder="Nama pemilik rekening"
                                        placeholderTextColor="#999"
                                    />
                                </>
                            )}

                            {/* Description — all types */}
                            <Text style={st.formLabel}>Instruksi Tambahan</Text>
                            <TextInput
                                style={[st.input, { height: 80, textAlignVertical: 'top' }]}
                                value={form.description}
                                onChangeText={t => setForm({ ...form, description: t })}
                                placeholder="Catatan khusus untuk warga (opsional)"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                            />
                            <View style={{ height: 30 }} />
                        </ScrollView>

                        <View style={st.modalFooter}>
                            <CustomButton title="Batal" onPress={() => setFormVisible(false)} variant="outline" style={{ flex: 1 }} />
                            <CustomButton title={editingMethod ? 'Simpan' : 'Tambah'} onPress={handleSave} loading={isSaving} style={{ flex: 1, marginLeft: 10 }} />
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    // ====== E-WALLET PICKER MODAL ======

    function renderEwalletPicker() {
        return (
            <Modal visible={showEwalletPicker} transparent animationType="fade">
                <TouchableOpacity style={st.pickerOverlay} activeOpacity={1} onPress={() => setShowEwalletPicker(false)}>
                    <View style={st.pickerSheet}>
                        <Text style={st.pickerSheetTitle}>Pilih E-Wallet</Text>
                        {EWALLET_OPTIONS.map(ew => (
                            <TouchableOpacity
                                key={ew.name}
                                style={[st.pickerOption, form.method_name === ew.name && st.pickerOptionActive]}
                                onPress={() => {
                                    setForm({ ...form, method_name: ew.name });
                                    setShowEwalletPicker(false);
                                }}
                            >
                                <View style={[st.ewalletDot, { backgroundColor: ew.color }]} />
                                <Text style={[st.pickerOptionText, form.method_name === ew.name && { color: '#1B5E20', fontWeight: '700' }]}>{ew.name}</Text>
                                {form.method_name === ew.name && <Ionicons name="checkmark" size={20} color="#1B5E20" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }

    // ====== BANK PICKER MODAL ======

    function renderBankPicker() {
        return (
            <Modal visible={showBankPicker} transparent animationType="fade">
                <TouchableOpacity style={st.pickerOverlay} activeOpacity={1} onPress={() => setShowBankPicker(false)}>
                    <View style={st.pickerSheet}>
                        <Text style={st.pickerSheetTitle}>Pilih Bank</Text>
                        {BANK_OPTIONS.map(bank => (
                            <TouchableOpacity
                                key={bank}
                                style={[st.pickerOption, form.method_name === bank && st.pickerOptionActive]}
                                onPress={() => {
                                    setForm({ ...form, method_name: bank });
                                    setShowBankPicker(false);
                                }}
                            >
                                <Ionicons name="business" size={18} color={form.method_name === bank ? '#1B5E20' : '#888'} />
                                <Text style={[st.pickerOptionText, form.method_name === bank && { color: '#1B5E20', fontWeight: '700' }]}>{bank}</Text>
                                {form.method_name === bank && <Ionicons name="checkmark" size={20} color="#1B5E20" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
}

// ====== STYLES ======

const st = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7F5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 48 : 16, paddingBottom: 12, backgroundColor: '#FFF',
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20', flex: 1, marginLeft: 10 },
    addBtn: { padding: 5 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 16, paddingBottom: 40 },
    emptyBox: { alignItems: 'center', paddingVertical: 60, backgroundColor: '#FFF', borderRadius: 20, padding: 30 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 16 },
    emptySubtext: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8 },

    // Method card
    card: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    cardIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    cardName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    cardType: { fontSize: 12, color: '#888', marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3 },
    infoLabel: { fontSize: 12, color: '#888' },
    infoValue: { fontSize: 13, fontWeight: '600', color: '#333' },
    qrPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    qrPreviewThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#F5F5F5' },
    qrPreviewLabel: { fontSize: 12, color: '#1B5E20', fontWeight: '500' },
    cardDesc: { fontSize: 12, color: '#888', fontStyle: 'italic', marginTop: 6, lineHeight: 18 },
    cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 14, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { fontSize: 12, fontWeight: '600', color: '#1B5E20' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#F5F7F5', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20' },
    modalFooter: { flexDirection: 'row', padding: 20, gap: 10 },

    // Form
    formLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#E0E0E0' },
    helperPreview: { fontSize: 12, color: '#1B5E20', marginTop: 6, fontWeight: '500' },

    // Type selector
    typeRow: { flexDirection: 'row', gap: 8 },
    typeChip: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
        paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E0E0',
    },
    typeChipActive: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
    typeChipText: { fontSize: 11, fontWeight: '600', color: '#555' },

    // QR Upload
    qrUploadBox: {
        borderWidth: 2, borderColor: '#1B5E20', borderStyle: 'dashed', borderRadius: 16,
        overflow: 'hidden', backgroundColor: '#FAFFF5', minHeight: 200, alignItems: 'center', justifyContent: 'center',
    },
    qrUploadImage: { width: '100%', height: 250 },
    qrUploadPlaceholder: { alignItems: 'center', padding: 30 },
    qrUploadText: { fontSize: 14, fontWeight: '600', color: '#1B5E20', marginTop: 10 },
    qrUploadHint: { fontSize: 12, color: '#888', marginTop: 4 },
    qrChangeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F1F8E9' },
    qrChangeBtnText: { fontSize: 13, fontWeight: '600', color: '#1B5E20' },

    // Picker button
    pickerBtn: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
        borderWidth: 1, borderColor: '#E0E0E0',
    },
    pickerBtnText: { fontSize: 14, color: '#333', fontWeight: '500' },
    pickerBtnPlaceholder: { fontSize: 14, color: '#999' },
    ewalletDot: { width: 12, height: 12, borderRadius: 6 },

    // Picker overlay
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 30 },
    pickerSheet: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, maxHeight: '60%' },
    pickerSheetTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20', marginBottom: 16, textAlign: 'center' },
    pickerOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 },
    pickerOptionActive: { backgroundColor: '#F1F8E9' },
    pickerOptionText: { fontSize: 15, color: '#333', flex: 1 },
});
