import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { fetchVerifiedResidents, createVerifiedResident, deleteVerifiedResident, updateVerifiedResident, fetchHousingComplexes, VerifiedResident, exportResidents, importResidents } from '../../../services/adminService';
import { useAuth } from '../../../contexts/AuthContext';
import { CustomHeader } from '../../../components/CustomHeader';
import { CustomAlertModal } from '../../../components/CustomAlertModal';
import { Colors } from '../../../constants/Colors';
import { styles } from './ManageUsersStyles';

export default function ManageUsersScreen() {
    const router = useRouter();
    const { profile } = useAuth(); // Get logged in admin profile
    const [residents, setResidents] = useState<VerifiedResident[]>([]);
    const [housingComplexes, setHousingComplexes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // UI State
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [nik, setNik] = useState('');
    const [fullName, setFullName] = useState('');
    // Address & RT/RW Removed as per user request (Plan B)
    // const [rtRw, setRtRw] = useState(''); -> REMOVED
    const [role, setRole] = useState<'warga' | 'security'>('warga');
    const [selectedComplexId, setSelectedComplexId] = useState<number | null>(null);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [residentsData, complexesData] = await Promise.all([
                fetchVerifiedResidents(),
                fetchHousingComplexes()
            ]);
            setResidents(residentsData);
            setHousingComplexes(complexesData);
        } catch (error) {
            console.error('Failed to load data:', error);
            Alert.alert('Error', 'Gagal memuat data');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-set complex ID when opening form for ADD
    useEffect(() => {
        if (showForm && !isEditing && profile?.housing_complex_id) {
            setSelectedComplexId(profile.housing_complex_id);
        }
    }, [showForm, isEditing, profile]);

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const handleEdit = (item: VerifiedResident) => {
        setNik(item.nik);
        setFullName(item.full_name);
        // setRtRw(item.rt_rw); -> REMOVED
        setRole(item.role);
        setSelectedComplexId(item.housing_complex_id || null);
        setEditId(item.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!nik || !fullName) {
            Alert.alert('Peringatan', 'NIK dan Nama Lengkap wajib diisi');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && editId) {
                // Update
                // We'll allow updating housing_complex_id if we had a dropdown, but for now just basic info
                // Per requirement: housing complex is "input manual aja untuk nam cluster admin login ini" in the DB.
                // So we won't update it from here unless we add a specific field. 
                // Currently user only asked to display it.
                await updateVerifiedResident(editId, {
                    nik,
                    role,
                    housing_complex_id: selectedComplexId,
                });
                Alert.alert('Sukses', 'Data warga berhasil diperbarui');
            } else {
                // Create
                // If the current admin has a housing_complex_id, ideally we'd assign it here.
                // But since we don't have the admin's profile data fetched here explicitly,
                // we'll rely on the default behavior or manual DB update as per user instruction.
                await createVerifiedResident({
                    nik,
                    full_name: fullName,
                    // rt_rw: rtRw || '005/003', -> REMOVED
                    role,
                    housing_complex_id: selectedComplexId,
                });
                Alert.alert('Sukses', 'Data warga berhasil ditambahkan');
            }
            setShowForm(false);
            resetForm();
            loadData(); // Reload both to be safe
        } catch (error: any) {
            console.error('Failed to save resident:', error);
            Alert.alert('Gagal', error.message || 'Gagal menyimpan data');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Konfirmasi Hapus',
            'Apakah anda yakin ingin menghapus data ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteVerifiedResident(id);
                            loadData();
                        } catch (error) {
                            Alert.alert('Error', 'Gagal menghapus data');
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setNik('');
        setFullName('');
        // setRtRw(''); -> REMOVED
        setRole('warga');
        setIsEditing(false);
        setEditId(null);
        setSelectedComplexId(null);
    };

    const [activeRoleFilter, setActiveRoleFilter] = useState<'Semua' | 'warga' | 'security'>('Semua');
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [importRole, setImportRole] = useState<'warga' | 'security'>('warga');
    const [isImporting, setIsImporting] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'success' | 'info' | 'warning' | 'error';
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });

    const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

    // Import/Export Imports
    // const { exportResidents, importResidents } = require('../../../services/adminService'); // Switched to top-level import for types

    const handleExport = () => {
        setShowExportModal(true);
    };

    const performExport = async (format: 'xlsx' | 'csv', action: 'share' | 'download') => {
        try {
            // Close modal first
            setShowExportModal(false);

            setIsLoading(true);
            await exportResidents(profile?.housing_complex_id, format, action); // Filter by admin's complex if exists

            setAlertConfig({
                visible: true,
                title: 'Sukses',
                message: 'Data berhasil diekspor dan dibagikan',
                type: 'success'
            });
        } catch (error: any) {
            setAlertConfig({
                visible: true,
                title: 'Gagal',
                message: error.message,
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async () => {
        try {
            setIsImporting(true);
            const result = await importResidents(importRole, profile?.housing_complex_id || selectedComplexId);

            if (result) {
                const message = `Sukses: ${result.success}, Gagal: ${result.failed}\n${result.errors.join('\n')}`;
                // Determine alert type based on results
                let type: 'success' | 'warning' = 'success';
                if (result.failed > 0) type = 'warning';

                setAlertConfig({
                    visible: true,
                    title: 'Hasil Import',
                    message: message,
                    type: type
                });

                loadData();
                setShowImportModal(false);
            }
        } catch (error: any) {
            if (error.message !== 'Import dibatalkan') {
                setAlertConfig({
                    visible: true,
                    title: 'Gagal',
                    message: error.message,
                    type: 'error'
                });
            }
        } finally {
            setIsImporting(false);
        }
    };

    const filteredResidents = useMemo(() => {
        let result = residents;

        // 1. Filter by Role
        if (activeRoleFilter !== 'Semua') {
            result = result.filter(item => item.role === activeRoleFilter);
        }

        // 2. Filter by Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.full_name.toLowerCase().includes(lowerQuery) ||
                item.nik.includes(lowerQuery)
            );
        }

        return result;
    }, [residents, searchQuery, activeRoleFilter]);

    const renderItem = ({ item }: { item: VerifiedResident }) => {
        const isExpanded = expandedId === item.id;
        // ... (rest of renderItem code remains same, just ensuring context)
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => toggleExpand(item.id)}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    {/* Avatar Code Block */}
                    {(() => {
                        const user = item.user as any;
                        const avatarUrl = Array.isArray(user) ? user[0]?.avatar_url : user?.avatar_url;

                        return avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#eee' }}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.green1, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                <Ionicons name="person" size={20} color={Colors.primary} />
                            </View>
                        );
                    })()}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.full_name}</Text>
                        {item.housing_complexes?.name && (
                            <Text style={styles.clusterName}>{item.housing_complexes.name}</Text>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <View style={[styles.roleBadge, { backgroundColor: item.role === 'security' ? '#2196F3' : Colors.green3 }]}>
                                <Text style={styles.roleBadgeText}>{item.role === 'security' ? 'Security' : 'Warga'}</Text>
                            </View>
                            <Text style={[styles.cardSubtitle, { marginLeft: 8 }]}>NIK: {item.nik}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: item.is_claimed ? Colors.success : Colors.warning }]}>
                        <Text style={styles.statusText}>{item.is_claimed ? 'Aktif' : 'Belum Daftar'}</Text>
                    </View>
                </View>

                {isExpanded && (
                    <View style={styles.cardBody}>
                        {/* RT/RW Removed from View */}
                        {/* Note: Address is usually null now for new users until they register/update */}

                        <View style={styles.tokenContainer}>
                            <Text style={styles.tokenLabel}>Kode Akses:</Text>
                            <Text style={styles.tokenValue}>{item.access_token}</Text>
                        </View>

                        <View style={styles.cardFooter}>
                            <TouchableOpacity
                                onPress={() => handleEdit(item)}
                                style={[styles.actionButton, styles.editButton]}
                            >
                                <Ionicons name="pencil" size={16} color="#1565C0" />
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleDelete(item.id)}
                                style={[styles.actionButton, styles.deleteButton]}
                            >
                                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                                <Text style={styles.deleteText}>Hapus</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <CustomHeader title="Kelola User" showBack={false} />

            {/* Search */}
            <View style={styles.filterContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari Nama, NIK..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Chips & Actions */}
            <View style={styles.filterChipsContainer}>
                <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
                    {(['Semua', 'warga', 'security'] as const).map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, activeRoleFilter === filter && styles.filterChipActive]}
                            onPress={() => setActiveRoleFilter(filter)}
                        >
                            <Text style={[styles.filterChipText, activeRoleFilter === filter && styles.filterChipTextActive]}>
                                {filter === 'Semua' ? 'All' : filter === 'warga' ? 'Warga' : 'Security'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Import/Export Buttons */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={styles.actionIconButton} onPress={handleExport}>
                        <Ionicons name="download-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIconButton} onPress={() => setShowImportModal(true)}>
                        <Ionicons name="cloud-upload-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredResidents}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
                            <Text style={styles.emptyText}>Belum ada data warga.</Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => { resetForm(); setShowForm(true); }}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#FFF" />
            </TouchableOpacity>

            {/* Modal Form */}
            <Modal
                visible={showForm}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowForm(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowForm(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                style={styles.formContainer}
                            >
                                <Text style={styles.formTitle}>
                                    {isEditing ? 'Edit Data User' : 'Tambah User Baru'}
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    placeholder="NIK (Wajib)"
                                    value={nik}
                                    onChangeText={setNik}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nama Lengkap (Wajib)"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                                {role === 'warga' && (
                                    // RT/RW Input Removed
                                    null
                                )}

                                <View style={{ marginBottom: 16 }}>
                                    <Text style={[styles.roleLabel, { marginBottom: 8 }]}>Cluster / Apartemen:</Text>
                                    <View style={{
                                        backgroundColor: '#F5F7FA',
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: '#E0E0E0',
                                        overflow: 'hidden'
                                    }}>
                                        {housingComplexes.map((complex) => (
                                            <TouchableOpacity
                                                key={complex.id}
                                                onPress={() => setSelectedComplexId(complex.id)}
                                                style={{
                                                    padding: 12,
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    backgroundColor: selectedComplexId === complex.id ? '#E3F2FD' : 'transparent',
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: '#EEE'
                                                }}
                                            >
                                                <Text style={{
                                                    color: selectedComplexId === complex.id ? Colors.primary : Colors.textPrimary,
                                                    fontWeight: selectedComplexId === complex.id ? 'bold' : 'normal'
                                                }}>
                                                    {complex.name}
                                                </Text>
                                                {selectedComplexId === complex.id && (
                                                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                        {housingComplexes.length === 0 && (
                                            <Text style={{ padding: 12, color: Colors.textSecondary, fontStyle: 'italic' }}>
                                                Belum ada data cluster. Hubungi Super Admin.
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.roleContainer}>
                                    <Text style={styles.roleLabel}>Peran:</Text>
                                    <View style={styles.roleSelector}>
                                        <TouchableOpacity
                                            style={[styles.roleOption, role === 'warga' && styles.roleOptionActive]}
                                            onPress={() => setRole('warga')}
                                        >
                                            <Ionicons name="people" size={16} color={role === 'warga' ? '#FFF' : Colors.textSecondary} />
                                            <Text style={[styles.roleText, role === 'warga' && styles.roleTextActive]}>Warga</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.roleOption, role === 'security' && styles.roleOptionActive]}
                                            onPress={() => setRole('security')}
                                        >
                                            <Ionicons name="shield-checkmark" size={16} color={role === 'security' ? '#FFF' : Colors.textSecondary} />
                                            <Text style={[styles.roleText, role === 'security' && styles.roleTextActive]}>Security</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.formActions}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={() => { setShowForm(false); resetForm(); }}
                                    >
                                        <Text style={styles.buttonTextCancel}>Batal</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.saveButton]}
                                        onPress={handleSave}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <Text style={styles.buttonText}>Simpan</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Import Modal */}
            <Modal
                visible={showImportModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowImportModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.formContainer, { maxHeight: 'auto' }]}>
                        <Text style={styles.formTitle}>Import Data Warga</Text>

                        <Text style={{ textAlign: 'center', marginBottom: 20, color: Colors.textSecondary }}>
                            Pastikan file Excel/CSV anda memiliki kolom "nik" dan "Nama Lengkap".
                        </Text>

                        <View style={styles.roleContainer}>
                            <Text style={styles.roleLabel}>Import Sebagai:</Text>
                            <View style={styles.roleSelector}>
                                <TouchableOpacity
                                    style={[styles.roleOption, importRole === 'warga' && styles.roleOptionActive]}
                                    onPress={() => setImportRole('warga')}
                                >
                                    <Ionicons name="people" size={16} color={importRole === 'warga' ? '#FFF' : Colors.textSecondary} />
                                    <Text style={[styles.roleText, importRole === 'warga' && styles.roleTextActive]}>Warga</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.roleOption, importRole === 'security' && styles.roleOptionActive]}
                                    onPress={() => setImportRole('security')}
                                >
                                    <Ionicons name="shield-checkmark" size={16} color={importRole === 'security' ? '#FFF' : Colors.textSecondary} />
                                    <Text style={[styles.roleText, importRole === 'security' && styles.roleTextActive]}>Security</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.formActions}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setShowImportModal(false)}
                                disabled={isImporting}
                            >
                                <Text style={styles.buttonTextCancel}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleImport}
                                disabled={isImporting}
                            >
                                {isImporting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Pilih File</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Export Modal */}
            <Modal
                visible={showExportModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowExportModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.formContainer, { maxHeight: 'auto' }]}>
                        <Text style={styles.formTitle}>Ekspor Data Warga</Text>

                        <Text style={{ textAlign: 'center', marginBottom: 20, color: Colors.textSecondary }}>
                            Pilih format dan metode ekspor.
                        </Text>

                        <View style={{ gap: 16, marginBottom: 24 }}>
                            {/* Excel Section */}
                            <View style={{
                                backgroundColor: '#E8F5E9',
                                padding: 16,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: Colors.green3
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <Ionicons name="document-text" size={24} color={Colors.green5} />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.green5 }}>Excel (.xlsx)</Text>
                                        <Text style={{ fontSize: 12, color: Colors.green4 }}>Format standar spreadsheet</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    <TouchableOpacity
                                        style={[styles.button, { flex: 1, backgroundColor: Colors.green5, paddingVertical: 8 }]}
                                        onPress={() => performExport('xlsx', 'download')}
                                    >
                                        <Ionicons name="download-outline" size={16} color="#FFF" style={{ marginRight: 4 }} />
                                        <Text style={[styles.buttonText, { fontSize: 12 }]}>Simpan</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, { flex: 1, backgroundColor: Colors.green4, paddingVertical: 8 }]}
                                        onPress={() => performExport('xlsx', 'share')}
                                    >
                                        <Ionicons name="share-social-outline" size={16} color="#FFF" style={{ marginRight: 4 }} />
                                        <Text style={[styles.buttonText, { fontSize: 12 }]}>Bagikan</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* CSV Section */}
                            <View style={{
                                backgroundColor: '#E3F2FD',
                                padding: 16,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: '#90CAF9'
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <Ionicons name="code-download" size={24} color="#1565C0" />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1565C0' }}>CSV (.csv)</Text>
                                        <Text style={{ fontSize: 12, color: '#1976D2' }}>Format teks terpisah koma</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    <TouchableOpacity
                                        style={[styles.button, { flex: 1, backgroundColor: '#1565C0', paddingVertical: 8 }]}
                                        onPress={() => performExport('csv', 'download')}
                                    >
                                        <Ionicons name="download-outline" size={16} color="#FFF" style={{ marginRight: 4 }} />
                                        <Text style={[styles.buttonText, { fontSize: 12 }]}>Simpan</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, { flex: 1, backgroundColor: '#1976D2', paddingVertical: 8 }]}
                                        onPress={() => performExport('csv', 'share')}
                                    >
                                        <Ionicons name="share-social-outline" size={16} color="#FFF" style={{ marginRight: 4 }} />
                                        <Text style={[styles.buttonText, { fontSize: 12 }]}>Bagikan</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.formActions}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton, { flex: 1 }]}
                                onPress={() => setShowExportModal(false)}
                            >
                                <Text style={styles.buttonTextCancel}>Batal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Custom Alert Modal */}
            <CustomAlertModal
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={hideAlert}
            />
        </View>
    );
}
