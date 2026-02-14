import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { fetchVerifiedResidents, createVerifiedResident, deleteVerifiedResident, updateVerifiedResident, fetchHousingComplexes, VerifiedResident } from '../../../services/adminService';
import { useAuth } from '../../../contexts/AuthContext';
import { CustomHeader } from '../../../components/CustomHeader';
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
    // Address Removed as per user request
    const [rtRw, setRtRw] = useState('');
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
        setRtRw(item.rt_rw);
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
                    full_name: fullName,
                    rt_rw: rtRw,
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
                    rt_rw: rtRw || '005/003',
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
        setRtRw('');
        setRole('warga');
        setIsEditing(false);
        setEditId(null);
        setSelectedComplexId(null);
    };

    const filteredResidents = useMemo(() => {
        if (!searchQuery) return residents;
        const lowerQuery = searchQuery.toLowerCase();
        return residents.filter(item =>
            item.rt_rw?.toLowerCase().includes(lowerQuery) ||
            item.full_name.toLowerCase().includes(lowerQuery) ||
            item.nik.includes(lowerQuery)
        );
    }, [residents, searchQuery]);

    const renderItem = ({ item }: { item: VerifiedResident }) => {
        const isExpanded = expandedId === item.id;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => toggleExpand(item.id)}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    {/* Avatar */}
                    {/* Avatar */}
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
                        <Text style={styles.cardText}>RT/RW: {item.rt_rw}</Text>
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
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <CustomHeader title="Kelola User" showBack={false} />

            {/* Filter */}
            <View style={styles.filterContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari Nama, NIK, atau RT/RW..."
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
                                    <TextInput
                                        style={styles.input}
                                        placeholder="RT/RW atau BLOK"
                                        value={rtRw}
                                        onChangeText={setRtRw}
                                    />
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
        </SafeAreaView>
    );
}
