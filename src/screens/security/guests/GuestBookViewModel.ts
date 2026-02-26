import { useState, useEffect, useCallback } from 'react';
import { fetchActiveVisitors, checkInWalkinVisitor, checkOutVisitor, Visitor, VisitorType } from '../../../services/guestService';
import { supabase } from '../../../lib/supabaseConfig';

export function useGuestBookViewModel() {
    const [activeGuests, setActiveGuests] = useState<Visitor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [residents, setResidents] = useState<{ id: string; full_name: string; block?: string }[]>([]);

    // Form State
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState<VisitorType>('tamu');
    const [formDestination, setFormDestination] = useState(''); // Resident ID
    const [formPurpose, setFormPurpose] = useState('');

    // Alert Handling
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[]
    });
    const hideAlert = () => setAlertVisible(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch remote data in parallel
            const [guests, residentsData] = await Promise.all([
                fetchActiveVisitors(),
                supabase.from('profiles').select('id, full_name, housing_complexes(name)').eq('role', 'warga')
            ]);

            setActiveGuests(guests);
            if (residentsData.data) {
                setResidents(residentsData.data.map(r => ({
                    id: r.id,
                    full_name: r.full_name,
                    block: r.housing_complexes ? (r.housing_complexes as any).name : ''
                })));
            }
        } catch (error) {
            console.error('Failed to load guest book data', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCheckOut = (visitor: Visitor) => {
        setAlertConfig({
            title: 'Guest Checkout',
            message: `Apakah ${visitor.visitor_name} (${visitor.visitor_type}) sudah meninggalkan area perumahan?`,
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Checkout', style: 'destructive', onPress: async () => {
                        hideAlert();
                        try {
                            await checkOutVisitor(visitor.id);
                            loadData(); // Refresh list
                        } catch (error) {
                            setAlertConfig({
                                title: 'Gagal', message: 'Terjadi kesalahan saat checkout.',
                                type: 'error', buttons: [{ text: 'OK', onPress: hideAlert }]
                            });
                            setAlertVisible(true);
                        }
                    }
                }
            ]
        });
        setAlertVisible(true);
    };

    const handleAddWalkin = async () => {
        if (!formName.trim() || !formDestination || !formPurpose.trim()) {
            setAlertConfig({
                title: 'Data Tidak Lengkap', message: 'Harap isi semua kolom wajib (Nama, Tujuan, Keperluan).',
                type: 'warning', buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }

        setIsSubmitting(true);
        try {
            await checkInWalkinVisitor(formName, formType, formDestination, formPurpose);

            // Success
            setAddModalVisible(false);
            setFormName('');
            setFormPurpose('');
            setFormDestination('');
            loadData(); // Refresh list

            setAlertConfig({
                title: 'Tamu Terdaftar', message: `${formName} telah tercatat masuk.`,
                type: 'success', buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } catch (error) {
            setAlertConfig({
                title: 'Gagal', message: 'Gagal mencatat tamu baru. Coba lagi.',
                type: 'error', buttons: [{ text: 'Tutup', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        activeGuests, isLoading, isSubmitting, residents,
        addModalVisible, setAddModalVisible,
        formName, setFormName, formType, setFormType,
        formDestination, setFormDestination, formPurpose, setFormPurpose,
        handleCheckOut, handleAddWalkin, loadData,
        alertVisible, alertConfig, hideAlert
    };
}
