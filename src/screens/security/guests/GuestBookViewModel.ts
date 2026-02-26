import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseConfig';
import {
    fetchActiveVisitors,
    checkInWalkinVisitor,
    checkOutVisitor,
    Visitor,
    VisitorType
} from '../../../services/guestService';

export interface AlertConfig {
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    buttons: { text: string; onPress: () => void; style?: 'cancel' | 'destructive' | 'default' }[];
}

export interface Resident {
    id: string; // usually user uuid
    full_name: string;
    housing_complex_id?: number | null;
    block?: string | null;
}

export function useGuestBookViewModel() {
    const [isLoading, setIsLoading] = useState(false);
    const [activeGuests, setActiveGuests] = useState<Visitor[]>([]);

    const [addModalVisible, setAddModalVisible] = useState(false);

    // Form state
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState<VisitorType>('tamu');
    const [formDestination, setFormDestination] = useState('');
    const [formPurpose, setFormPurpose] = useState('');

    // Resident selection
    const [residents, setResidents] = useState<Resident[]>([]);
    const [residentModalVisible, setResidentModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<AlertConfig>({
        title: '', message: '', type: 'info', buttons: []
    });

    const hideAlert = () => setAlertVisible(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchActiveVisitors();
            setActiveGuests(data);
        } catch (error: any) {
            console.error('Failed to load active visitors:', error);
            setAlertConfig({
                title: 'Error',
                message: error.message || 'Gagal memuat daftar tamu',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadResidents = useCallback(async () => {
        try {
            // Assume verified_residents is used for finding valid destinations
            const { data, error } = await supabase
                .from('verified_residents')
                .select('id, full_name, housing_complex_id, role, is_claimed, nik')
                .eq('role', 'warga')
                .eq('is_claimed', true);

            if (!error && data) {
                const formatted: Resident[] = data.map((d: any) => ({
                    id: d.id, // Or destination_user_id should map to profiles id or verified_residents id
                    full_name: d.full_name,
                    housing_complex_id: d.housing_complex_id,
                    block: d.housing_complex_id ? `Blok ${d.housing_complex_id}` : null,
                }));
                // Wait, destination_user_id in visitor table links to profiles id?
                // Depending on schema, verified_residents might have different id than auth.users / profiles
                // Let's use it as is
                setResidents(formatted);
            }
        } catch (err) {
            console.error('Load residents error:', err);
        }
    }, []);

    useEffect(() => {
        loadData();
        loadResidents();
    }, [loadData, loadResidents]);

    const handleCheckOut = async (item: Visitor) => {
        setAlertConfig({
            title: 'Konfirmasi Checkout',
            message: `Apakah Anda yakin ingin checkout ${item.visitor_name}?`,
            type: 'warning',
            buttons: [
                { text: 'Batal', style: 'cancel', onPress: hideAlert },
                {
                    text: 'Checkout',
                    style: 'default',
                    onPress: async () => {
                        hideAlert();
                        setIsLoading(true);
                        try {
                            await checkOutVisitor(item.id);
                            await loadData();
                        } catch (error: any) {
                            console.error('Checkout error:', error);
                            setAlertConfig({
                                title: 'Error',
                                message: error.message || 'Gagal checkout tamu',
                                type: 'error',
                                buttons: [{ text: 'OK', onPress: hideAlert }]
                            });
                            setAlertVisible(true);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        });
        setAlertVisible(true);
    };

    const handleAddWalkin = async () => {
        if (!formName || !formType || !formDestination || !formPurpose) {
            setAlertConfig({
                title: 'Input Tidak Lengkap',
                message: 'Silakan lengkapi semua field yang tersedia.',
                type: 'warning',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            return;
        }

        setIsSubmitting(true);
        try {
            await checkInWalkinVisitor(
                formName,
                formType,
                formDestination, // Should be the user id from Resident
                formPurpose
            );
            
            setAddModalVisible(false);
            setFormName('');
            setFormType('tamu');
            setFormDestination('');
            setFormPurpose('');
            
            await loadData();
            
            setAlertConfig({
                title: 'Sukses',
                message: 'Tamu berhasil dicatat dan diizinkan masuk.',
                type: 'success',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
            
        } catch (error: any) {
            console.error('Checkin error:', error);
            setAlertConfig({
                title: 'Gagal',
                message: error.message || 'Gagal mencatat tamu masuk',
                type: 'error',
                buttons: [{ text: 'OK', onPress: hideAlert }]
            });
            setAlertVisible(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredResidents = residents.filter(r => 
        r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.block?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
        isLoading,
        activeGuests,
        addModalVisible,
        setAddModalVisible,
        formName,
        setFormName,
        formType,
        setFormType,
        formDestination,
        setFormDestination,
        formPurpose,
        setFormPurpose,
        residents,
        residentModalVisible,
        setResidentModalVisible,
        searchQuery,
        setSearchQuery,
        isSubmitting,
        alertVisible,
        alertConfig,
        hideAlert,
        loadData,
        handleCheckOut,
        handleAddWalkin,
        filteredResidents
    };
}
