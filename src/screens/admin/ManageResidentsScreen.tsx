import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { fetchVerifiedResidents, createVerifiedResident, deleteVerifiedResident, VerifiedResident } from '../../services/adminService';
import { CustomHeader } from '../../components/CustomHeader';
import { Colors } from '../../constants/Colors';
import { styles } from './ManageResidentsStyles';

export default function ManageResidentsScreen() {
    const router = useRouter();
    const [residents, setResidents] = useState<VerifiedResident[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [nik, setNik] = useState('');
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [rtRw, setRtRw] = useState('');
    const [role, setRole] = useState<'warga' | 'security'>('warga');

    useEffect(() => {
        loadResidents();
    }, []);

    const loadResidents = async () => {
        setIsLoading(true);
        try {
            const data = await fetchVerifiedResidents();
            setResidents(data);
        } catch (error) {
            console.error('Failed to load residents:', error);
            Alert.alert('Error', 'Gagal memuat data warga');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddResident = async () => {
        if (!nik || !fullName) {
            Alert.alert('Peringatan', 'NIK dan Nama Lengkap wajib diisi');
            return;
        }

        setIsSubmitting(true);
        try {
            await createVerifiedResident({
                nik,
                full_name: fullName,
                address,
                rt_rw: rtRw || '005/003',
                role,
            });
            Alert.alert('Sukses', 'Data warga berhasil ditambahkan');
            setShowForm(false);
            resetForm();
            loadResidents();
        } catch (error: any) {
            console.error('Failed to add resident:', error);
            Alert.alert('Gagal', error.message || 'Gagal menambahkan warga');
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
                            loadResidents();
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
        setAddress('');
        setRtRw('');
        setRole('warga');
    };

    const renderItem = ({ item }: { item: VerifiedResident }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.cardTitle}>{item.full_name}</Text>
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

            <View style={styles.cardBody}>
                <Text style={styles.cardText}>Alamat: {item.address || '-'}</Text>
                <Text style={styles.cardText}>RT/RW: {item.rt_rw}</Text>

                <View style={styles.tokenContainer}>
                    <Text style={styles.tokenLabel}>Kode Akses:</Text>
                    <Text style={styles.tokenValue}>{item.access_token}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.deleteButton}
                >
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                    <Text style={styles.deleteText}>Hapus</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <CustomHeader title="Kelola Warga" showBack={true} />

            {showForm ? (
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Tambah Warga Baru</Text>

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
                    <TextInput
                        style={styles.input}
                        placeholder="Alamat Lengkap"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="RT/RW (Default: 005/003)"
                        value={rtRw}
                        onChangeText={setRtRw}
                    />

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
                            onPress={handleAddResident}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.buttonText}>Simpan</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.actionHeader}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowForm(true)}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                        <Text style={styles.addButtonText}>Tambah Warga</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={residents}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Belum ada data warga.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}


