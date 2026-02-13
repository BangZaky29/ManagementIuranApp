import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { fetchVerifiedResidents, createVerifiedResident, deleteVerifiedResident, VerifiedResident } from '../../services/adminService';

export function useManageResidentsViewModel() {
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
            Alert.alert('Sukses', 'Data berhasil ditambahkan');
            setShowForm(false);
            resetForm();
            loadResidents();
        } catch (error: any) {
            console.error('Failed to add resident:', error);
            Alert.alert('Gagal', error.message || 'Gagal menambahkan data');
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

    return {
        residents,
        isLoading,
        isSubmitting,
        showForm,
        setShowForm,
        nik,
        setNik,
        fullName,
        setFullName,
        address,
        setAddress,
        rtRw,
        setRtRw,
        role,
        setRole,
        resetForm,
        handleAddResident,
        handleDelete,
        loadResidents
    };
}
