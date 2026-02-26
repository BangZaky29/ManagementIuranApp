import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseConfig';
import { Visitor, VisitorType } from '../../../services/guestService';
import { useAuth } from '../../../contexts/AuthContext';

export function useWargaGuestViewModel() {
    const { user } = useAuth();
    const [myVisitors, setMyVisitors] = useState<Visitor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState<VisitorType>('tamu');
    const [formPurpose, setFormPurpose] = useState('');

    // Alert Handling
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '', message: '', type: 'info' as any, buttons: [] as any[]
    });
    const hideAlert = () => setAlertVisible(false);

    const loadData = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            // Warga only fetches visitors where they are the destination OR creator
            const { data, error } = await supabase
                .from('visitors')
                .select('*')
                .or(`destination_user_id.eq.${user.id},created_by.eq.${user.id}`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setMyVisitors(data || []);
        } catch (error) {
            console.error('Failed to load guest book data', error);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handlePreRegisterGuest = async () => {
        if (!user?.id) return;

        if (!formName.trim() || !formPurpose.trim()) {
            setAlertConfig({
                title: 'Data Tidak Lengkap', message: 'Harap isi semua kolom wajib (Nama dan Keperluan).',
                type: 'warning', buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }

        setIsSubmitting(true);
        try {
            // Generate a random 6-digit PIN
            const pinCode = Math.floor(100000 + Math.random() * 900000).toString();

            const { error } = await supabase.from('visitors').insert({
                visitor_name: formName.trim(),
                visitor_type: formType,
                destination_user_id: user.id,
                created_by: user.id,
                purpose: formPurpose.trim(),
                status: 'pending',
                pin_code: pinCode
            });

            if (error) throw error;

            // Success
            setAddModalVisible(false);
            setFormName('');
            setFormPurpose('');
            loadData(); // Refresh list

            setAlertConfig({
                title: 'Undangan Berhasil Dibuat',
                message: `Beritahu tamu Anda PIN ini: ${pinCode}\nTunjukan PIN ini ke satpam saat di gerbang.`,
                type: 'success', buttons: [{ text: 'Tutup', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } catch (error) {
            setAlertConfig({
                title: 'Gagal', message: 'Gagal membuat undangan. Coba lagi.',
                type: 'error', buttons: [{ text: 'Tutup', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        myVisitors, isLoading, isSubmitting,
        addModalVisible, setAddModalVisible,
        formName, setFormName, formType, setFormType, formPurpose, setFormPurpose,
        handlePreRegisterGuest, loadData,
        alertVisible, alertConfig, hideAlert
    };
}
